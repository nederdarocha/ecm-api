declare module "@ioc:Adonis/Core/HttpContext" {
  interface HttpContextContract {
    paginate: { page: number; per_page: number };
    userID?: string;
  }
}
