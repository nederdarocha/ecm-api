import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Court from "../Models/Courts";
import { CourtValidator } from "../Validators";
import { CourtService } from "../Services/CourtService";
import CustomerOrderService from "App/Modules/Orders/Models/CustomerOrderService";

export default class CourtController {
  private service: CourtService;

  constructor() {
    this.service = new CourtService();
  }

  public async filter({ auth, request }: HttpContextContract) {
    const { filter } = request.qs();
    const courts = await Court.query()
      .select("id", "name", "initials")
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere((sq) =>
        sq.orWhere("name", "iLike", `%${filter}%`).orWhere("initials", "iLike", `%${filter}%`)
      )
      .orderBy("initials", "asc")
      .limit(20);

    return courts;
  }

  public async index({ auth }: HttpContextContract) {
    // await request.validate(CourtIndexValidator);

    const courts = await Court.query()
      // .debug(true)
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("initials", "asc");

    return courts.map((court) =>
      court.serialize({
        fields: { omit: ["tenant_id", "user_id"] },
      })
    );
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const { ...data } = await request.validate(CourtValidator);
    const { tenant_id } = auth.user!;

    const isSigleCourt = await this.service.isSigle({ auth, request });
    if (isSigleCourt instanceof Error) {
      return response.badRequest({ message: isSigleCourt.message });
    }

    const court = await Court.create({
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
    const court = await Court.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", params.id)
      .firstOrFail();

    return court;
  }

  public async update({ auth, request, response, params }: HttpContextContract) {
    const { ...data } = await request.validate(CourtValidator);
    const court = await Court.query()
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

  public async destroy({ auth, params: { id }, response }: HttpContextContract) {
    // check if service has extra data
    const hasServices = await CustomerOrderService.query().where("court_id", id).first();
    if (hasServices) {
      return response.status(400).send({
        message: "Esta competência não pode ser excluída, pois está sendo utilizado em um serviço.",
      });
    }

    const address = await Court.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await address.delete();

    return response.status(204);
  }
}
