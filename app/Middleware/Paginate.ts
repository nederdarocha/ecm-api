import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class Paginate {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const { request } = ctx;

    if (request.method() === "GET") {
      const page: number = +request.input("page", 1);
      const per_page: number = +request.input("perPage", 10);

      ctx.paginate = {
        page,
        per_page,
      };
    }

    await next();
  }
}
