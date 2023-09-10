import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Env from "@ioc:Adonis/Core/Env";

export default class Sleep {
  public async handle(
    {}: HttpContextContract,
    next: () => Promise<void>,
    middlewareParams: string
  ) {
    // simulate a slow connection
    if (Env.get("NODE_ENV") === "development") {
      console.log("middle sleep =>", middlewareParams[0]);
      const sleepTime = middlewareParams[0] ? parseInt(middlewareParams[0]) : 1000;
      await new Promise((resolve) => setTimeout(resolve, sleepTime));
    }

    await next();
  }
}
