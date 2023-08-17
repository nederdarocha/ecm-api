import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "../Models/User";
import { AvatarValidator, UserStoreValidator, UserIndexValidator } from "../Validators";
import { UserService } from "../Services/UserService";
import UserUpdateValidator from "../Validators/UserUpdateValidator";
import { v4 as uuid } from "uuid";
import sharp from "sharp";
import Drive from "@ioc:Adonis/Core/Drive";
import UserProfileValidator from "../Validators/UserProfileValidator";
import UserPasswordValidator from "../Validators/UserPasswordValidator";
import Hash from "@ioc:Adonis/Core/Hash";
import Mail from "@ioc:Adonis/Addons/Mail";
import Env from "@ioc:Adonis/Core/Env";
import { getUserAcl } from "App/Common/utils";
import bcrypt from "bcrypt";
import { createId } from "@paralleldrive/cuid2";
import Tenant from "App/Modules/Tenants/Models/Tenant";
import { DateTime } from "luxon";

export default class UsersController {
  private service: UserService;

  constructor() {
    this.service = new UserService();
  }

  public async index({ paginate, request, auth }: HttpContextContract) {
    await request.validate(UserIndexValidator);
    const { page, per_page } = paginate;
    const { filter } = request.qs();

    const users = await User.query()
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere((sq) =>
        sq
          .orWhereRaw("unaccent(name) iLike unaccent(?) ", [`%${filter}%`])
          .orWhere("email", "iLike", `%${filter}%`)
          .orWhere("document", "iLike", `%${filter?.replace(/[.|-]/g, "")}%`)
          .orWhere("phone", "iLike", `%${filter}%`)
      )
      .preload("roles", (sq) => sq.select("name").orderBy("name", "asc"))
      .orderBy("name", "asc")
      .paginate(page, per_page);

    return users.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
      relations: { roles: { fields: { omit: ["id"] } } },
    });
  }

  public async store({ auth, request }: HttpContextContract) {
    const { role_ids, ...data } = await request.validate(UserStoreValidator);
    const { tenant_id } = auth.user!;
    const salt = await bcrypt.genSalt(10);
    const user = await User.create({
      ...data,
      tenant_id,
      password: createId(),
      salt,
      user_id: auth.user!.id,
    });
    const tenant = await Tenant.findOrFail(tenant_id);

    if (role_ids) {
      await user.related("roles").sync(role_ids);
    }

    const token = uuid();
    const expiresAt = DateTime.now().plus({ hours: 24 });
    user.related("tokens").create({ token, type: "forgot", expiresAt });

    Mail.send((message) => {
      message
        .from(Env.get("MAIL_FROM"), Env.get("MAIL_NAME"))
        .to(data.email)
        .subject(`${Env.get("MAIL_SUBJECT")} - Bem vindo`)
        .htmlView("emails/welcome", {
          name: user.name,
          url: `${tenant.url}/auth/new-password/${token}`,
        });
    });

    return user.serialize({
      fields: {
        omit: ["salt", "password", "tenant_id", "user_id", "createdAt", "updatedAt"],
      },
    });
  }

  public async show({ params, bouncer }: HttpContextContract) {
    const user = await User.findOrFail(params.id);
    await bouncer.with("UserPolicy").authorize("tenant", user);

    return user;
  }

  public async me({ auth: { user } }: HttpContextContract) {
    if (user) {
      const acl = await getUserAcl(user.id);

      return {
        id: user.id,
        name: user.name,
        document: user.document,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        acl,
      };
    }
  }

  public async profile({ request, auth, response }: HttpContextContract) {
    const { ...data } = await request.validate(UserProfileValidator);

    const user = await User.findOrFail(auth.user?.id);

    //check is phone exists
    const phoneExists = await User.query()
      .where("phone", data.phone)
      .whereNot("id", user.id)
      .first();

    if (phoneExists) {
      return response.badRequest({ message: "o telefone informado já está em uso." });
    }

    await user.merge(data).save();
    const acl = await getUserAcl(user?.id!);

    return {
      id: user.id,
      name: user.name,
      document: user.document,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      acl,
    };
  }

  public async update({ request, params, bouncer, auth }: HttpContextContract) {
    const { role_ids, ...data } = await request.validate(UserUpdateValidator);
    const user = await User.findOrFail(params.id);

    //policy
    console.log("auth =>", auth.user?.name);

    await bouncer.with("UserPolicy").authorize("tenant", user);

    await user.merge(data).save();
    await user.related("roles").sync(role_ids);

    return user;
  }

  public async avatar({ request, response }: HttpContextContract) {
    const { user_id, file } = await request.validate(AvatarValidator);
    const user = await User.findOrFail(user_id);

    if (user.avatar) {
      try {
        Drive.use("s3").delete(`avatars/${user.avatar}`);
        Drive.use("s3").delete(`thumbs/${user.avatar}`);
      } catch (error) {
        user.avatar = "";
        await user.save();
        console.log(error);
      }
    }

    try {
      const fileName = `${uuid()}.png`;

      const fileBuffer = await sharp(file.tmpPath)
        .resize(600, 600, {
          fit: "cover",
          position: "center",
        })
        .toBuffer();

      const thumbBuffer = await sharp(file.tmpPath)
        .resize(70, 70, {
          fit: "cover",
          position: "center",
        })
        .toBuffer();

      await Drive.put(`avatars/${fileName}`, fileBuffer, {
        visibility: "public",
        contentType: "image/png",
        cacheControl: "public,max-age=290304000",
      });

      await Drive.put(`thumbs/${fileName}`, thumbBuffer, {
        visibility: "public",
        contentType: "image/png",
        cacheControl: "public,max-age=290304000",
      });

      const user = await User.findOrFail(user_id);
      user.avatar = fileName;
      await user.save();

      return { avatar: user.avatar };
    } catch (error) {
      console.log({ error });
      return response.badRequest({ message: "Não foi possível salvar a imagem.", error });
    }
  }

  public async password({ auth, request, response }: HttpContextContract) {
    const { password, new_password } = await request.validate(UserPasswordValidator);
    const user = await User.findOrFail(auth.user?.id);

    if (!(await Hash.verify(user.password, `${password}${user.salt}`))) {
      return response.badRequest({ message: "a senha atual não confere" });
    }

    user.password = new_password;
    await user.save();

    return response.ok("success");
  }
}
