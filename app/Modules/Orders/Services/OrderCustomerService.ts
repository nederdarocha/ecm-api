import Payment from "App/Modules/Payments/Models/Payment";
import CustomerOrder from "../Models/CustomerOrder";
import Message from "../Models/Message";
import Task from "../../Tasks/Models/Task";

export class OrderCustomerService {
  private async isMessageSent(customerOrder: CustomerOrder): Promise<boolean | Error> {
    const existMessage = await Message.query()
      .select("id")
      .where("customer_id", customerOrder.customer_id)
      .andWhere("order_id", customerOrder.order_id)
      .first();
    if (existMessage) {
      return new Error("Você não pode remover um Cliente com mensagem vinculada.");
    }
    return false;
  }

  private async hasPaymentAttached(customerOrder: CustomerOrder): Promise<boolean | Error> {
    const existPayment = await Payment.query()
      .select("id")
      .where("customer_id", customerOrder.customer_id)
      .andWhere("order_id", customerOrder.order_id)
      .first();
    if (existPayment) {
      return new Error("Você não pode remover um Cliente com pagamento vinculado.");
    }

    return false;
  }

  private async hasTaskAttached(customerOrder: CustomerOrder): Promise<boolean | Error> {
    const existTask = await Task.query()
      .select("id")
      .where("customer_id", customerOrder.customer_id)
      .andWhere("order_id", customerOrder.order_id)
      .first();
    if (existTask) {
      return new Error("Você não pode remover um Serviço com andamento processual vinculado.");
    }
    return false;
  }

  public async checkCustomDelete(customerOrder: CustomerOrder): Promise<boolean | Error> {
    const isMessageSent = await this.isMessageSent(customerOrder);
    if (isMessageSent instanceof Error) return isMessageSent;

    const hasPaymentAttached = await this.hasPaymentAttached(customerOrder);
    if (hasPaymentAttached instanceof Error) return hasPaymentAttached;

    const hasTaskAttached = await this.hasTaskAttached(customerOrder);
    if (hasTaskAttached instanceof Error) return hasTaskAttached;

    return true;
  }
}
