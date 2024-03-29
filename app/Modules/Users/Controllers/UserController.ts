import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "../Models/User";
import { AvatarValidator, UserValidator, UserIndexValidator } from "../Validators";
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
import { UserService } from "../Services/UserService";
import LastAccess from "../Models/LastAccess";

import { schema } from "@ioc:Adonis/Core/Validator";

const filterSchema = schema.create({
  filter: schema.string.optional({
    trim: true,
  }),
});

export default class UsersController {
  private service: UserService;

  constructor() {
    this.service = new UserService();
  }

  public async index({ paginate, request, auth }: HttpContextContract) {
    await request.validate(UserIndexValidator);
    const { page, per_page } = paginate;
    const { filter, status, role_id, customer_id } = request.qs();

    const tsquery = filter ? filter?.replace(/\s/g, "+") + ":*" : "";

    const query = User.query()
      // .debug(true)
      .preload("customer", (sq) => sq.select("id", "name", "document", "natural"))
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere((sq) =>
        sq
          .orWhereRaw(
            "to_tsvector(unaccent(concat(first_name,' ',last_name))) @@ to_tsquery(unaccent(?))",
            [tsquery]
          )
          .orWhere("email", "iLike", `%${filter}%`)
          .orWhere("document", "iLike", `%${filter?.replace(/[.|-]/g, "")}%`)
          .orWhere("phone", "iLike", `%${filter}%`)
      );

    if (status) {
      query.andWhere("status", status === "true" ? true : false);
    }

    if (role_id) {
      query.andWhereHas("roles", (query) => query.whereIn("role_id", [role_id]));
    }

    if (customer_id) {
      query.andWhere("customer_id", customer_id);
    }

    const users = await query
      .preload("roles", (sq) => sq.select("id", "name").orderBy("name", "asc"))
      .orderBy("first_name", "asc")
      .paginate(page, per_page);

    return users.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
      relations: { roles: { fields: { omit: ["id"] } } },
    });
  }

  public async filter({ auth, request }: HttpContextContract) {
    let { filter } = await request.validate({ schema: filterSchema });
    filter = filter || "";
    const tsquery = filter ? filter?.replace(/\s/g, "+") + ":*" : "";

    const users = await User.query()
      // .debug(true)
      .select("id", "first_name", "last_name", "document")
      .where("tenant_id", auth.user!.tenant_id)
      .andWhere((sq) =>
        sq
          .orWhereRaw(
            "to_tsvector(unaccent(concat(first_name,' ',last_name))) @@ to_tsquery(unaccent(?))",
            [tsquery]
          )
          .orWhere("document", "iLike", `%${filter?.replace(/[.|-]/g, "")}%`)
      )
      .orderBy("first_name", "asc")
      .limit(20);

    return users;
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const { role_ids, ...data } = await request.validate(UserValidator);
    const { tenant_id } = auth.user!;
    const salt = await bcrypt.genSalt(10);

    const isSigleUser = await this.service.isSigleUser({ auth, request });
    if (isSigleUser && isSigleUser instanceof Error) {
      return response.badRequest({ message: isSigleUser.message });
    }

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
          name: user.first_name,
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
    const user = await User.query()
      .preload("roles", (sq) => sq.select("id", "name").orderBy("name"))
      .preload("customer", (sq) => sq.select("id", "name", "document", "natural"))
      .where("id", params.id)
      .firstOrFail();

    await bouncer.with("UserPolicy").authorize("tenant", user);

    return user;
  }

  public async me({ auth: { user }, request }: HttpContextContract) {
    if (user) {
      const acl = await getUserAcl({ user_id: user.id, short: true });

      const ip = request.headers()["x-forwarded-for"] || request.ip();
      LastAccess.create({
        user_id: user.id,
        ip: Array.isArray(ip) ? ip.join(", ") : ip,
        user_agent: request.headers()["user-agent"],
      });

      return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
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
    const acl = await getUserAcl({ user_id: user?.id!, short: true });

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

  public async update({ auth, request, response, params, bouncer }: HttpContextContract) {
    let { role_ids, ...data } = await request.validate(UserValidator);
    const user = await User.findOrFail(params.id);

    //policy
    await bouncer.with("UserPolicy").authorize("tenant", user);

    const isSigleUser = await this.service.isSigleUser({ auth, request, id: params.id });
    if (isSigleUser && isSigleUser instanceof Error) {
      return response.badRequest({ message: isSigleUser.message });
    }

    await user.merge(data).save();

    const user_roles = await user.related("roles").query();
    const isSuperAdmin = user_roles.find((role) => role.slug === "sup_admin");
    if (isSuperAdmin) {
      role_ids.push(isSuperAdmin.id);
    }

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

  public async changePassword({ auth, request, response }: HttpContextContract) {
    const { password, new_password } = await request.validate(UserPasswordValidator);
    const user = await User.findOrFail(auth.user?.id);

    if (!(await Hash.verify(user.password, `${password}${user.salt}`))) {
      return response.badRequest({ message: "a senha atual não confere" });
    }

    user.password = new_password;
    await user.save();

    Mail.send((message) => {
      message
        .from(Env.get("MAIL_FROM"), Env.get("MAIL_NAME"))
        .to(user.email)
        .subject(`${Env.get("MAIL_SUBJECT")} - Senha alterada`)
        .htmlView("emails/change-password", {
          name: user.name,
          date: user.updatedAt.toFormat("dd/MM/yyyy"),
          time: user.updatedAt.toFormat("HH:mm:ss"),
          logs: request.ip(),
        });
    });

    return response.ok("success");
  }

  public async lastAccesses({ paginate, request }: HttpContextContract) {
    await request.validate(UserIndexValidator);
    const { page, per_page } = paginate;
    const { user_id } = request.qs();

    const query = LastAccess.query().preload("user", (sq) =>
      sq.select("id", "first_name", "last_name", "document")
    );

    if (user_id) {
      query.andWhere("user_id", user_id);
    }

    const users = await query.orderBy("created_at", "desc").paginate(page, per_page);

    return users.serialize({
      fields: { omit: ["tenant_id", "user_id"] },
      relations: { user: { fields: { omit: ["id"] } } },
    });
  }
}
