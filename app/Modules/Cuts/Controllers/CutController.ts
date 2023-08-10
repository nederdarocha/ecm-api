import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { CutValidator } from "../Validators";
import Cut from "../Models/Cut";
import { CutService } from "../Services/CutService";

export default class CutController {
  private service: CutService;

  constructor() {
    this.service = new CutService();
  }

  public async all() {
    return Cut.query().orderBy("name", "asc");
  }

  public async index({ paginate, request }: HttpContextContract) {
    const { page, limit } = paginate;
    const { filter } = request.qs();

    return Cut.query()
      .whereRaw("unaccent(name) iLike unaccent(?) ", [`%${filter}%`])
      .orWhere("name", "iLike", `%${filter}%`)
      .orderBy("name", "asc")
      .paginate(page, limit);
  }

  public async store({ auth, request }: HttpContextContract) {
    const { ...data } = await request.validate(CutValidator);
    const packing = await Cut.create({ ...data, user_id: auth.user?.id });

    return packing;
  }

  public async show({ params: { id } }: HttpContextContract) {
    return Cut.query().where("id", id).firstOrFail();
  }

  public async update({ auth, request, params: { id } }: HttpContextContract) {
    const { ...data } = await request.validate(CutValidator);
    const packing = await Cut.findOrFail(id);

    await packing.merge({ ...data, user_id: auth.user?.id }).save();
    return packing;
  }

  public async destroy({ response, params: { id } }: HttpContextContract) {
    const packing = await Cut.findOrFail(id);
    await packing.delete();

    return response.status(204);
  }
}
