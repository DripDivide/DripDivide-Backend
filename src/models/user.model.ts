export interface User {
  id: string;
  email: string;
  password: string;
  stellarPublicKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  stellar_public_key?: string | null;
  created_at: Date;
  updated_at: Date;
}
