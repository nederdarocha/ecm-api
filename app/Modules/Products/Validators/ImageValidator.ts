import { schema, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export class ImageValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    product_id: schema.string({}, [rules.uuid()]),
    file: schema.file({
      size: "5mb",
      extnames: ["jpg", "jpeg", "png"],
    }),
  });

  public messages = {
    "user_id": "o id do usuário é obrigatório",
    "file.size": "A imagem não pode ser maior que 5mb",
    "file.extnames": "O arquivo não possui uma extensão permitida",
  };
}
