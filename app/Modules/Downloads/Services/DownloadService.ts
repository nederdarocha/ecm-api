import Database from "@ioc:Adonis/Lucid/Database";
import Address from "App/Modules/Addresses/Models/Address";
import Customer from "App/Modules/Customers/Models/Customer";

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

export class DownloadService {
  private async getTenantIdByUserId(user_id: string): Promise<string> {
    const { rows } = await Database.rawQuery(`select tenant_id from users where id = :user_id`, {
      user_id,
    });
    return rows[0].tenant_id;
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
}
