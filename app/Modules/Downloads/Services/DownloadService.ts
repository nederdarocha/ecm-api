import Database from "@ioc:Adonis/Lucid/Database";
import Address from "App/Modules/Addresses/Models/Address";
import Customer from "App/Modules/Customers/Models/Customer";
import OrderService from "App/Modules/Orders/Models/OrderService";
import User from "App/Modules/Users/Models/User";

export type ParseAddressData = {
  Endereço: string;
  CEP: string;
  Logradouro: string;
  Número: string;
  Complemento: string;
  Bairro: string;
  Cidade: string;
  Estado: string;
  País: string;
  Referência: string;
};

interface GetOrderProp {
  user_id: string;
  date_begin: string;
  date_end: string;
  service_id: string;
}

export class DownloadService {
  private async getTenantIdByUserId(user_id: string): Promise<string> {
    const { rows } = await Database.rawQuery(`select tenant_id from users where id = :user_id`, {
      user_id,
    });
    return rows[0].tenant_id;
  }

  public async getOrder({
    user_id,
    date_begin,
    date_end,
    service_id,
  }: GetOrderProp): Promise<any[] | Error> {
    try {
      const tenant_id = await this.getTenantIdByUserId(user_id);

      const query = OrderService.query()
        .preload("order", (sq) =>
          sq
            .select("*")
            .preload("customers", (sq) => sq.select("name", "document", "natural"))
            .preload("status", (sq) => sq.select("name"))
            .orderBy("order", "asc")
        )
        .preload("service", (sq) => sq.select("name"))
        .preload("court", (sq) => sq.select("initials"))
        .where("tenant_id", tenant_id)
        .whereBetween("created_at", [date_begin, date_end]);

      if (service_id !== "all") {
        query.where("service_id", service_id);
      }

      const orderServices = await query;

      const orders: any = [];

      for (const os of orderServices) {
        const { order } = os;
        const { customers } = order;

        for (const customer of customers) {
          orders.push({
            "Contrato": order?.number,
            "Data": order?.createdAt?.toFormat("dd/MM/yyyy"),
            "Cliente": customer?.name || "",
            "CPF/CNPJ": customer?.document || "",
            "Serviço": os?.service?.name || "",
            "Competência": os?.court?.initials || "",
            "Processo": os?.court_number || "",
            "Status": order?.status?.name || "",
          });
        }
      }

      return orders;
    } catch (error) {
      return Error("erro ao serializar contratos " + error.message);
    }

    return [];
  }

  public async getAllCustomers(user_id: string): Promise<any[] | Error> {
    try {
      const tenant_id = await this.getTenantIdByUserId(user_id);

      const customers = await Customer.query()
        .where("tenant_id", tenant_id)
        .preload("addresses")
        .preload("indicator", (sq) => sq.select("name", "document", "natural"));

      return customers.map((customer) => ({
        "Nome": customer.name,
        "Telefone": customer.phone || "",
        "Email": customer.email || "",
        "CPF/CNPJ": customer.document,
        "RG/IE": customer.document_secondary || "",
        "RG Expedidor": customer.issuing_agency || "",
        "Nascimento": customer.birthday ? customer.birthday.toFormat("dd/MM/yyyy") : "",
        "Nacionalidade": customer.nationality || "",
        "Gênero": customer.gender || "",
        "Profissão": customer.profession || "",
        "Lotação": customer.workplace || "",
        "Aposentado": customer.retired ? "Sim" : "Não",
        "ID Proderj": customer.proderj_id || "",
        "ID Rio Prividência": customer.previdencia_id || "",
        "Banco": customer.bank || "",
        "Agência": customer.branch || "",
        "Conta": customer.account_number || "",
        "Chave Pix": customer.pix_key || "",
        "Observação": customer.notes || "",
        "Captador": customer?.indicator?.name || "",
        ...this.parseAddress(customer.addresses),
      }));
    } catch (error) {
      return Error("erro ao serializar clientes " + error.message);
    }
  }

  private parseAddress(addresses: Address[]): ParseAddressData {
    if (addresses.length > 0) {
      const [addr] = addresses.filter((addr) => addr.favorite);
      if (addr) {
        return {
          Endereço: addr.name,
          CEP: addr.zip,
          Logradouro: addr.street || "",
          Número: addr.number || "",
          Complemento: addr.complement || "",
          Bairro: addr.neighborhood || "",
          Cidade: addr.city || "",
          Estado: addr.state || "",
          País: addr.country || "",
          Referência: addr.reference || "",
        };
      }
    }
    return {
      Endereço: "",
      CEP: "",
      Logradouro: "",
      Número: "",
      Complemento: "",
      Bairro: "",
      Cidade: "",
      Estado: "",
      País: "",
      Referência: "",
    };
  }

  public async isAdmin(user_id: string): Promise<boolean> {
    const user = await User.query().where("id", user_id).preload("roles").first();
    if (!user) return false;
    return user?.roles?.some((role) => role.slug === "admin");
  }
}
