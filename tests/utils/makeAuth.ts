import { ApiClient } from "@japa/api-client";

interface User {
  id: string;
  first_name: string;
  email: string;
  avatar: string;
}

interface MakeAuth {
  token: string;
  refreshToken: string;
  expires_at: Date;
  acl: string[];
  user: User;
}

export async function makeAuth(user = "admin@admin.com", password = "secret"): Promise<MakeAuth> {
  const api = new ApiClient();
  const response = await api.post("auth/login").json({ user, password: password });

  return response.body();
}
