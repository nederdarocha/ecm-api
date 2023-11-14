import CustomerOrder from "../Models/CustomerOrder";
import Message from "../Models/Message";

export class OrderCustomerService {
  public async isMessageSent(customerOrder: CustomerOrder): Promise<boolean> {
    const existMessage = await Message.query()
      .select("id")
      .where("customer_id", customerOrder.customer_id)
      .andWhere("order_id", customerOrder.order_id)
      .first();
    if (existMessage) return true;
    return false;
  }
}
