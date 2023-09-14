import Database from "@ioc:Adonis/Lucid/Database";
import { helpers } from "App/Common/utils/helper";

export class TemplateService {
  public async getData(customer_order_service_id: string): Promise<any> {
    const {
      rows: [data],
    } = await Database.rawQuery(
      `
      select
      c."natural" as cliente_natural,
      c."name" as cliente_nome,
      c.gender as cliente_genero,
      c.email as cliente_email,
      c.phone as cliente_celular,
      to_char(timezone('EAT',c.birthday), 'DD/MM/YYYY') as cliente_nascimento,
      c."document" as cliente_cpf,
      c.document_secondary as cliente_rg,
      c.issuing_agency as cliente_o_expedidor,
      c.profession as cliente_profissao,
      c.proderj_id as cliente_proderj_id,
      c.previdencia_id as cliente_previdencia_id,
      a.zip as end_cep,
      a.street as end_rua,
      a."number" as end_numero,
      a.complement as end_complemento,
      a.neighborhood as end_bairro,
      a.city as end_cidade,
      a.state as end_uf
      from customer_order_service cos
      join customer_order co on cos.customer_order_id = co.id
      join customers c on co.customer_id = c.id
      left join addresses a on c.id = a.owner_id
      where cos.id = :customer_order_service_id
      and a.favorite = true
      limit 1
      `,
      { customer_order_service_id }
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
