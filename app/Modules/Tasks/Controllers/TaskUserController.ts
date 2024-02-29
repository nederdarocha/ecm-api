import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";

export default class TaskUserController {
  public async getAllUsers({ auth }: HttpContextContract) {
    try {
      const { rows: users } = await Database.rawQuery<{
        rows: { id: string; first_name: string }[];
      }>(
        `
      SELECT u.id, u.first_name
      FROM users u
      JOIN role_user ru ON u.id = ru.user_id
      JOIN roles r ON ru.role_id = r.id
      WHERE tenant_id = :tenant_id
      AND r.slug not in('cust', 'sup_admin')
      AND u.status = true

      `,
        { tenant_id: auth.user!.tenant_id }
      );

      if (users.length > 0) {
        return users.map((user) => ({
          id: user.id,
          first_name: user.first_name,
        }));
      }
      return [];
    } catch (error) {
      return [];
    }
  }
}
