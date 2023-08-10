import Item from "../Models/Item";
import _ from "lodash";

export class ItemService {
  public async isProductEqual(
    order_id: string,
    product_id: string,
    parts_ids: string | undefined
  ): Promise<boolean> {
    const ids = parts_ids ? parts_ids.split(",") : [];

    const items = await Item.query()
      .select("parts_ids")
      .where("order_id", order_id)
      .andWhere("product_id", product_id);

    if (ids.length < 1 && items.length > 0) {
      return true;
    }

    for (const item of items) {
      const _ids = item.parts_ids ? item.parts_ids.split(",") : [];
      if (_.intersection(ids, _ids).length === ids.length) {
        return true;
      }
    }

    return false;
  }

  public async getItemsByOrderId(order_id: string): Promise<Item[]> {
    return await Item.query().preload("product").where("order_id", order_id);
  }
}
