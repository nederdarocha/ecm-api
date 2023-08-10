import Cache from "../Models/Cache";
import { CacheValidator } from "../Validators/CacheValidador";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class CacheController {
  public async show({ params: { key } }: HttpContextContract) {
    return Cache.findByOrFail("key", key);
  }

  public async store({ request }: HttpContextContract) {
    const { ...data } = await request.validate(CacheValidator);
    const cache = await Cache.create({ ...data });
    return cache;
  }

  public async update({ request, params: { key } }: HttpContextContract) {
    const cache = await Cache.findByOrFail("key", key);
    const { ...data } = await request.validate(CacheValidator);
    await cache.merge({ ...data }).save();
    return cache;
  }

  public async destroy({ params: { key }, response }: HttpContextContract) {
    const cache = await Cache.findByOrFail("key", key);
    await cache.delete();
    return response.status(204);
  }
}
