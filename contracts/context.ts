declare module "@ioc:Adonis/Core/HttpContext" {
  interface HttpContextContract {
    paginate: { page: number; limit: number };
  }
}
