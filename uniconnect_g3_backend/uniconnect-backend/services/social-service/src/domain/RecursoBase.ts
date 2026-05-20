import { IRecurso } from './IRecurso';

export interface ResourceComment {
  userId: string;
  userName: string;
  text: string;
  createdAt: string; // ISO string
}

export interface OpenGraphData {
  title: string | null;
  description: string | null;
  image: string | null;
}

export interface RecursoBaseParams {
  id?: string;
  groupId: string;
  title: string;
  description?: string;
  url: string;
  type: 'link' | 'file' | 'note';
  uploaderId: string;
  uploaderName: string;
  openGraph?: OpenGraphData | null;
  tags?: string[];
  ratings?: Record<string, number>;
  averageRating?: number;
  comments?: ResourceComment[];
  createdAt?: Date | unknown;
  updatedAt?: Date | unknown;
}

export class RecursoBase extends IRecurso {
  public id?: string;
  public groupId: string;
  public title: string;
  public description: string;
  public url: string;
  public type: 'link' | 'file' | 'note';
  public uploaderId: string;
  public uploaderName: string;
  public openGraph: OpenGraphData | null;
  public tags: string[];
  public ratings: Record<string, number>;
  public averageRating: number;
  public comments: ResourceComment[];
  public createdAt: Date | unknown;
  public updatedAt: Date | unknown;

  constructor(params: RecursoBaseParams) {
    super();
    this.id = params.id;
    this.groupId = params.groupId;
    this.title = params.title;
    this.description = params.description || '';
    this.url = params.url;
    this.type = params.type;
    this.uploaderId = params.uploaderId;
    this.uploaderName = params.uploaderName;
    this.openGraph = params.openGraph || null;
    this.tags = params.tags || [];
    this.ratings = params.ratings || {};
    this.averageRating = params.averageRating || 0;
    this.comments = params.comments || [];
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  getContenido(): string {
    return this.title;
  }

  getMetadata(): Record<string, unknown> {
    return {
      id: this.id,
      groupId: this.groupId,
      title: this.title,
      description: this.description,
      url: this.url,
      type: this.type,
      uploaderId: this.uploaderId,
      uploaderName: this.uploaderName,
      openGraph: this.openGraph,
      tags: this.tags,
      ratings: this.ratings,
      averageRating: this.averageRating,
      comments: this.comments,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  validate(): void {
    if (!this.title || this.title.trim().length < 3) {
      throw new Error('INVALID_TITLE');
    }
    if (!this.url || this.url.trim().length === 0) {
      throw new Error('MISSING_URL');
    }
    if (!this.uploaderId) {
      throw new Error('MISSING_UPLOADER');
    }
    if (!['link', 'file', 'note'].includes(this.type)) {
      throw new Error('INVALID_TYPE');
    }
  }
}
