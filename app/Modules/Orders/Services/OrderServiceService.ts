import Payment from "App/Modules/Payments/Models/Payment";
import OrderService from "../Models/OrderService";
import Task from "../Models/Task";

export class OrderServiceService {
  private async hasPaymentAttached(orderService: OrderService): Promise<boolean | Error> {
    const existPayment = await Payment.query()
      .select("id")
      .where("order_service_id", orderService.id)
      .first();
    if (existPayment) {
      return new Error("Você não pode remover um Serviço com pagamento vinculado.");
    }
    return false;
  }

  private async hasTaskAttached(orderService: OrderService): Promise<boolean | Error> {
    const existTask = await Task.query()
      .select("id")
      .where("order_service_id", orderService.id)
      .first();
    if (existTask) {
      return new Error("Você não pode remover um Serviço com andamento processual vinculado.");
    }
    return false;
  }

  public async checkServiceDelete(orderService: OrderService): Promise<boolean | Error> {
    const hasPaymentAttached = await this.hasPaymentAttached(orderService);
    if (hasPaymentAttached instanceof Error) return hasPaymentAttached;

    const hasTaskAttached = await this.hasTaskAttached(orderService);
    if (hasTaskAttached instanceof Error) return hasPaymentAttached;

    return true;
  }
}
