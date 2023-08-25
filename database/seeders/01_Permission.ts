import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Permission from "App/Modules/Auth/Models/Permission";

export const permissions = [
  { name: "Usuário", slug: "cru-user" },
  { name: "Endereços", slug: "cru-address" },
  { name: "Clientes", slug: "cru-customer" },
  { name: "Arquivos", slug: "cru-file" },
];

export default class PermissionSeeder extends BaseSeeder {
  public async run() {
    await Permission.fetchOrCreateMany("slug", permissions);
  }
}
