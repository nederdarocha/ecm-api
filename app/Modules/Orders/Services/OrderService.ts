import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import Database from "@ioc:Adonis/Lucid/Database";
import { DateTime } from "luxon";
import Order from "../Models/Order";

export class OrderService {
  public async getOrderDraft(auth: AuthContract): Promise<Order | null> {
    const order = await Order.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("user_id", auth.user!.id)
      .andWhereNull("status_id")
      .first();

    return order;
  }

  public async getOrdersDrafts(auth: AuthContract): Promise<Order[]> {
    const { rows } = await Database.rawQuery(
      `
      select
      o.id as order_id,
      o."number" as order_number,
      c.id as customer_id,
      c."name" as customer_name,
      c."document" as customer_document,
      c."natural" as customer_natural,
      s."name" as status
      from orders o
      left join customer_order_service cs on o.id = cs.order_id
      left join customer_order co on o.id = co.order_id
      left join customers c on co.customer_id = c.id
      left join status s on o.status_id = s.id
      where cs.order_id is null
      and o.tenant_id = :tenant_id
      order by o."number";
  `,
      { tenant_id: auth.user!.tenant_id }
    );

    return rows.map((row) => ({
      id: row.order_id,
      order_id: row.order_id,
      court: {},
      order: {
        id: row.order_id,
        number: row.order_number,
        started_at: null,
        status: {
          id: null,
          name: row.status,
        },
      },
      service: {},
      customer: {
        id: null,
        name: row.customer_name,
        document: row.customer_document,
        natural: row.customer_natural,
      },
    }));
  }

  public async getNextNumber(auth: AuthContract): Promise<string> {
    const currentYear = DateTime.now().toFormat("yyyy");

    const {
      rowCount,
      rows: [row],
    } = await Database.rawQuery(
      `SELECT CAST(REGEXP_REPLACE("number" ,'(.*)\/(.*)','\\2\\1') AS INTEGER) as value, "number" as current
       FROM orders WHERE tenant_id = :tenant_id AND "number" != '' ORDER BY 1 desc limit 1;`,
      { tenant_id: auth.user!.tenant_id }
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

  public async getNextSequence(auth: AuthContract): Promise<number> {
    const { rows: sequence } = await Database.rawQuery(
      `SELECT coalesce(MAX(o.order),0) as order FROM orders o WHERE tenant_id = :tenant_id;`,
      { tenant_id: auth.user!.tenant_id }
    );

    return sequence[0].order + 1;
  }
}
