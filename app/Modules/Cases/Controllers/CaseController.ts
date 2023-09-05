import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { DateTime } from "luxon";
import { CaseValidator } from "../Validators";
import Case from "../Models/Case";
import { CaseService } from "../Services/CaseService";

export default class CaseController {
  private service: CaseService;
  constructor() {
    this.service = new CaseService();
  }

  public async index({ auth, paginate }: HttpContextContract) {
    const addresses = await Case.query()
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("favorite", "desc")
      .paginate(paginate.page, paginate.per_page);

    return addresses.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
    });
  }

  public async store({ auth, response }: HttpContextContract) {
    const isCaseDraft = await this.service.getCaseDraft(auth);
    if (isCaseDraft) {
      return response.status(200).json({
        data: isCaseDraft.toJSON(),
        message: "Use esse rascunho, para aproveitar o número.",
      });
    }

    const order = await this.service.getNextSequence(auth);
    const number = await this.service.getNextNumber(auth);

    const address = await Case.create({
      order,
      number,
      started_at: DateTime.now(),
      tenant_id: auth.user?.tenant_id,
      user_id: auth.user?.id,
      status: "draft",
    });

    return address.serialize({
      fields: { omit: ["tenant_id", "user_id", "order"] },
    });
  }

  public async show({ auth, params: { id } }: HttpContextContract) {
    return await Case.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();
  }

  public async update({ auth, request, params: { id } }: HttpContextContract) {
    let { ...data } = await request.validate(CaseValidator);

    const address = await Case.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await address.merge({ ...data, user_id: auth.user?.id }).save();
    return address;
  }

  public async destroy({ auth, params: { id }, response }: HttpContextContract) {
    const address = await Case.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await address.delete();

    return response.status(204);
  }
}
