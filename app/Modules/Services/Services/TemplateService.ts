import Database from "@ioc:Adonis/Lucid/Database";
import { helpers } from "App/Common/utils/helper";
import extenso from "extenso";

export class TemplateService {
  public async checkAddress(customer_order_service_id: string): Promise<string | Error> {
    const {
      rows: [data],
    } = await Database.rawQuery(
      `
      select
      a.id as end_id
      from customer_order_service cos
      join customer_order co on cos.customer_order_id = co.id
      join customers c on co.customer_id = c.id
      left join addresses a on c.id = a.owner_id
      left join courts ct on cos.court_id = ct.id
      where cos.id = :customer_order_service_id
      and a.favorite = true
      limit 1
      `,
      { customer_order_service_id }
    );

    if (!data?.end_id) {
      return new Error("Endereço do cliente não encontrado.");
    }

    return data.end_id;
  }

  public async getData(customer_order_service_id: string): Promise<any> {
    const {
      rows: [data],
    } = await Database.rawQuery(
      `
      select
      ct.initials as competencia_sigla,
      ct.name as competencia_nome,
      ct.district as competencia_comarca,
      cos.court_number as numero_processo,
      cos.honorary_type,
      cos.honorary_cents_value,
      cos.service_cents_amount,
      c."natural" as cliente_natural,
      c."name" as cliente_nome,
      c.gender as cliente_genero,
      c.nationality as cliente_nacionalidade,
      c.email as cliente_email,
      c.phone as cliente_celular,
      to_char(timezone('EAT',c.birthday), 'DD/MM/YYYY') as cliente_nascimento,
      c."document" as cliente_cpf,
      c.document_secondary as cliente_rg,
      c.issuing_agency as cliente_o_expedidor,
      c.profession as cliente_profissao,
      c.workplace as cliente_lotacao,
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
      left join courts ct on cos.court_id = ct.id
      where cos.id = :customer_order_service_id
      and a.favorite = true
      limit 1
      `,
      { customer_order_service_id }
    );

    const { rows } = await Database.rawQuery(
      `
      select ed."name", md.value
      from meta_data md
      join extra_data ed on md.extra_data_id = ed.id
      where md.customer_order_service_id  = :customer_order_service_id;
      `,
      { customer_order_service_id }
    );

    const extra_data = {};
    for (const item of rows) {
      extra_data[item.name] = item.value;
    }

    const cliente_endereco = `${String(
      `${data?.end_rua}, ${data?.end_numero}, ${data?.end_bairro}, ${data?.end_cidade}, ${data?.end_uf} - CEP ${data?.end_cep}`
    )
      .replace(/null/g, "")
      .replace(/,\s,/g, "")}`;

    try {
      const res = {
        ...data,
        CLIENTE_NOME: data?.cliente_nome.toUpperCase(),
        cliente_cpf: helpers.document(data?.cliente_cpf, data?.cliente_natural),
        cliente_celular: helpers.phone(data?.cliente_celular),
        cliente_endereco,
        masculino: data?.cliente_genero === "Masculino",
        feminino: data?.cliente_genero === "Feminino",
        _a: data?.cliente_genero === "Feminino" ? "a" : "",
        a_o: data?.cliente_genero === "Feminino" ? "a" : "o",
        genero_a_o: data?.cliente_genero === "Feminino" ? "a" : "o",
        valor_honorario: this.formatHonorary(data?.honorary_cents_value, data?.honorary_type),
        valor_causa: this.formatCurrency(data?.service_cents_amount),
        ...extra_data,
      };

      return res;
    } catch (error) {
      console.log(error);
    }
  }

  private formatHonorary(value: number, type: string) {
    try {
      if (!value) return "";
      const decimalValue = value / 100;
      const formatValue = new Intl.NumberFormat("pt-BR", {
        currency: "BRL",
      }).format(decimalValue);

      if (type === "percent") {
        return `${decimalValue}%`;
      }
      return `${formatValue}% (${extenso(formatValue, { mode: "number" })} por cento)`;
    } catch (error) {
      return "error ao formatar honorário";
    }
  }

  private formatCurrency(value: number | null) {
    try {
      if (!value) return "";

      const decimalValue = value / 100;
      const formatValue = new Intl.NumberFormat("pt-BR", {
        currency: "BRL",
      }).format(decimalValue);

      return `R$ ${formatValue} (${extenso(formatValue, { mode: "currency" })})`;
    } catch (error) {
      return "error ao formatar valor";
    }
  }
}
