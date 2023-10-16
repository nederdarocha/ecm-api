import { RequestContract } from "@ioc:Adonis/Core/Request";
import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import File from "../Models/File";
import { FileStoreValidator } from "../Validators";

interface GenerateNameProps {
  auth: AuthContract;
  request: RequestContract;
}

interface IsFileNameExistProps {
  auth: AuthContract;
  file: File;
  name: string;
}

export class FileService {
  public async generateName({ auth, request }: GenerateNameProps): Promise<string> {
    const { file, owner_id } = await request.validate(FileStoreValidator);

    const existFile = await File.query()
      .where("name", file.clientName)
      .andWhere("owner_id", owner_id)
      .andWhere("tenant_id", auth.user!.tenant_id)
      .first();

    if (existFile) {
      const regex = new RegExp(`(.${file.extname}$)`, "i");
      return file.clientName.replace(regex, `_${Date.now()}$1`);
    }
    return file.clientName;
  }

  public async isFileNameExist({ auth, file, name }: IsFileNameExistProps): Promise<Error | void> {
    const existFile = await File.query()
      .where("name", name)
      .andWhere("owner_id", file.owner_id!)
      .andWhere("tenant_id", auth.user!.tenant_id)
      .andWhereNot("id", file.id)
      .first();

    if (existFile) {
      return new Error("o nome do arquivo já está em uso");
    }
  }
}
