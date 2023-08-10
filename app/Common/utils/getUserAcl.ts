import Database from "@ioc:Adonis/Lucid/Database";

export async function getUserAcl(user_id: string): Promise<string[]> {
  const { rows } = await Database.rawQuery(
    `
    (SELECT r.slug FROM role_user ru
    LEFT JOIN roles r ON ru.role_id = r.id
    WHERE ru.user_id = :id)
    union
    (SELECT p.slug FROM role_user ru
    LEFT JOIN permission_role pr ON ru.role_id = pr.role_id
    JOIN permissions p ON pr.permission_id = p.id
    WHERE ru.user_id = :id)
  `,
    { id: user_id }
  );

  return rows.map(({ slug }) => slug);
}
