import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Status from "../Models/Status";
import { StatusValidator } from "../Validators";
import { StatusService } from "../Services/StatusService";
import Database from "@ioc:Adonis/Lucid/Database";
import Order from "../Models/Order";

export default class StatusController {
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
    const { initial, ...data } = await request.validate(StatusValidator);
    const { tenant_id } = auth.user!;

    if (initial) {
      await Database.rawQuery(`UPDATE status SET initial=false WHERE tenant_id = :tenant_id`, {
        tenant_id,
      });
    }

    const isSigleCourt = await this.service.isSigle({ auth, request });
    if (isSigleCourt instanceof Error) {
      return response.badRequest({ message: isSigleCourt.message });
    }

    const court = await Status.create({
      ...data,
      initial,
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
    const { initial, ...data } = await request.validate(StatusValidator);

    if (initial) {
      await Database.rawQuery(`UPDATE status SET initial=false WHERE tenant_id= :tenant_id`, {
        tenant_id: auth.user!.tenant_id,
      });
    }

    const court = await Status.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", params.id)
      .firstOrFail();

    const isSigleCourt = await this.service.isSigle({ auth, request, id: params.id });
    if (isSigleCourt instanceof Error) {
      return response.badRequest({ message: isSigleCourt.message });
    }

    await court.merge({ ...data, initial }).save();

    return court;
  }

  public async destroy({ auth, params: { id }, response }: HttpContextContract) {
    // check if service has extra data
    const hasServices = await Order.query().where("status_id", id).first();
    if (hasServices) {
      return response.status(400).send({
        message: "Este Status não pode ser excluído, pois está sendo utilizado em um contrato.",
      });
    }

    const address = await Status.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await address.delete();

    return response.status(204);
  }
}
