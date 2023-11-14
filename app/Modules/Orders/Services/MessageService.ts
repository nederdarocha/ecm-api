import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import User from "App/Modules/Users/Models/User";

export class MessageService {
  public async getUserIdByCustomer(
    customer_id: string,
    auth: AuthContract
  ): Promise<Error | string> {
    const user = await User.query()
      .select("id")
      .where("customer_id", customer_id)
      .andWhere("tenant_id", auth.user!.tenant_id)
      .first();

    if (!user) {
      return new Error("User not found");
    }

    return user.id;
  }
}
