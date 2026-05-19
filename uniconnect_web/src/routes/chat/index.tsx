import { useEffect, useState, useRef } from 'react'
import { useAuthStore } from '@uniconnect/shared'
import { useLocation } from 'react-router-dom'
import { subscribeToUserChats, db, type FirestoreChat } from '../../lib/firestore'
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore'
import { chatAxios } from '../../lib/chatClient'
import { MessageCircle, Search, Send, Paperclip, FileText, FileImage, FileArchive, File, X, Smile } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useOtherPresence } from '../../hooks/usePresence'

interface ArchivoMetadata {
  url: string
  fileName: string
  extension: string
  mimeType?: string
  tamano?: number
  icon?: string
  detectedType?: string
}

interface Message {
  id: string
  chatId: string
  senderId: string
  text?: string
  content?: string
  type: 'text' | 'file' | 'image'
  fileName?: string
  fileURL?: string
  fileUrl?: string
  fileSize?: number
  reacciones?: Record<string, { count: number; users: string[] }>
  createdAt?: { _seconds: number }
  metadata?: {
    archivo?: ArchivoMetadata
    senderId?: string
    type?: string
  }
}

function formatRelativeTime(timestamp?: { _seconds: number } | { seconds: number }) {
  if (!timestamp) return ''
  const seconds = '_seconds' in timestamp ? timestamp._seconds : timestamp.seconds
  return formatDistanceToNow(new Date(seconds * 1000), { addSuffix: true })
}

function formatTime(timestamp?: { _seconds: number } | { seconds: number }) {
  if (!timestamp) return ''
  const seconds = '_seconds' in timestamp ? timestamp._seconds : timestamp.seconds
  return new Date(seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatLastSeen = (date: Date): string => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

export default function ChatsPage() {
  const { user } = useAuthStore()
  const location = useLocation()
  
  const [chats, setChats] = useState<FirestoreChat[]>([])
  const [selectedChat, setSelectedChat] = useState<FirestoreChat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  
  // File attachment states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Reaction states
  const [reactionPickerFor, setReactionPickerFor] = useState<string | null>(null)
  const [pickerPosition, setPickerPosition] = useState<{ x: number; y: number } | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-select chat when navigated here with state.selectedChatId
  useEffect(() => {
    const { selectedChatId } = (location.state as { selectedChatId?: string }) ?? {}
    if (!selectedChatId || chats.length === 0) return
    const chat = chats.find(c => c.id === selectedChatId)
    if (chat) setSelectedChat(chat)
  }, [location.state, chats])

  // Load chats from Firestore with real-time subscription
  useEffect(() => {
    if (!user?.uid) return
    setLoading(true)
    
    const unsubscribe = subscribeToUserChats(user.uid, (data) => {
      // Filter only 1-on-1 chats
      const directChats = data.filter(c => c.participants?.length === 2)
      setChats(directChats)
      setLoading(false)
    })
    
    return unsubscribe
  }, [user?.uid])

  // Load messages with real-time subscription from Firestore
  useEffect(() => {
    if (!selectedChat) return
    
    const messagesRef = collection(db, 'chats', selectedChat.id, 'messages')
    const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(50))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[]
      setMessages(msgs)
    })
    
    return unsubscribe
  }, [selectedChat?.id])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Close reaction picker when clicking outside
  useEffect(() => {
    const handler = () => {
      setReactionPickerFor(null)
      setPickerPosition(null)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const handleOpenPicker = (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPickerPosition({
      x: Math.min(rect.left, window.innerWidth - 220),
      y: rect.top - 60,
    })
    setReactionPickerFor(messageId)
  }

  const getFileIcon = (nameOrUrl?: string) => {
    if (!nameOrUrl) return <File size={20} />
    const ext = nameOrUrl.split('.').pop()?.toLowerCase() ?? ''
    if (['jpg','jpeg','png','gif','webp'].includes(ext)) return <FileImage size={20} />
    if (['pdf'].includes(ext)) return <FileText size={20} />
    if (['doc','docx'].includes(ext)) return <FileText size={20} />
    if (['xls','xlsx'].includes(ext)) return <FileText size={20} />
    if (['zip','rar'].includes(ext)) return <FileArchive size={20} />
    return <File size={20} />
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    e.target.value = ''
  }

  const handleReact = async (messageId: string, emoji: string) => {
    setReactionPickerFor(null)
    try {
      await chatAxios.post(
        `/api/chats/${selectedChat?.id}/messages/${messageId}/reactions`,
        { emoji, userId: user?.uid }
      )
    } catch (err) {
      console.error('Error agregando reacción:', err)
    }
  }

  const handleSend = async () => {
    if ((!messageText.trim() && !selectedFile) || !selectedChat || sending) return
    setSending(true)
    try {
      // Send file if selected
      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('senderId', user?.uid ?? '')
        if (messageText.trim()) {
          formData.append('text', messageText.trim())
        }

        await chatAxios.post(
          `/api/chats/${selectedChat.id}/files`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        setSelectedFile(null)
        setMessageText('')
      } 
      // Send text message if no file
      else if (messageText.trim()) {
        await chatAxios.post(`/api/chats/${selectedChat.id}/messages`, {
          senderId: user?.uid,
          text: messageText.trim(),
        })
        setMessageText('')
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  const filteredChats = chats.filter(chat => {
    if (!search) return true
    const otherUid = chat.participants.find(uid => uid !== user?.uid)
    const otherName = chat.participantsInfo?.[otherUid ?? '']?.name ?? ''
    return otherName.toLowerCase().includes(search.toLowerCase())
  })

  const getOtherUser = (chat: FirestoreChat) => {
    const otherUid = chat.participants.find(uid => uid !== user?.uid)
    const name = chat.participantsInfo?.[otherUid ?? '']?.name ?? 'Usuario'
    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    return { name, initials, uid: otherUid }
  }

  // Obtener presencia del otro usuario en el chat seleccionado
  const otherUser = selectedChat ? getOtherUser(selectedChat) : null
  const { isOnline, lastSeen } = useOtherPresence(otherUser?.uid ?? null)

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Left: Chat List */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar chats..."
              className="w-full pl-10 pr-3 py-2 text-sm bg-[#F4F6F8] rounded-lg border-0 outline-none focus:ring-2 focus:ring-[#002344]"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002344]" />
            </div>
          )}
          
          {!loading && filteredChats.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <MessageCircle size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No hay conversaciones</p>
            </div>
          )}

          {filteredChats.map(chat => {
            const { name, initials } = getOtherUser(chat)
            const isActive = selectedChat?.id === chat.id
            
            return (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F4F6F8] transition-colors border-b border-gray-100 ${
                  isActive ? 'bg-[#F4F6F8] border-l-4 border-l-[#002344]' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-[#002344] text-white flex items-center justify-center font-semibold flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-gray-900 text-sm truncate">{name}</p>
                  <p className="text-xs text-gray-500 truncate">{chat.lastMessage || 'Sin mensajes'}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {formatRelativeTime(chat.updatedAt as any)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right: Conversation */}
      <div className="flex-1 flex flex-col bg-white">
        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
              <p>Selecciona un chat para comenzar</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="h-16 px-6 border-b border-gray-200 flex items-center gap-3">
              {/* Avatar con indicador de estado */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#002344] text-white flex items-center justify-center font-semibold text-sm">
                  {otherUser?.initials}
                </div>
                {/* Punto verde si está en línea */}
                {isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{otherUser?.name}</p>
                <p className={`text-xs ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                  {isOnline ? (
                    'En línea'
                  ) : lastSeen ? (
                    <span className="text-gray-500">
                      Últ. vez {formatLastSeen(lastSeen)}
                    </span>
                  ) : (
                    'Desconectado'
                  )}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {messages.map(msg => {
                const isOwn = msg.senderId === user?.uid
                
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className="relative group">
                      <div className={`max-w-md ${isOwn ? 'bg-[#002344] text-white' : 'bg-white border border-gray-200'} rounded-2xl px-4 py-2`}>
                        {(() => {
                          const archivo = msg.metadata?.archivo
                          const isFile = msg.type === 'file' || !!archivo

                          if (!isFile) {
                            // Mensaje de texto normal
                            return (
                              <>
                                <p className="text-sm">{msg.text}</p>
                                <p className={`text-xs mt-1 ${isOwn ? 'text-gray-300' : 'text-gray-400'}`}>
                                  {formatTime(msg.createdAt)}
                                </p>
                              </>
                            )
                          }

                          // Mensaje de archivo
                          const fileUrl = archivo?.url
                          const fileName = archivo?.fileName ?? 'Archivo'
                          const extension = archivo?.extension ?? ''
                          const icon = archivo?.icon ?? '📎'

                          return (
                            <div className="space-y-2">
                              {/* Header del archivo */}
                              <div className="flex items-center gap-2 p-2 bg-black/5 rounded-lg">
                                <div className="text-2xl">
                                  {icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate">
                                    {fileName}
                                  </p>
                                  <p className={`text-xs ${isOwn ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {extension}
                                  </p>
                                </div>
                              </div>

                              {/* Botón descargar */}
                              {fileUrl ? (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`block text-center text-xs font-semibold py-1 px-3 rounded ${
                                    isOwn ? 'bg-white text-[#002344]' : 'bg-[#002344] text-white'
                                  } hover:opacity-90 transition-opacity`}
                                >
                                  ⬇ Descargar
                                </a>
                              ) : (
                                <p className={`text-xs text-center ${isOwn ? 'text-gray-300' : 'text-gray-500'}`}>
                                  URL no disponible
                                </p>
                              )}

                              {/* Timestamp */}
                              <p className={`text-xs mt-1 ${isOwn ? 'text-gray-300' : 'text-gray-400'}`}>
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          )
                        })()}
                      </div>

                      {/* Reaction button - appears on hover */}
                      <button
                        onClick={(e) => handleOpenPicker(e, msg.id)}
                        className="absolute -top-4 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:shadow-md z-10"
                      >
                        <Smile size={14} />
                      </button>

                      {/* Existing reactions */}
                      {msg.reacciones && Object.keys(msg.reacciones).length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {Object.entries(msg.reacciones).map(([emoji, data]) => {
                            if (!data.count) return null
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleReact(msg.id, emoji)}
                                className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-full px-2 py-0.5 text-xs hover:bg-gray-50 shadow-sm"
                              >
                                {emoji} {data.count}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              {/* File preview */}
              {selectedFile && (
                <div className="mb-2 flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <div className="text-gray-600">
                    {getFileIcon(selectedFile.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2 bg-[#F4F6F8] rounded-full text-sm outline-none focus:ring-2 focus:ring-[#002344]"
                />
                <button
                  onClick={handleSend}
                  disabled={(!messageText.trim() && !selectedFile) || sending}
                  className="p-2 bg-[#002344] text-white rounded-full hover:bg-[#003355] disabled:bg-gray-300 transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating reaction picker - outside message loop */}
      {reactionPickerFor && pickerPosition && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            left: `${pickerPosition.x}px`,
            top: `${pickerPosition.y}px`,
            zIndex: 9999,
          }}
          className="bg-white border border-gray-200 rounded-full px-3 py-2 shadow-lg flex gap-1"
        >
          {['👍', '❤️', '😂', '🔥', '😮', '😢'].map(emoji => (
            <button
              key={emoji}
              onClick={() => handleReact(reactionPickerFor, emoji)}
              className="text-xl hover:scale-125 transition-transform p-1.5 rounded-lg hover:bg-gray-100"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
