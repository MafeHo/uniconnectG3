import { Group } from './Group';
import { GroupMember } from './GroupMember';
import { Event } from './Event';
import * as admin from 'firebase-admin';

export interface User {
  id?: string;
  name?: string;
  displayName?: string;
  email?: string;
  exists?: boolean;
  [key: string]: unknown;
}

export interface GroupRequest {
  id?: string;
  groupId: string;
  userId: string;
  status: string;
  requestedAt?: Date | unknown;
  [key: string]: unknown;
}

export interface Subject {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface Category {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface IUserRepository {
  findById(userId: string): Promise<User | null>;
  findByIds(userIds: string[]): Promise<User[]>;
  save(userId: string, userData: Partial<User>): Promise<void>;
  findAll(): Promise<User[]>;
  findByUids(uids: string[]): Promise<User[]>;
}

export interface IGroupRepository {
  findById(groupId: string): Promise<Group | null>;
  create(groupData: Partial<Group>): Promise<Group>;
  update(groupId: string, data: Partial<Group>): Promise<Group | null>;
  delete(groupId: string): Promise<boolean>;
  findAll(): Promise<Group[]>;
  findByName(name: string): Promise<Group | null>;
  updateCreatorId(groupId: string, newCreatorId: string): Promise<void>;
  countBySubjectId(subjectId: string): Promise<number>;
}

export interface IGroupMemberRepository {
  findByGroupId(groupId: string): Promise<GroupMember[]>;
  findByUserId(userId: string, role?: string): Promise<GroupMember[]>;
  findByGroupAndUser(groupId: string, userId: string): Promise<GroupMember | null>;
  add(memberData: Partial<GroupMember>): Promise<void>;
  remove(groupId: string, userId: string): Promise<boolean>;
  updateRole(groupId: string, userId: string, newRole: string): Promise<boolean>;
  getRefsByGroupAndUser(groupId: string, userId: string): Promise<{ ref: admin.firestore.DocumentReference, data: admin.firestore.DocumentData } | null>;
}

export interface IEventRepository {
  findAll(categoryId?: string | null): Promise<Event[]>;
  create(eventData: Partial<Event>): Promise<Event>;
}

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
}

export interface IEventSubscriptionRepository {
  subscribe(userId: string, categoryId: string): Promise<void>;
  unsubscribe(userId: string, categoryId: string): Promise<void>;
  findByUser(userId: string): Promise<{ categoryId: string }[]>;
}

export interface IGroupRequestRepository {
  createRequest(requestData: Partial<GroupRequest>): Promise<GroupRequest>;
  findPendingByUserAndGroup(userId: string, groupId: string): Promise<GroupRequest | null>;
  findPendingByGroup(groupId: string): Promise<GroupRequest[]>;
  updateStatus(groupId: string, userId: string, status: string): Promise<void>;
  findById(requestId: string): Promise<GroupRequest | null>;
  deletePendingByUserId(userId: string): Promise<void>;
  deleteByUserAndGroup(groupId: string, userId: string): Promise<boolean>;
  findByGroupAndUser(groupId: string, userId: string): Promise<GroupRequest | null>;
  findPendingByGroupId(groupId: string): Promise<GroupRequest[]>;
  create(requestData: Partial<GroupRequest>): Promise<GroupRequest>;
}

export interface IAcademicCatalogRepository {
  findSubjectById(subjectId: string): Promise<Subject | null>;
  findSubjectsByIds(subjectIds: string[]): Promise<Subject[]>;
  getSubjectById(subjectId: string): Promise<Subject | null>;
  getAllSubjects(): Promise<Subject[]>;
}

