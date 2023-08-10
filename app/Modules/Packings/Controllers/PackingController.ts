import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { PackingValidator } from "../Validators";
import Packing from "../Models/Packing";
import { PackingService } from "../Services/PackingService";

export default class PackingController {
  private service: PackingService;

  constructor() {
    this.service = new PackingService();
  }

  public async all() {
    return Packing.query().orderBy("name", "asc");
  }

  public async index({ paginate, request }: HttpContextContract) {
    const { page, limit } = paginate;
    const { filter } = request.qs();

    return Packing.query()
      .whereRaw("unaccent(name) iLike unaccent(?) ", [`%${filter}%`])
      .orWhere("name", "iLike", `%${filter}%`)
      .orderBy("name", "asc")
      .paginate(page, limit);
  }

  public async store({ auth, request }: HttpContextContract) {
    const { ...data } = await request.validate(PackingValidator);
    const packing = await Packing.create({ ...data, user_id: auth.user?.id });

    return packing;
  }

  public async show({ params: { id } }: HttpContextContract) {
    return Packing.query().where("id", id).firstOrFail();
  }

  public async update({ auth, request, params: { id } }: HttpContextContract) {
    const { ...data } = await request.validate(PackingValidator);
    const packing = await Packing.findOrFail(id);

    await packing.merge({ ...data, user_id: auth.user?.id }).save();
    return packing;
  }

  public async destroy({ response, params: { id } }: HttpContextContract) {
    const packing = await Packing.findOrFail(id);
    await packing.delete();

    return response.status(204);
  }
}
