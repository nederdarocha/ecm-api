import { RequestContract } from "@ioc:Adonis/Core/Request";
import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import User from "../Models/User";

interface CheckExpiringTaskProps {
  auth: AuthContract;
}

export class NotificationService {
  public async checkExpiringTask({ auth }: CheckExpiringTaskProps): Promise<Partial<User> | null> {
    //TODO busca as tarefas que estão com a data de vencimento para hoje e +2dias e não confirmadas
    //TODO cria uma notificação os usuários com perfil de Admin e Assistente de cada tarefa encontrada
    //TODO controlar para que uma notificação não seja criada mais de uma vez para a mesma tarefa go_to

    const user = await User.query().preload("roles").where("id", id).firstOrFail();
    return user.serialize({
      fields: {
        omit: ["user_id", "created_at", "updated_at"],
      },
      relations: {
        roles: {
          fields: {
            pick: ["id", "name"],
          },
        },
      },
    });
  }
}
