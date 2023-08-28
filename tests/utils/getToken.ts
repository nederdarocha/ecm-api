import { ApiClient } from "@japa/api-client";
import { USERS } from "Database/constants";

export async function getToken(
  user = USERS.admin.email,
  password = USERS.admin.password
): Promise<string> {
  const api = new ApiClient();
  const response = await api.post("auth/sign-in").json({ user, password: password });
  const { token } = response.body();
  return token;
}
