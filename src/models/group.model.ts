export interface Group {
  id: string;
  name: string;
  creatorId: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type GroupRole = 'owner' | 'admin' | 'member';
