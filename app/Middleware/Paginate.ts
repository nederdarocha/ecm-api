import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class Paginate {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const { request } = ctx;

    if (request.method() === "GET") {
      const page: number = +request.input("page", 1);
      const per_page: number = +request.input("per_page", 10);

      ctx.paginate = {
        page,
        per_page: per_page < 0 ? 999999999 : per_page,
      };
    }

    await next();
  }
}
