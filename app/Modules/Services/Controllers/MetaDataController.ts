import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { MetaDataValidator } from "../Validators";
import Database from "@ioc:Adonis/Lucid/Database";

export default class MetaDataController {
  public async update({ auth, request, response }: HttpContextContract) {
    const { data } = await request.validate(MetaDataValidator);

    let query = "";

    for (const item of data) {
      query += `UPDATE meta_data SET value='${item.value}', updated_at=now(), user_id='${auth.user?.id}' WHERE id='${item.meta_data_id}';`;
    }

    await Database.rawQuery(query);

    return response.status(200);
  }
}
