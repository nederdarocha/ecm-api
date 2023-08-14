import Env from "@ioc:Adonis/Core/Env";
import { ApiClient } from "@japa/api-client";

export async function getToken(
  user = "admin@admin.com",
  password = Env.get("USER_PASSWORD", "secret")
): Promise<string> {
  const api = new ApiClient();
  const response = await api.post("auth/sign-in").json({ user, password: password });
  const { token } = response.body();
  return token;
}
