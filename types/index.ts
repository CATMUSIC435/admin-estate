export interface CRMLead {
  $id: string;
  name: string;
  phone: string;
  status: 'NEW' | 'CONTACTED' | 'IGNORED' | string;
  $createdAt: string;
}

export interface ChatMessage {
  $id?: string;
  senderId: string;
  senderType: 'user' | 'agent';
  content: string;
  guestName?: string;
  guestPhone?: string;
  targetUserId?: string;
  attachmentUrl?: string;
  $createdAt?: string;
}

export interface LocationModel {
  id: string;
  name: string;
  slug: string;
}

export interface ProjectModel {
  id: string;
  name: string;
  slug: string;
}

export interface PropertyModel {
  id: string;
  name: string;
  location: string;
  transaction_type: string;
  price: string;
}

export interface BlogModel {
  id: string;
  title: string;
  slug: string;
}

export interface SyncData {
  locations: LocationModel[];
  projects: ProjectModel[];
  properties: PropertyModel[];
  blogs: BlogModel[];
}
