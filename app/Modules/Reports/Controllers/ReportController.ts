import XLSX from "xlsx";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Order from "App/Modules/Orders/Models/Order";
import Item from "App/Modules/Orders/Models/Item";
import { ReportService } from "../Services/ReportService";

export default class ReportController {
  private service: ReportService;

  constructor() {
    this.service = new ReportService();
  }

  public async orders({ request, response }: HttpContextContract) {
    const { date_started, date_ended, product_id } = request.body();

    const query = Order.query().select("*").where("accepted", true);

    if (product_id) {
      query.where("product_id", product_id);
    }

    const orders = await query
      .andWhereBetween("accepted_at", [`${date_started} 00:00:00`, `${date_ended} 23:59:59`])
      .preload("items", (query) => {
        query.preload("product", (query) => {
          query.select("name");
        });
      })
      .preload("customer", (query) => {
        query.select("name");
      });

    return response.status(200).json({ orders });
  }

  public async items({ request, response }: HttpContextContract) {
    const { date_started, date_ended, product_id } = request.qs();

    const query = Item.query()
      .select("order_id", "product_id", "quantity", "parts")
      .andWhereHas("order", (query) => {
        query
          .where("accepted", true)
          .andWhereBetween("accepted_at", [`${date_started} 00:00:00`, `${date_ended} 23:59:59`]);
      });

    if (product_id) {
      query.where("product_id", product_id);
    }

    const items = await query
      .preload("product", (query) => {
        query.select("name");
      })
      .preload("order", (query) => {
        query
          .select(
            "number",
            "customer_id",
            "accepted_at",
            "value",
            "shipping",
            "discount",
            "commission",
            "description"
          )
          .preload("customer", (query) => query.select("name"))
          .orderBy("number");
      });

    const _items = await this.service.serializeItems(items);

    /* generate workbook object */
    var wb = XLSX.utils.book_new();
    // var ws = XLSX.utils.aoa_to_sheet(["SheetJS".split(""), [5, 4, 3, 3, 7, 9, 5]]);
    const ws = XLSX.utils.json_to_sheet(_items);
    XLSX.utils.book_append_sheet(wb, ws, "Pedidos");

    /* generate buffer */
    var buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    // response.type("SheetJS.xlsx");
    response.attachment("planilha.xlsx");
    response.type("application/octet-stream");

    return response.send(buf);

    // return response.status(200).json({ _items });
  }
}
