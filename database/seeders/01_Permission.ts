import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Permission from "App/Modules/Auth/Models/Permission";

export const permissions = [
  { name: "CRUD-Usuários", slug: "crud-user" },
  { name: "CRUD-Endereço", slug: "crud-address" },
  { name: "CRUD-Permission", slug: "crud-permission" },
  { name: "CRUD-Role", slug: "crud-role" },
  { name: "CRUD-Clientes", slug: "crud-customer" },
  { name: "CRUD-Pedidos", slug: "crud-order" },
  { name: "CRUD-Produtos", slug: "crud-product" },
];

export default class PermissionSeeder extends BaseSeeder {
  public async run() {
    await Permission.fetchOrCreateMany("slug", permissions);
  }
}
