import { ApiClient } from "@japa/api-client";
import { USERS, TENANTS } from "Database/constants";

/**
 * getToken devolve por padrão um usuário com perfil de administrador
 * para devolver um token de outro usuário é preciso informar o e-mail e senha do usuário desejado.
 * LEMBRANDO que o usuário é do tenant padrão.
 */
export async function getToken(
  user = USERS.admin.email,
  password = USERS.admin.password,
  tenant_url = TENANTS.alfa.url
): Promise<string> {
  const api = new ApiClient();

  const response = await api
    .post("auth/sign-in")
    .json({ user, password: password, tenant_url: tenant_url });
  const { token } = response.body();
  return token;
}

export async function getAdminToken(): Promise<string> {
  return getToken(USERS.admin.email, USERS.admin.password, TENANTS.alfa.url);
}
