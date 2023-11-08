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
    const _items = await this.service.getAllCustomers(userID!);

    if (_items instanceof Error)
      return response.badRequest(
        `Não foi possível baixar os clientes, tente novamente e se o erro continuar informe ao suporte. \n#${_items.message}`
      );

    /* generate workbook object */
    var workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(_items);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Produtos vendidos");
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
}
