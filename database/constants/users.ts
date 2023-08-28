import Env from "@ioc:Adonis/Core/Env";
import crypto from "node:crypto";
import { TENANTS } from "./";

export const USERS = {
  sup_admin: {
    tenant_id: TENANTS.alfa.id,
    first_name: "Super",
    last_name: "Bento",
    email: "super@bento.dev.br",
    document: "00266668712",
    phone: "21964276349",
    password: Env.get("USER_PASSWORD", "secret"),
    salt: crypto.randomBytes(16).toString("hex"),
  },
  admin: {
    tenant_id: TENANTS.alfa.id,
    first_name: "Admin",
    last_name: "Bento",
    email: "admin@bento.dev.br",
    document: "11147771022",
    password: Env.get("USER_PASSWORD", "secret"),
    salt: crypto.randomBytes(16).toString("hex"),
  },
  supp: {
    tenant_id: TENANTS.alfa.id,
    first_name: "Assistente",
    last_name: "Bento",
    email: "supp@bento.dev.br",
    document: "22830168860",
    password: Env.get("USER_PASSWORD", "secret"),
    salt: crypto.randomBytes(16).toString("hex"),
  },
};
