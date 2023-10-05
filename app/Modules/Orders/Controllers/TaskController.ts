import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Status from "../Models/Status";
import { StatusValidator } from "../Validators";
import { StatusService } from "../Services/StatusService";

export default class TaskController {
  private service: StatusService;

  constructor() {
    this.service = new StatusService();
  }

  public async index({ auth }: HttpContextContract) {
    const courts = await Status.query()
      // .debug(true)
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("name", "asc");

    return courts.map((court) =>
      court.serialize({
        fields: { omit: ["tenant_id", "user_id"] },
      })
    );
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const { ...data } = await request.validate(StatusValidator);
    const { tenant_id } = auth.user!;

    const isSigleCourt = await this.service.isSigle({ auth, request });
    if (isSigleCourt instanceof Error) {
      return response.badRequest({ message: isSigleCourt.message });
    }

    const court = await Status.create({
      ...data,
      tenant_id,
      user_id: auth.user!.id,
    });

    return court.serialize({
      fields: {
        omit: ["tenant_id", "user_id", "createdAt", "updatedAt"],
      },
    });
  }

  public async show({ params, auth }: HttpContextContract) {
    const court = await Status.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", params.id)
      .firstOrFail();

    return court;
  }

  public async update({ auth, request, response, params }: HttpContextContract) {
    const { ...data } = await request.validate(StatusValidator);
    const court = await Status.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", params.id)
      .firstOrFail();

    const isSigleCourt = await this.service.isSigle({ auth, request, id: params.id });
    if (isSigleCourt instanceof Error) {
      return response.badRequest({ message: isSigleCourt.message });
    }

    await court.merge(data).save();

    return court;
  }
}
