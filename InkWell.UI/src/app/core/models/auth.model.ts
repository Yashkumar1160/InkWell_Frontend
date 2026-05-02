export interface User {
  userId: number;
  username: string;
  email: string;
  role: 'READER' | 'AUTHOR' | 'ADMIN';
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface AuthResponse extends User {
  token: string;
}
