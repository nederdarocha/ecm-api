import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Env from "@ioc:Adonis/Core/Env";

export default class Sleep {
  public async handle(
    {}: HttpContextContract,
    next: () => Promise<void>,
    middlewareParams: string
  ) {
    //simulate a slow connection
    console.log("sleep=>", middlewareParams[0]);
    if (Env.get("NODE_ENV") === "development") {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    await next();
  }
}
