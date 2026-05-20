import { User, UserProfile, AcademicInfo, SocialStats, Estadisticas } from '../validators/user.schema';
import { Group, GroupMember } from '../validators/group.schema';

export type { User, UserProfile, AcademicInfo, SocialStats, Estadisticas, Group, GroupMember };

// Academic types - Based on backend user-service
export interface Career {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  credits?: number;
  sectionId?: string;
}

export interface Section {
  sectionId: string;
  sectionName: string;
  subjects: Subject[];
}



// Backend returns from getFullProfile use case
export interface AcademicProfile {
  studentId: string;
  userName?: string;
  email?: string;
  facultyId: string;
  facultyName?: string;
  academicLevelId: string;
  academicLevelName?: string;
  formationLevelId: string;
  formationLevelName?: string;
  careerId: string;
  careerName?: string;
  subjects: string[];
  subjectNames?: string[];
  biography?: string;
  phone?: string;
  age?: number | string;
  studyPreference?: string;
  showEmail?: boolean;
  estadisticas?: Estadisticas;
  insignias?: string[];
  mappingId?: string;
}

export interface EventCategory {
  id: string;
  name: string;
  description?: string;
}

// GroupRole now inferred from Zod
export type GroupRole = 'admin' | 'student' | 'moderator' | 'member';

// Event types - Based on backend social-service FirestoreEventRepository
export interface Event {
  // Backend returns: id, ...eventData (type, title, description, location, date, time, duration, imageUrl)
  id: string;
  title: string;
  description?: string;
  location: string;
  date: string;
  time?: string;
  duration?: string;
  type?: 'Cultural' | 'Deportivo' | 'Académico' | 'Social';
  imageUrl?: string;
  groupId?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Extended fields
  attendeeCount?: number;
  maxAttendees?: number;
}

export interface EventAttendee {
  userId: string;
  eventId: string;
  status: AttendeeStatus;
  registeredAt: Date;
}

export enum AttendeeStatus {
  GOING = 'going',
  INTERESTED = 'interested',
  NOT_GOING = 'not_going'
}

// Chat types - Based on backend chat-service repositories
export interface Chat {
  // Backend returns: id, participants, lastMessage, updatedAt
  id: string;
  participants: string[];
  lastMessage: string;
  updatedAt: Date | any;
  
  // Extended fields (not from base API)
  participantsInfo?: {
    [uid: string]: {
      name: string;
    };
  };
  createdAt?: Date;
}

export enum ChatType {
  DIRECT = 'direct',
  GROUP = 'group'
}

export interface Message {
  // Backend returns: id, ...messageData (senderId, text, type, fileUrl, fileName, fileSize, fileType, etc.), createdAt
  id: string;
  senderId: string;
  text: string;
  type?: 'text' | 'file';
  
  // File info
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  
  // Mentions
  hasMention?: boolean;
  mentionedUserIds?: string[];
  
  // Timestamps
  createdAt: Date | any;
  
  // Extended fields
  chatId?: string;
  readBy?: string[];
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system'
}

// Notification types
export interface Notification {
  id: string;
  userId?: string;
  type?: string;
  title?: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt?: Date;
  timestamp?: string;
}

// Mobile alias
export interface AppNotification extends Notification {}

export enum NotificationType {
  GROUP_INVITE = 'group_invite',
  EVENT_INVITE = 'event_invite',
  NEW_MESSAGE = 'new_message',
  GROUP_UPDATE = 'group_update',
  EVENT_UPDATE = 'event_update',
  SYSTEM = 'system'
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
