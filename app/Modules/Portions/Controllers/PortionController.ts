import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { PortionValidator } from "../Validators";
import Portion from "../Models/Portion";
import { PortionService } from "../Services/PortionService";

export default class PortionController {
  private service: PortionService;

  constructor() {
    this.service = new PortionService();
  }

  public async all() {
    return Portion.query().orderBy("name", "asc");
  }

  public async index({ paginate, request }: HttpContextContract) {
    const { page, limit } = paginate;
    const { filter } = request.qs();

    return Portion.query()
      .whereRaw("unaccent(name) iLike unaccent(?) ", [`%${filter}%`])
      .orWhere("name", "iLike", `%${filter}%`)
      .orderBy("name", "asc")
      .paginate(page, limit);
  }

  public async store({ auth, request }: HttpContextContract) {
    const { ...data } = await request.validate(PortionValidator);
    const packing = await Portion.create({ ...data, user_id: auth.user?.id });

    return packing;
  }

  public async show({ params: { id } }: HttpContextContract) {
    return Portion.query().where("id", id).firstOrFail();
  }

  public async update({ auth, request, params: { id } }: HttpContextContract) {
    const { ...data } = await request.validate(PortionValidator);
    const packing = await Portion.findOrFail(id);

    await packing.merge({ ...data, user_id: auth.user?.id }).save();
    return packing;
  }

  public async destroy({ response, params: { id } }: HttpContextContract) {
    const packing = await Portion.findOrFail(id);
    await packing.delete();

    return response.status(204);
  }
}
