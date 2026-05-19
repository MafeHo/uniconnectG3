import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@uniconnect/shared'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firestore'
import { apiClient, groupApi } from '../../main'
import { chatAxios } from '../../lib/chatClient'
import Avatar from '../../components/Avatar'
import Spinner from '../../components/Spinner'
import AddMemberModal from '../../components/groups/AddMemberModal'
import TransferAdminModal from '../../components/groups/TransferAdminModal'
import { useGroupPendingTransfer } from '../../hooks/useGroupPendingTransfer'
import { useNotifSocket } from '../../context/SocketContext'
import {
  Users, ArrowLeft, Calendar, Check, X,
  LayoutDashboard, MessageSquare, ClipboardList,
  Star, ChevronLeft, ChevronRight, MessageCircle,
  UserPlus, Key, Trash2,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface GroupDetail {
  id: string
  name: string
  subjectId?: string
  subjectName: string
  description?: string
  creatorId?: string
  createdAt?: string
  imageURL?: string
  members: { id: string; name: string; role: string }[]
  userStatus: 'admin' | 'member' | 'pending' | 'rejected' | 'none'
}

interface JoinRequest {
  id: string
  userId: string
  userName: string
  groupId: string
  status: 'pending' | 'accepted' | 'rejected'
}

type AdminSection = 'dashboard' | 'requests'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(date: unknown): string {
  if (!date) return 'Sin fecha'
  const d = (date as any)?.toDate ? (date as any).toDate() : new Date(date as string)
  if (isNaN(d.getTime())) return 'Sin fecha'
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
}


// ─── Admin Portal ─────────────────────────────────────────────────────────────

interface AdminPortalProps {
  group: GroupDetail
  pendingRequests: JoinRequest[]
  onRequestAction: (req: JoinRequest, status: 'accepted' | 'rejected') => Promise<void>
  processingId: string | null
  onLeave: () => void
  onRemoveMember: (memberId: string, memberName: string) => Promise<void>
  onTransferAdmin: (newAdminId: string, newAdminName: string) => Promise<void>
  onOpenAddMember: () => void
  onOpenTransferModal: () => void
}

function GroupAdminPortal({ group, pendingRequests, onRequestAction, processingId, onLeave, onRemoveMember, onTransferAdmin, onOpenAddMember, onOpenTransferModal }: AdminPortalProps) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [section, setSection] = useState<AdminSection>('dashboard')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 10
  const members = group.members
  const pageMembers = members.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(members.length / PAGE_SIZE)

  const openDirectChat = async (otherId: string, otherName: string) => {
    if (!user?.uid) return
    try {
      const snap = await getDocs(query(collection(db, 'chats'), where('participants', 'array-contains', user.uid)))
      const existing = snap.docs.find(d => {
        const p: string[] = d.data().participants ?? []
        return p.length === 2 && p.includes(otherId)
      })
      if (existing) {
        navigate('/chat', { state: { selectedChatId: existing.id } })
        return
      }
      const res = await chatAxios.post<{ chatId: string }>('/api/chats', { userA: user.uid, userB: otherId })
      navigate('/chat', { state: { selectedChatId: res.data.chatId } })
    } catch {
      navigate('/chat')
    }
  }

  const navItem = (s: AdminSection, icon: React.ReactNode, label: string, badge?: number) => (
    <button
      onClick={() => setSection(s)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors text-left ${
        section === s ? 'bg-white/15 text-white font-medium' : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="text-xs bg-[#b39055] text-white px-1.5 py-0.5 rounded-full">{badge}</span>
      )}
    </button>
  )

  return (
    <div className="flex min-h-[calc(100vh-56px)] -mx-4 md:-mx-6 -mt-4 md:-mt-0 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 bg-[#002344] flex flex-col overflow-y-auto">
        {/* Back link */}
        <div className="p-4 border-b border-white/10">
          <button
            onClick={() => navigate('/groups')}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={15} />Mis Grupos
          </button>
        </div>

        {/* Group identity */}
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-white font-semibold text-sm truncate">{group.name}</p>
          <p className="text-white/50 text-xs mt-0.5">Portal Administrativo</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          <p className="text-white/40 text-xs uppercase tracking-wider px-4 py-1">Principal</p>
          {navItem('dashboard', <LayoutDashboard size={16} />, 'Dashboard')}

          <p className="text-white/40 text-xs uppercase tracking-wider px-4 py-2 pt-3">Herramientas</p>
          {navItem('requests', <ClipboardList size={16} />, 'Solicitudes', pendingRequests.length)}
          <button
            onClick={() => navigate(`/chat/group/${group.id}`)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors text-left text-white/70 hover:bg-white/10 hover:text-white"
          >
            <MessageSquare size={16} />
            <span className="flex-1">Chat Grupal</span>
          </button>
        </nav>


      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex overflow-hidden bg-[#F4F6F8]">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Section: Dashboard */}
          {section === 'dashboard' && (
            <>
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-[#111827]">{group.name}</h1>
                    <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">ACTIVO</span>
                  </div>
                  <p className="text-sm text-[#6b7280] mt-0.5">
                    {group.subjectName}{group.description ? ` · ${group.description}` : ''}
                  </p>
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border-l-4 border-[#b39055] p-4 flex items-center gap-4 shadow-md">
                  <Users size={28} className="text-[#002344] flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Total Miembros</p>
                    <p className="text-3xl font-bold text-[#111827]">{members.length}</p>
                  </div>
                </div>
                <div
                  className="bg-white rounded-xl border-l-4 border-[#b39055] p-4 flex items-center gap-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSection('requests')}
                >
                  <ClipboardList size={28} className="text-[#002344] flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Solicitudes Pendientes</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-[#111827]">{pendingRequests.length}</p>
                      {pendingRequests.length === 0 && (
                        <p className="text-xs text-green-600">Todo al día</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Members table */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-[#111827]">Miembros</h2>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#002344] text-white text-xs uppercase tracking-wide">
                      <th className="text-left px-5 py-3">Nombre</th>
                      <th className="text-left px-5 py-3">Rol</th>
                      <th className="text-left px-5 py-3">Estado</th>
                      <th className="px-5 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pageMembers.map(m => (
                      <tr key={m.id} className="hover:bg-[#F4F6F8] transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={m.name} size="sm" />
                            <span className="font-medium text-[#111827]">{m.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            m.role === 'admin'
                              ? 'bg-[#002344] text-white'
                              : 'bg-gray-100 text-[#6b7280]'
                          }`}>
                            {m.role === 'admin' ? 'Administrador' : 'Estudiante'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Activo</span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {m.role === 'admin' && <Star size={14} className="text-[#b39055]" />}
                            {m.id !== user?.uid && (
                              <>
                                <button
                                  onClick={() => openDirectChat(m.id, m.name)}
                                  title={`Mensaje a ${m.name}`}
                                  className="p-1 rounded-full hover:bg-[#F4F6F8] transition-colors text-[#002344]"
                                >
                                  <MessageCircle size={14} />
                                </button>
                                {m.role !== 'admin' && (
                                  <>
                                    <button
                                      onClick={() => onTransferAdmin(m.id, m.name)}
                                      title={`Transferir administración a ${m.name}`}
                                      className="p-1 rounded-full hover:bg-[#F4F6F8] transition-colors text-[#b39055]"
                                    >
                                      <Key size={14} />
                                    </button>
                                    <button
                                      onClick={() => onRemoveMember(m.id, m.name)}
                                      title={`Eliminar a ${m.name}`}
                                      className="p-1 rounded-full hover:bg-red-50 transition-colors text-red-500"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination */}
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#6b7280]">
                  <span>Mostrando {Math.min(page * PAGE_SIZE + 1, members.length)}–{Math.min((page + 1) * PAGE_SIZE, members.length)} de {members.length}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
                    ><ChevronLeft size={14} /></button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
                    ><ChevronRight size={14} /></button>
                  </div>
                </div>
              </div>

              {/* Chat button */}
              <button
                onClick={() => navigate(`/chat/group/${group.id}`)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#002344] hover:bg-[#002344]/90 text-white rounded-xl font-medium transition-colors"
              >
                <MessageSquare size={18} />Abrir Chat Grupal
              </button>

              {/* Add member button */}
              <button
                onClick={onOpenAddMember}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#002344]/30 text-[#002344] rounded-xl font-medium hover:bg-[#002344]/5 transition-colors"
              >
                <UserPlus size={18} />Añadir Miembro
              </button>
            </>
          )}

          {/* Section: Requests */}
          {section === 'requests' && (
            <>
              <h1 className="text-xl font-bold text-[#111827]">Solicitudes Pendientes</h1>
              {pendingRequests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <ClipboardList size={48} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-[#111827] font-medium">No hay solicitudes pendientes</p>
                  <p className="text-sm text-[#6b7280] mt-1">Todo al día por el momento.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-50">
                  {pendingRequests.map(req => {
                    const busy = processingId === req.userId
                    return (
                      <div key={req.userId} className="flex items-center gap-4 px-5 py-4">
                        <Avatar name={req.userName} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#111827] truncate">{req.userName}</p>
                          <p className="text-xs text-[#6b7280]">Quiere unirse al grupo</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onRequestAction(req, 'rejected')}
                            disabled={busy}
                            className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                          >Rechazar</button>
                          <button
                            onClick={() => onRequestAction(req, 'accepted')}
                            disabled={busy}
                            className="px-3 py-1.5 text-xs bg-[#002344] text-white rounded-lg hover:bg-[#002344]/90 transition-colors disabled:opacity-50 flex items-center gap-1"
                          >{busy ? <Spinner /> : <><Check size={12} />Aceptar</>}</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

        </div>

        {/* ── Right panel: pending requests ── */}
        <aside className="w-72 flex-shrink-0 border-l border-gray-200 bg-[#F4F6F8] overflow-y-auto p-4 space-y-4 hidden lg:flex lg:flex-col">
          {/* Card: Solicitudes Recientes */}
          <div className="bg-white rounded-xl shadow-md p-4 space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[#111827] text-sm">Solicitudes Recientes</h3>
              {pendingRequests.length > 0 && (
                <span className="text-xs bg-[#b39055] text-white px-1.5 py-0.5 rounded-full">{pendingRequests.length}</span>
              )}
            </div>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-6">
                <ClipboardList size={36} className="text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-[#6b7280]">No hay solicitudes pendientes por el momento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(req => {
                  const busy = processingId === req.userId
                  return (
                    <div key={req.userId} className="p-3 rounded-lg bg-[#F4F6F8] space-y-2">
                      <div className="flex items-center gap-2">
                        <Avatar name={req.userName} size="sm" />
                        <p className="text-sm font-medium text-[#111827] truncate">{req.userName}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onRequestAction(req, 'rejected')}
                          disabled={busy}
                          className="flex-1 py-1 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        ><X size={12} className="inline mr-1" />Rechazar</button>
                        <button
                          onClick={() => onRequestAction(req, 'accepted')}
                          disabled={busy}
                          className="flex-1 py-1 text-xs bg-[#002344] text-white rounded-lg hover:bg-[#002344]/90 transition-colors disabled:opacity-50"
                        >{busy ? '...' : <><Check size={12} className="inline mr-1" />Aceptar</>}</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Card: Abandonar Grupo */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-sm font-semibold text-[#111827] mb-1">Abandonar Grupo</p>
            <p className="text-xs text-[#6b7280] mb-3">Salir de esta comunidad. Debes transferir la administración primero.</p>
            <button
              onClick={onOpenTransferModal}
              className="w-full py-2 text-sm bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg transition-colors shadow-sm"
            >
              Abandonar Grupo
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}


// ─── Member / Visitor View ────────────────────────────────────────────────────

interface MemberViewProps {
  group: GroupDetail
  isMember: boolean
  hasPendingRequest: boolean
  actionLoading: boolean
  onJoin: () => void
  onLeave: () => void
}

function GroupMemberView({ group, isMember, hasPendingRequest, actionLoading, onJoin, onLeave }: MemberViewProps) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const adminMember = group.members.find(m => m.role === 'admin')
  const isAdmin = group.userStatus === 'admin'

  const openDirectChat = async (otherId: string, otherName: string) => {
    if (!user?.uid) return
    try {
      const snap = await getDocs(query(collection(db, 'chats'), where('participants', 'array-contains', user.uid)))
      const existing = snap.docs.find(d => {
        const p: string[] = d.data().participants ?? []
        return p.length === 2 && p.includes(otherId)
      })
      if (existing) {
        navigate('/chat', { state: { selectedChatId: existing.id } })
        return
      }
      const res = await chatAxios.post<{ chatId: string }>('/api/chats', { userA: user.uid, userB: otherId })
      navigate('/chat', { state: { selectedChatId: res.data.chatId } })
    } catch {
      navigate('/chat')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/search" className="flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#111827]">
        <ArrowLeft size={16} />Volver a búsqueda
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4 flex-1">
            {group.imageURL ? (
              <img src={group.imageURL} alt={group.name} className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-[#002344]/10 flex items-center justify-center">
                <Users size={28} className="text-[#002344]" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-[#111827] truncate">{group.name}</h1>
              {group.subjectName && (
                <p className="text-sm text-[#002344] mt-1">{group.subjectName}</p>
              )}
              <div className="flex items-center gap-3 mt-1 text-xs text-[#6b7280]">
                <span className="flex items-center gap-1">
                  <Users size={12} />{group.members.length} miembro{group.members.length !== 1 ? 's' : ''}
                </span>
                {group.createdAt && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />{formatDate(group.createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isMember && !hasPendingRequest && (
            <button onClick={onJoin} disabled={actionLoading}
              className="px-4 py-2 text-sm bg-[#002344] text-white rounded-lg hover:bg-[#002344]/90 transition-colors disabled:opacity-50 flex-shrink-0">
              {actionLoading ? '...' : 'Solicitar unirme'}
            </button>
          )}
          {hasPendingRequest && (
            <button disabled className="px-4 py-2 text-sm bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed flex-shrink-0">
              Solicitud enviada
            </button>
          )}
          {isMember && !isAdmin && (
            <button onClick={onLeave} disabled={actionLoading}
              className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex-shrink-0">
              {actionLoading ? '...' : 'Abandonar grupo'}
            </button>
          )}
        </div>
        {group.description && <p className="text-[#6b7280] text-sm">{group.description}</p>}
      </div>

      {/* Admin */}
      {adminMember && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-[#111827] mb-3">Administrador</h2>
          <div className="flex items-center gap-3">
            <Avatar name={adminMember.name} size="sm" />
            <div>
              <p className="text-sm font-medium text-[#111827]">{adminMember.name}</p>
              <p className="text-xs text-[#6b7280]">Creador del grupo</p>
            </div>
          </div>
        </div>
      )}

      {/* Members */}
      {group.members.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-[#111827] mb-4">Miembros ({group.members.length})</h2>
          <div className="space-y-3">
            {group.members.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F4F6F8] transition-colors">
                <Avatar name={m.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#111827] truncate">{m.name}</p>
                  <p className="text-xs text-[#6b7280]">{m.role === 'admin' ? 'Administrador' : 'Estudiante'}</p>
                </div>
                {m.id !== user?.uid && (
                  <button
                    onClick={() => openDirectChat(m.id, m.name)}
                    title={`Mensaje a ${m.name}`}
                    className="p-1.5 rounded-full hover:bg-[#002344]/10 transition-colors text-[#002344] flex-shrink-0"
                  >
                    <MessageCircle size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Group chat button — visible to all members */}
      {isMember && (
        <button
          onClick={() => navigate(`/chat/group/${group.id}`)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#002344] hover:bg-[#002344]/90 text-white rounded-xl font-medium transition-colors"
        >
          <MessageSquare size={18} />💬 Abrir Chat Grupal
        </button>
      )}
    </div>
  )
}


// ─── Main Page (data fetching + bifurcation) ──────────────────────────────────

export default function GroupDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [group, setGroup] = useState<GroupDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([])
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const fetchedRef = useRef(false)

  const isAdmin = group?.userStatus === 'admin'
  const isMember = group?.userStatus === 'admin' || group?.userStatus === 'member'
  const hasPendingRequest = group?.userStatus === 'pending'

  const pendingTransfer = useGroupPendingTransfer(id)
  const notifSocket = useNotifSocket()

  // Load group
  useEffect(() => {
    if (!id || fetchedRef.current) return
    fetchedRef.current = true
    setLoading(true)
    apiClient.getAxiosInstance()
      .get<GroupDetail>(`/api/groups/${id}${user?.uid ? `?userId=${user.uid}` : ''}`)
      .then(res => setGroup(res.data))
      .catch(() => setError('No se pudo cargar el grupo'))
      .finally(() => setLoading(false))
  }, [id, user?.uid])

  // Listen for admin transfer completion via WebSocket (zero Firestore reads)
  // When the candidate accepts, social-service emits a notification event
  useEffect(() => {
    if (!id || !user?.uid || !pendingTransfer) return
    const handler = (data: { type: string; groupId?: string }) => {
      if (data.groupId === id && (data.type === 'TRANSFERENCIA_ADMIN_ACEPTADA' || data.type === 'admin_transfer_accepted')) {
        navigate('/groups')
      }
    }
    notifSocket?.on('notification', handler)
    return () => { notifSocket?.off('notification', handler) }
  }, [id, user?.uid, pendingTransfer, notifSocket, navigate])

  // Load pending requests (admin only)
  useEffect(() => {
    if (!isAdmin || !id) return
    apiClient.getAxiosInstance()
      .get<JoinRequest[]>(`/api/groups/${id}/requests`)
      .then(res => setPendingRequests((res.data || []).filter(r => r.status === 'pending')))
      .catch(() => setPendingRequests([]))
  }, [isAdmin, id])

  const handleJoinRequest = async () => {
    if (!user?.uid || !group) return
    setActionLoading(true)
    try {
      await apiClient.getAxiosInstance().post(`/api/groups/${id}/requests`, {
        userId: user.uid,
        userName: user.name || user.uid,
      })
      setGroup(g => g ? { ...g, userStatus: 'pending' } : g)
    } catch (e: unknown) {
      const code = (e as any)?.response?.data?.message || ''
      if (code === 'REQUEST_ALREADY_EXISTS') {
        setGroup(g => g ? { ...g, userStatus: 'pending' } : g)
      } else {
        setTimeout(() => alert('No se pudo enviar la solicitud'), 100)
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeave = async () => {
    if (!user?.uid) return
    if (isAdmin) {
      setShowTransferModal(true)
      return
    }
    if (!confirm('¿Seguro que quieres abandonar este grupo?')) return
    setActionLoading(true)
    try {
      await apiClient.getAxiosInstance().delete(`/api/groups/${id}/leave/${user.uid}`)
      navigate('/groups')
    } catch {
      setTimeout(() => alert('No se pudo abandonar el grupo'), 100)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!user?.uid) return
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${memberName} del grupo?`)) return
    try {
      await groupApi.removeMember(id, memberId, user.uid)
      setGroup(g => g ? { ...g, members: g.members.filter(m => m.id !== memberId) } : g)
    } catch (e: unknown) {
      const msg = (e as any)?.response?.data?.message || 'No se pudo eliminar al miembro'
      setTimeout(() => alert(msg), 100)
    }
  }

  const handleTransferAdmin = async (newAdminId: string, newAdminName: string) => {
    if (!user?.uid) return
    if (!confirm(`¿Transferir la administración de '${group?.name}' a ${newAdminName}?`)) return
    try {
      await groupApi.transferAdmin(id, user.uid, newAdminId)
      navigate('/groups')
    } catch (e: unknown) {
      const msg = (e as any)?.response?.data?.message || 'No se pudo transferir la administración'
      setTimeout(() => alert(msg), 100)
    }
  }

  const handleTransferSuccess = () => {
    setShowTransferModal(false)
    setTimeout(() => alert('Solicitud enviada. El sucesor debe aceptar para completar tu salida.'), 100)
  }

  const handleMemberAdded = () => {
    setShowAddMember(false)
    apiClient.getAxiosInstance()
      .get<GroupDetail>(`/api/groups/${id}${user?.uid ? `?userId=${user.uid}` : ''}`)
      .then(res => setGroup(res.data))
  }

  const handleRequestAction = async (request: JoinRequest, status: 'accepted' | 'rejected') => {
    setProcessingId(request.userId)
    try {
      await apiClient.getAxiosInstance().put(
        `/api/groups/${id}/requests/${request.userId}`,
        { status }
      )
      setPendingRequests(prev => prev.filter(r => r.userId !== request.userId))
      if (status === 'accepted') {
        setGroup(g => g ? {
          ...g,
          members: [...g.members, { id: request.userId, name: request.userName, role: 'student' }]
        } : g)
      }
    } catch {
      setTimeout(() => alert(`No se pudo ${status === 'accepted' ? 'aceptar' : 'rechazar'} la solicitud`), 100)
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>

  if (error || !group) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-600">{error ?? 'Grupo no encontrado'}</p>
          <Link to="/search" className="inline-block mt-4 text-[#002344] hover:underline">
            Volver a búsqueda
          </Link>
        </div>
      </div>
    )
  }

  if (isAdmin) {
    return (
      <>
        <GroupAdminPortal
          group={group}
          pendingRequests={pendingRequests}
          onRequestAction={handleRequestAction}
          processingId={processingId}
          onLeave={handleLeave}
          onRemoveMember={handleRemoveMember}
          onTransferAdmin={handleTransferAdmin}
          onOpenAddMember={() => setShowAddMember(true)}
          onOpenTransferModal={() => setShowTransferModal(true)}
        />
        {showAddMember && group && (
          <AddMemberModal
            groupId={group.id}
            subjectId={group.subjectId}
            currentUserId={user?.uid ?? ''}
            members={group.members}
            onClose={() => setShowAddMember(false)}
            onAdded={handleMemberAdded}
          />
        )}
        {showTransferModal && group && (
          <TransferAdminModal
            groupId={group.id}
            adminId={user?.uid ?? ''}
            groupName={group.name}
            members={group.members}
            pendingTransfer={pendingTransfer ? { candidateId: pendingTransfer.candidateId, status: pendingTransfer.status } : null}
            onClose={() => setShowTransferModal(false)}
            onSuccess={handleTransferSuccess}
          />
        )}
      </>
    )
  }

  return (
    <GroupMemberView
      group={group}
      isMember={isMember}
      hasPendingRequest={hasPendingRequest}
      actionLoading={actionLoading}
      onJoin={handleJoinRequest}
      onLeave={handleLeave}
    />
  )
}
