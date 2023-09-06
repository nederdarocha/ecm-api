import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { DateTime } from "luxon";
import { CaseValidator } from "../Validators";
import Case from "../Models/Case";
import { CaseService } from "../Services/CaseService";
import { schema } from "@ioc:Adonis/Core/Validator";
import CaseCustomer from "../Models/CaseCustomer";
import CaseServiceModel from "../Models/CaseServiceModel";

export default class CaseController {
  private service: CaseService;
  constructor() {
    this.service = new CaseService();
  }

  public async index({ auth, paginate }: HttpContextContract) {
    const addresses = await Case.query()
      .where("tenant_id", auth.user!.tenant_id)
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
        message: "Use este rascunho para aproveitar o número gerado.",
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

  public async getServices({ auth, params: { id } }: HttpContextContract) {
    const caseService = await CaseServiceModel.query()
      .preload("service")
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("case_id", id);

    return caseService.map(({ service }) => ({
      id: service.id,
      name: service.name,
    }));
  }

  public async destroyService({ auth, response, params: { id, service_id } }: HttpContextContract) {
    const caseService = await CaseServiceModel.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("case_id", id)
      .andWhere("service_id", service_id)
      .firstOrFail();

    //TODO verificar se cliente possui serviços vinculados ao caso antes de remover

    await caseService.delete();
    response.status(204);
  }

  public async addService({ auth, request, response, params: { id } }: HttpContextContract) {
    const { service_id } = await request.validate({
      schema: schema.create({ service_id: schema.string() }),
    });

    const _case = await Case.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await CaseServiceModel.create({
      tenant_id: auth.user!.tenant_id,
      case_id: id,
      service_id,
      user_id: auth.user!.id,
    });

    // alterar o status de rascunho para aberto
    if (_case.status === "draft") {
      await _case.merge({ status: "open" }).save();
    }

    response.status(200);
  }

  public async getCustomers({ auth, params: { id } }: HttpContextContract) {
    const caseCustomer = await CaseCustomer.query()
      .preload("customer")
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("case_id", id);

    return caseCustomer.map(({ customer }) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      document: customer.document,
      natural: customer.natural,
    }));
  }

  public async destroyCustomer({
    auth,
    response,
    params: { id, customer_id },
  }: HttpContextContract) {
    const caseCustomer = await CaseCustomer.query()
      .preload("customer")
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("case_id", id)
      .andWhere("customer_id", customer_id)
      .firstOrFail();

    //TODO verificar se cliente possui serviços vinculados ao caso antes de remover

    await caseCustomer.delete();
    response.status(204);
  }

  public async addCustomer({ auth, request, response, params: { id } }: HttpContextContract) {
    const { customer_id } = await request.validate({
      schema: schema.create({ customer_id: schema.string() }),
    });

    const _case = await Case.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await CaseCustomer.create({
      tenant_id: auth.user!.tenant_id,
      case_id: _case.id,
      customer_id,
      user_id: auth.user!.id,
    });

    // alterar o status de rascunho para aberto
    if (_case.status === "draft") {
      await _case.merge({ status: "open" }).save();
    }

    response.status(200);
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
