import { DateTime } from "luxon";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Order from "../Models/Order";
import Condition from "../Models/Condition";
import Database from "@ioc:Adonis/Lucid/Database";
import Payment from "../Models/Payment";

type getConditionsPaymentData = {
  type: string;
  name: string;
  due_date: DateTime;
  value: number;
  customer_id: string;
  user_id: string | undefined;
  status: string;
  accepted: boolean;
};

export class OrderService {
  public async getOrderById(id: string): Promise<Order> {
    return await Order.query()
      .preload("customer")
      .preload("address")
      .preload("responsible")
      .preload("payments")
      .preload("items", (itemsQuery) => {
        itemsQuery.preload("product");
      })
      .where("id", id)
      .firstOrFail();
  }

  public async getNextNumber(option: "number" | "budget"): Promise<string> {
    const currentYear = DateTime.now().toFormat("yyyy");

    const {
      rowCount,
      rows: [row],
    } = await Database.rawQuery(
      `SELECT CAST(REGEXP_REPLACE("${option}" ,'(.*)\/(.*)','\\2\\1') AS INTEGER) as value, "${option}" as current FROM orders WHERE "${option}" != '' ORDER BY 1 desc limit 1;`
    );

    if (rowCount > 0) {
      const [number, year] = row.current.split("/");
      if (year === currentYear) {
        const nextNumber = String(Number(number) + 1).padStart(4, "0");
        return `${nextNumber}/${year}`;
      }
    }

    return `0001/${currentYear}`;
  }

  public async destroyPaymentOpened(order_id: string): Promise<void> {
    await Database.rawQuery("delete from payments where status = 'Aberto' and order_id = ?", [
      order_id,
    ]);
  }

  public parsingNumber(payload: string): string {
    if (!payload) {
      return "%%";
    }
    const [number, year] = payload.split("/");
    let numberFilter = `%${number}%`;
    if (number && year) {
      numberFilter = `%${year}%${number}%`;
    }
    return numberFilter;
  }

  public async getConditionsPayment(props: {
    order_id: string;
    payment_method_id: string;
    ctx: HttpContextContract;
    date_started?: DateTime;
  }): Promise<getConditionsPaymentData[]> {
    const {
      order_id,
      payment_method_id,
      ctx: { auth },
      date_started,
    } = props;

    const order = await Order.query().where("id", order_id).firstOrFail();

    const dispatchValue = Number(order.value * (Number(order.shipping) / 100));
    const discountValue = Number(order.value * (Number(order.discount) / 100));
    const orderValue =
      Math.round((Number(order.value) + dispatchValue - discountValue) * 100) / 100;

    const conditions = await Condition.query()
      .where("payment_method_id", payment_method_id)
      .orderBy("delay", "asc");

    const payments = conditions.map((condition) => {
      const due_date = date_started
        ? date_started.plus({ days: condition.delay })
        : DateTime.now().plus({ days: condition.delay });
      // : order.budget_due_date.plus({ days: condition.delay });

      return {
        type: "A receber",
        customer_id: order.customer_id,
        name: condition.name,
        due_date,
        value: Math.round(orderValue * (Number(condition.percentage) / 100) * 100) / 100,
        user_id: auth.user?.id,
        status: "Aberto",
        accepted: false,
      };
    });

    return payments;
  }

  public async getCommissionPayment(props: {
    order_id: string;
    ctx: HttpContextContract;
  }): Promise<getConditionsPaymentData | null> {
    const {
      order_id,
      ctx: { auth },
    } = props;

    const order = await Order.query().where("id", order_id).firstOrFail();
    if (!order.commission) {
      return null;
    }

    const discountValue = Number(order.value * (Number(order.discount) / 100));
    const commissionValue = Number(
      (order.value - discountValue) * (Number(order.commission) / 100)
    );

    return {
      type: "A pagar",
      customer_id: order.responsible_id!,
      name: "Comissão",
      due_date: DateTime.now().plus({ days: 7 }),
      value: commissionValue,
      user_id: auth.user?.id,
      status: "Aberto",
      accepted: true,
    };
  }

  public async getPaymentById(payment_id: string): Promise<Payment | null> {
    return Payment.query()
      .where("id", payment_id)
      .preload("order")
      .preload("customer")
      .preload("file")
      .first();
  }
}
