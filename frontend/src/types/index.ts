export interface User {
  id: number;
  name: string;
  email: string;
  language?: string;
  profile_image?: string;
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  access_token: string;
  token_type: string;
  user: User;
}