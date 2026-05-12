import { useChat } from '@/src/presentation/hooks/useChat';
import { useOtherPresence } from '@/src/presentation/hooks/usePresence';
import { useHeaderHeight } from '@react-navigation/elements';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { FlatList, Image, Keyboard, KeyboardAvoidingView, Text, View } from 'react-native';
import ChatBubble from '@/src/presentation/components/chat/ChatBubble';
import MessageInput from '@/src/presentation/components/chat/MessageInput';
import UCaldasTheme from '../constants/Colors';

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { messages, chatDetails, otherUserName, user, handleAddReaction } = useChat(chatId);

  const flatListRef = useRef<FlatList>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const headerHeight = useHeaderHeight();

  // Obtener presencia del otro usuario
  const otherUserId = chatDetails?.participants?.find((id: string) => id !== user?.uid) ?? null;
  const { isOnline } = useOtherPresence(otherUserId);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerStyle: {
            backgroundColor: UCaldasTheme.azulOscuro,
          },
          headerTintColor: '#fff',
          headerTitleAlign: 'left',
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={{ uri: 'https://www.ucaldas.edu.co/portal/wp-content/uploads/2023/06/Logo_80_anos_Universidad_de_Caldas_Blanco.png' }}
                style={{ width: 70, height: 50, marginRight: 10 }}
                resizeMode="contain"
              />
              <View style={{ maxWidth: 200 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }} numberOfLines={1}>
                    {otherUserName}
                  </Text>
                  {isOnline && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#10b981',
                      }}
                    />
                  )}
                </View>
                <Text style={{ color: isOnline ? '#10b981' : '#d1d5db', fontSize: 11 }} numberOfLines={1}>
                  {isOnline ? 'En línea' : 'Desconectado'}
                </Text>
              </View>
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={70}
      >
        <FlatList
          ref={flatListRef}
          data={[...messages].reverse()}
          keyExtractor={item => item.id}
          inverted={true}
          contentContainerStyle={{ paddingBottom: 10, paddingTop: 10 }}
          renderItem={({ item }) => (
            <ChatBubble
              message={item}
              isOwn={item.senderId === user?.uid}
              onReaction={handleAddReaction}
            />
          )}
        />
        <MessageInput chatId={chatId} />
      </KeyboardAvoidingView>
    </>
  );
}