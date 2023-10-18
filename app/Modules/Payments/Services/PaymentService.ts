import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import { MultipartFileContract } from "@ioc:Adonis/Core/BodyParser";
import File from "App/Modules/Files/Models/File";

interface GenerateNameProps {
  auth: AuthContract;
  file: MultipartFileContract;
  payment_id: string;
}

export class PaymentService {
  public async findById(): Promise<null> {
    return null;
  }
  public async generateName({ auth, file, payment_id }: GenerateNameProps): Promise<string> {
    const existFile = await File.query()
      .where("name", file.clientName)
      .andWhere("owner_id", payment_id)
      .andWhere("tenant_id", auth.user!.tenant_id)
      .first();

    if (existFile) {
      const regex = new RegExp(`(.${file?.extname!}$)`, "i");
      return file.clientName?.replace(regex, `_${Date.now()}$1`);
    }
    return file.clientName;
  }
}
