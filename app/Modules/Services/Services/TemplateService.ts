import Database from "@ioc:Adonis/Lucid/Database";
import { helpers } from "App/Common/utils/helper";

export class TemplateService {
  public async getData(case_customer_service_id: string): Promise<any> {
    const {
      rows: [data],
    } = await Database.rawQuery(
      `
      select
      c."name" as cliente_nome,
      c."document" as cliente_cpf,
      c.phone as cliente_celular,
      c.gender as cliente_genero,
      c."natural" as cliente_natural,
      a.zip as end_cep,
      a.street as end_rua,
      a."number" as end_numero,
      a.complement as end_complemento,
      a.neighborhood as end_bairro,
      a.city as end_cidade,
      a.state as end_uf
      from case_customer_service ccs
      join case_customer cc on ccs.case_customer_id = cc.id
      join customers c on cc.customer_id = c.id
      left join addresses a on c.id = a.owner_id
      where ccs.id = :case_customer_service_id
      and a.favorite = true
      limit 1
      `,
      { case_customer_service_id }
    );

    //TODO buscar os dados extras do cliente

    const cliente_endereco = `${String(
      `${data.end_rua}, ${data.end_numero}, ${data.end_bairro}, ${data.end_cidade}, ${data.end_uf} - CEP ${data.end_cep}`
    )
      .replace(/null/g, "")
      .replace(/,\s,/g, "")}`;

    return {
      ...data,
      cliente_cpf: helpers.document(data.cliente_cpf, data.cliente_natural),
      cliente_celular: helpers.phone(data.cliente_celular),
      cliente_endereco,
      a_o: data.cliente_genero === "Feminino" ? "a" : "o",
      genero_a_o: data.cliente_genero === "Feminino" ? "a" : "o",
    };
  }
}
