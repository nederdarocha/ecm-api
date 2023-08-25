import Database from "@ioc:Adonis/Lucid/Database";
interface GetUserAclProps {
  user_id: string;
  short?: boolean;
}

export async function getUserAcl({ user_id, short = false }: GetUserAclProps): Promise<string[]> {
  //TODO criar cache as permissões do usuário
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

  if (!rows || rows.length < 1) {
    return [];
  }

  if (short) {
    return rows.map((row) => row.slug);
  }

  let permissions: Array<string> = [];

  for (const row of rows) {
    if (row.slug.match(/-/)) {
      const [initialsAction, name] = row.slug.split("-");
      const _permissions = initialsAction.split("").map((initial) => `${initial}-${name}`);
      permissions = [...permissions, ..._permissions];
    } else {
      permissions.push(row.slug);
    }
  }

  return permissions;
}
