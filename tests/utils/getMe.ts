import { ApiClient } from "@japa/api-client";

interface MeData {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  avatar: any;
  acl: Array<string>;
}

export async function getMe(token: string): Promise<MeData> {
  const api = new ApiClient();
  const response = await api.get("/me").bearerToken(token);

  return response.body();
}
