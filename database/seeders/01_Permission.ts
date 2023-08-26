import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Permission from "App/Modules/Auth/Models/Permission";

export const permissions = [
  { name: "Usuário", slug: "cru-user", c: true, r: true, u: true, d: false },
  { name: "Endereços", slug: "cru-address", c: true, r: true, u: true, d: false },
  { name: "Clientes", slug: "cru-customer", c: true, r: true, u: true, d: false },
  { name: "Arquivos", slug: "cru-file", c: true, r: true, u: true, d: false },
];

export default class PermissionSeeder extends BaseSeeder {
  public async run() {
    await Permission.fetchOrCreateMany("slug", permissions);
  }
}
