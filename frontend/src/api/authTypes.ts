export interface UserInfo {
  id: number;
  email: string;
  username: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResult {
  user: UserInfo;
  tokens: TokenPair;
}

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export interface UserListResult {
  total: number;
  page: number;
  page_size: number;
  items: AdminUser[];
}

export interface DashboardStats {
  total_users: number;
  active_users: number;
  admin_users: number;
  new_users_7d: number;
  column_usage: Record<string, number>;
  signups_by_day: { day: string; count: number }[];
}
