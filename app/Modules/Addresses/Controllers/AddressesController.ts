import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { AddressValidator } from "../Validators";
import Address from "../Models/Address";
import Database from "@ioc:Adonis/Lucid/Database";

export default class AddressesController {
  public async addressesOwner({ auth, params: { id } }: HttpContextContract) {
    return Address.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("owner_id", id)
      .orderBy("favorite", "desc");
  }

  public async addressesFavorite({ auth, response, params: { id } }: HttpContextContract) {
    const address = await Address.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await Database.rawQuery(
      `
      UPDATE addresses SET favorite = false
      WHERE tenant_id = :tenant_id AND owner_id = :owner_id;
    `,
      { tenant_id: auth.user!.tenant_id, owner_id: address.owner_id! }
    );

    await Database.rawQuery(
      `
      UPDATE addresses SET favorite = true
      WHERE id = :id AND owner_id = :owner_id;
    `,
      { id, owner_id: address.owner_id! }
    );

    return response.status(200).send({ message: "Endereço favoritado com sucesso." });
  }

  public async index({ auth, paginate }: HttpContextContract) {
    const addresses = await Address.query()
      .where("tenant_id", auth.user!.tenant_id)
      .orderBy("favorite", "desc")
      .paginate(paginate.page, paginate.per_page);

    return addresses.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
    });
  }

  public async store({ auth, request }: HttpContextContract) {
    let { favorite, ...data } = await request.validate(AddressValidator);

    const isAddressFavorite = await Address.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("owner_id", data.owner_id)
      .andWhere("favorite", true)
      .first();

    if (favorite && isAddressFavorite) {
      if (isAddressFavorite) {
        await Address.query()
          .where("tenant_id", auth.user!.tenant_id)
          .andWhere("owner_id", data.owner_id)
          .andWhere("favorite", true)
          .update({ favorite: false });
      }
    }

    if (!favorite && !isAddressFavorite) {
      favorite = true;
    }

    const address = await Address.create({
      ...data,
      favorite,
      tenant_id: auth.user?.tenant_id,
      user_id: auth.user?.id,
    });

    return address.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
    });
  }

  public async show({ auth, params: { id } }: HttpContextContract) {
    return await Address.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();
  }

  public async update({ auth, request, params: { id } }: HttpContextContract) {
    let { favorite, ...data } = await request.validate(AddressValidator);

    const isAddressFavorite = await Address.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("owner_id", data.owner_id)
      .andWhere("favorite", true)
      .first();

    if (favorite && isAddressFavorite) {
      if (isAddressFavorite) {
        await Address.query()
          .where("tenant_id", auth.user!.tenant_id)
          .andWhere("owner_id", data.owner_id)
          .andWhere("favorite", true)
          .update({ favorite: false });
      }
    }

    const address = await Address.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();

    await address.merge({ ...data, favorite, user_id: auth.user?.id }).save();
    return address;
  }

  public async destroy({ auth, params: { id }, response }: HttpContextContract) {
    const address = await Address.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("id", id)
      .firstOrFail();
    const { owner_id } = address;

    await address.delete();

    const addresses = await Address.query()
      .select("id", "favorite")
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere("owner_id", owner_id!)
      .orderBy("created_at", "desc");

    if (addresses && addresses.length > 0) {
      const isAddressFavorite = addresses.find((address) => address.favorite === true);

      if (!isAddressFavorite) {
        await Address.query()
          .where("tenant_id", auth.user!.tenant_id)
          .andWhere("id", addresses[0].id)
          .update({ favorite: true });
      }
    }

    return response.status(204);
  }
}
