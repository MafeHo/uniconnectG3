import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../../data/sources/FirebaseClient';
import { useNotificationContext } from '../../context/NotificationContext';
import { authStore, getNotificationSeverity, SEVERITY_COLORS } from '@uniconnect/shared';
import { respondToAdminTransfer } from '../../../di/container';
import { UCaldasTheme } from '@/app/constants/Colors';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = authStore((s) => s.user);
  const { notifications, unreadCount, markAsRead: localMarkAsRead, markAllAsRead: localMarkAllAsRead, clearAll: localClearAll, removeNotification: localRemove } = useNotificationContext();
  const router = useRouter();

  const markAsRead = useCallback(async (id: string) => {
    localMarkAsRead(id);
    try { await updateDoc(doc(db, 'notifications', id), { read: true }); } catch { /* noop */ }
  }, [localMarkAsRead]);

  const markAllAsRead = useCallback(async () => {
    localMarkAllAsRead();
    if (!user?.uid) return;
    try {
      const q = query(collection(db, 'notifications'), where('targetUserId', '==', user.uid), where('read', '==', false));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
      await batch.commit();
    } catch { /* noop */ }
  }, [localMarkAllAsRead, user?.uid]);

  const removeNotification = useCallback(async (id: string) => {
    localRemove(id);
    try { await deleteDoc(doc(db, 'notifications', id)); } catch { /* noop */ }
  }, [localRemove]);

  const clearAll = useCallback(async () => {
    localClearAll();
    if (!user?.uid) return;
    try {
      const q = query(collection(db, 'notifications'), where('targetUserId', '==', user.uid));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch { /* noop */ }
  }, [localClearAll, user?.uid]);

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    const groupId = notification.data?.groupId;
    if (groupId) {
      if (notification.type === 'join_request' || notification.type === 'admin_transfer_rejected') {
        router.push(`/group/${groupId}/admin` as any);
      } else if (['new_member', 'admin_transfer_accepted', 'admin_assigned'].includes(notification.type)) {
        router.push(`/group/${groupId}` as any);
      }
    }
    if (notification.type === 'new_event') {
      router.push('/(tabs)/home' as any);
    }
    setIsOpen(false);
  };

  const handleAdminTransfer = async (notif: any, action: 'accept' | 'reject') => {
    if (!user?.uid || !notif.data?.groupId) return;
    try {
      await respondToAdminTransfer.execute(notif.data.groupId, user.uid, action);
      removeNotification(notif.id);
    } catch (error) {
      console.error('Error respondiendo transferencia:', error);
    }
  };

  const getIconName = (type: string | undefined): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'join_request': return 'person-add-outline';
      case 'new_member': return 'checkmark-circle-outline';
      case 'admin_transfer': return 'warning-outline';
      case 'request_rejected':
      case 'admin_transfer_rejected': return 'close-circle-outline';
      case 'new_event': return 'calendar-outline';
      default: return 'notifications-outline';
    }
  };

  const getIconColor = (type: string | undefined): string => {
    const severity = getNotificationSeverity(type);
    return SEVERITY_COLORS[severity].icon;
  };

  return (
    <View style={styles.container}>
      {/* Bell button */}
      <TouchableOpacity onPress={() => setIsOpen(true)} activeOpacity={0.7} style={styles.bellButton}>
        <Ionicons name="notifications-outline" size={24} color="#fff" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Dropdown via Modal */}
      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <Pressable style={styles.panel} onPress={() => { /* prevent close */ }}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Notificaciones</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={markAllAsRead}>
                  <Text style={styles.headerAction}>Marcar todo leído</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={clearAll}>
                  <Ionicons name="trash-outline" size={16} color="#dc3545" />
                </TouchableOpacity>
              </View>
            </View>

            {/* List */}
            <ScrollView style={{ maxHeight: 400 }}>
              {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="notifications-off-outline" size={40} color="#ccc" />
                  <Text style={styles.emptyText}>No tienes notificaciones pendientes</Text>
                </View>
              ) : (
                notifications.map((notif) => {
                  const severity = getNotificationSeverity(notif.type);
                  const severityColors = SEVERITY_COLORS[severity];
                  
                  return (
                    <Pressable
                      key={notif.id}
                      onPress={() => handleNotificationClick(notif)}
                      style={[
                        styles.notifItem,
                        !notif.read && styles.unreadItem,
                        { backgroundColor: !notif.read ? severityColors.bg : '#fff' }
                      ]}
                    >
                    <View style={styles.itemIconContainer}>
                      <Ionicons name={getIconName(notif.type)} size={18} color={getIconColor(notif.type)} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemMessage, !notif.read && styles.unreadMessage]}>
                        {notif.message}
                      </Text>
                      <Text style={styles.itemTime}>
                        {notif.timestamp ? formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true, locale: es }) : ''}
                      </Text>

                      {notif.type === 'admin_transfer' && (
                        <View style={styles.actionRow}>
                          <TouchableOpacity
                            style={styles.acceptBtn}
                            onPress={() => handleAdminTransfer(notif, 'accept')}
                          >
                            <Text style={styles.actionBtnText}>Aceptar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.rejectBtn}
                            onPress={() => handleAdminTransfer(notif, 'reject')}
                          >
                            <Text style={styles.actionBtnText}>Rechazar</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    {!notif.read && <View style={styles.unreadDot} />}
                  </Pressable>
                );
                })
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.footerText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginRight: 15,
  },
  bellButton: {
    padding: 5,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#dc3545',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: UCaldasTheme.azulOscuro,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 15,
  },
  panel: {
    width: 340,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerAction: {
    fontSize: 12,
    color: UCaldasTheme.azulOscuro,
    fontWeight: '600',
  },
  notifItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
    alignItems: 'center',
  },
  unreadItem: {
    // backgroundColor aplicado dinámicamente según severidad
  },
  itemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemMessage: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },
  unreadMessage: {
    color: '#000',
    fontWeight: '500',
  },
  itemTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007bff',
    marginLeft: 10,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  footerText: {
    fontSize: 13,
    color: '#666',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  acceptBtn: {
    backgroundColor: '#28a745',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  rejectBtn: {
    backgroundColor: '#dc3545',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default NotificationCenter;
