import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext"

export default class Paginate {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const { request } = ctx

    if (request.method() === "GET") {
      const page: number = +request.input("page", 1)
      const limit: number = +request.input("limit", 0)
      const perPage: number = +request.input("per_page", 0)

      ctx.paginate = {
        page,
        limit: limit + perPage,
      }
    }

    await next()
  }
}
