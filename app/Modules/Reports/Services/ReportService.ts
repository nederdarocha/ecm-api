import Item from "App/Modules/Orders/Models/Item";

interface IPart {
  id: string;
  name: string;
  value: number;
  variation: string;
}
interface IParts {
  id: string;
  description: string;
  value: number;
  _0?: IPart;
  _1?: IPart;
  _2?: IPart;
  _3?: IPart;
}

export class ReportService {
  public async serializeItems(items: Item[]): Promise<any[]> {
    try {
      const _items = items.map((item) => {
        const { parts, parts_ids, order, product, ...restItem } = item.serialize();

        return {
          "Numero do Pedido": order.number,
          "Aceito em": order.accepted_at,
          "Quantidade": restItem.quantity,
          "Produto": product.name,
          "Opcoes": this.serializeParts(parts.parts).join(" | "),
        };
      });

      return _items;
    } catch (error) {
      console.log(error);

      return [];
    }
  }

  private serializeParts(parts: IParts[]) {
    const _parts = parts?.map((part) => {
      return `${part._0?.name} / ${part._1?.name} / ${part._2?.name} / ${part._3?.name} / ${part.description}`.replace(
        / \/ undefined| \/ $/gi,
        ""
      );
    });

    return _parts;
  }
}
