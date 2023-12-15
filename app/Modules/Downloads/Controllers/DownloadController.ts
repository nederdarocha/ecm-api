import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { DownloadService } from "../Services/DownloadService";
import { DateTime } from "luxon";
import XLSX from "xlsx";

export default class DownloadController {
  private service: DownloadService;

  constructor() {
    this.service = new DownloadService();
  }

  public async customers({ userID, response }: HttpContextContract) {
    const isAdmin = await this.service.isAdmin(userID!);
    if (!isAdmin) {
      return response.badRequest("Você não tem permissão para baixar os clientes.");
    }

    const _items = await this.service.getAllCustomers(userID!);
    if (_items instanceof Error)
      return response.badRequest(
        `Não foi possível baixar os clientes, tente novamente e se o erro continuar informe ao suporte. \n#${_items.message}`
      );

    /* generate workbook object */
    var workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(_items);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    var buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const dateNow = DateTime.now().toFormat("dd_MM_yyyy");

    response.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    response.attachment(`clientes_${dateNow}.xlsx`);
    response.type("application/octet-stream");

    return response.send(buffer);
  }

  public async orders({ userID, response, request }: HttpContextContract) {
    const { date_begin, date_end, service_id } = request.qs();

    const isAdmin = await this.service.isAdmin(userID!);
    if (!isAdmin) {
      return response.badRequest("Você não tem permissão para baixar os contratos.");
    }

    const orders = await this.service.getOrder({
      user_id: userID!,
      date_begin,
      date_end,
      service_id,
    });

    if (orders instanceof Error)
      return response.badRequest(
        `Não foi possível baixar os contratos, tente novamente e se o erro continuar informe ao suporte. \n#${orders.message}`
      );

    /* generate workbook object */
    var workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(orders);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contratos");
    var buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const dateNow = DateTime.now().toFormat("dd_MM_yyyy");

    response.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    response.attachment(`contratos_${dateNow}.xlsx`);
    response.type("application/octet-stream");

    return response.send(buffer);
  }
}
