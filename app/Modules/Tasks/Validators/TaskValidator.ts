import { schema, rules } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { commonMessages } from "../../../Common";

export class TaskValidator {
  constructor(protected ctx?: HttpContextContract) {}

  public schema = schema.create({
    type_task_id: schema.string({ trim: true }, [rules.uuid()]),
    users: schema.array.nullableAndOptional().members(schema.string({}, [rules.uuid()])),
    order_id: schema.string({ trim: true }, [rules.uuid()]),
    customer_id: schema.string.optional({ trim: true }, [rules.uuid()]),
    order_service_id: schema.string({ trim: true }, [rules.uuid()]),
    description: schema.string({ trim: true }),
    notes: schema.string.optional({ trim: true }),
    made_at: schema.date({ format: "yyyy-MM-dd" }),
    make_in: schema.date.optional({ format: "yyyy-MM-dd HH:mm" }),
    confirmed_by: schema.string.optional({ trim: true }, [rules.uuid()]),
    status: schema.string.optional({ trim: true }),
  });

  public messages = {
    ...commonMessages,
    "make_in.date.format": "Informe uma data válida para o Prazo/Agenda",
  };
}
