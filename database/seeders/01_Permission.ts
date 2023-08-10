import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Permission from "App/Modules/Auth/Models/Permission";

export const permissions = [
  { name: "CRUD-USUÁRIOS", slug: "crud-user" },
  { name: "CRUD-ENDEREÇO", slug: "crud-address" },
  { name: "CRUD-PERMISSION", slug: "crud-permission" },
  { name: "CRUD-ROLE", slug: "crud-role" },
  { name: "CRUD-CLIENTES", slug: "crud-customer" },
  { name: "CRUD-PEDIDOS", slug: "crud-order" },
  { name: "CRUD-PRODUTOS", slug: "crud-product" },
];

export default class PermissionSeeder extends BaseSeeder {
  public async run() {
    await Permission.fetchOrCreateMany("slug", permissions);
  }
}
