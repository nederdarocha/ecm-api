import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import Database from "@ioc:Adonis/Lucid/Database";
import { DateTime } from "luxon";
import Case from "../Models/Case";

export class CaseService {
  public async getCaseDraft(auth: AuthContract): Promise<Case | null> {
    const _case = await Case.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("user_id", auth.user!.id)
      .andWhere("status", "draft")
      .first();

    return _case;
  }

  public async getNextNumber(auth: AuthContract): Promise<string> {
    const currentYear = DateTime.now().toFormat("yyyy");

    const {
      rowCount,
      rows: [row],
    } = await Database.rawQuery(
      `SELECT CAST(REGEXP_REPLACE("number" ,'(.*)\/(.*)','\\2\\1') AS INTEGER) as value, "number" as current
       FROM cases WHERE tenant_id = :tenant_id AND "number" != '' ORDER BY 1 desc limit 1;`,
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
      `SELECT coalesce(MAX(o.order),0) as order FROM cases o WHERE tenant_id = :tenant_id;`,
      { tenant_id: auth.user!.tenant_id }
    );
    console.log({ sequence });

    return sequence[0].order + 1;
  }
}
