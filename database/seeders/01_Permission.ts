import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Permission from "App/Modules/Auth/Models/Permission";

export const permissions = [
  { name: "Endereços", slug: "cru-address", c: true, r: true, u: true, d: false },
  { name: "Competências", slug: "cru-court", c: true, r: true, u: true, d: false },
  { name: "Clientes", slug: "cru-customer", c: true, r: true, u: true, d: false },
  { name: "Arquivos", slug: "cru-file", c: true, r: true, u: true, d: false },
  { name: "Contratos", slug: "cru-order", c: true, r: true, u: true, d: false },
  { name: "Mensagens", slug: "cru-message", c: true, r: true, u: true, d: false },
  { name: "Status", slug: "cru-status", c: true, r: true, u: true, d: false },
  { name: "Tramitações", slug: "cru-task", c: true, r: true, u: true, d: false },
  { name: "Pagamentos", slug: "cru-payment", c: true, r: true, u: true, d: false },
  { name: "Serviços", slug: "cru-service", c: true, r: true, u: true, d: false },
  { name: "Categorias", slug: "cru-category", c: true, r: true, u: true, d: false },
  { name: "Dados Extras", slug: "cru-extra_data", c: true, r: true, u: true, d: false },
  { name: "Meta Dados", slug: "cru-meta_data", c: true, r: true, u: true, d: false },
  { name: "Usuário", slug: "cru-user", c: true, r: true, u: true, d: false },
];

export default class PermissionSeeder extends BaseSeeder {
  public async run() {
    await Permission.fetchOrCreateMany("slug", permissions);
  }
}
