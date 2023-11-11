import { AuthContract } from "@ioc:Adonis/Addons/Auth";
import Database from "@ioc:Adonis/Lucid/Database";
import Env from "@ioc:Adonis/Core/Env";
import Notification from "../Models/Notification";
import _ from "lodash";

interface NotificationType {
  tenant_id: string;
  tag: string | null;
  subject: string;
  message: string;
  status: string;
  user_id: string | null;
  from_id: string | null;
  to_id: string;
  go_to: string;
}

export type TaskType = {
  id: string;
  description: string;
  make_in: string;
  initials: string;
  court_number: string;
  service_name: string;
  name: string;
  document: string;
  natural: boolean;
};

interface CreateNotifyExpiringTaskProps {
  auth: AuthContract;
}

export class NotificationService {
  private auth: AuthContract;
  private allUserIdsToNotify: string[];

  public async createNotifyExpiringTask({ auth }: CreateNotifyExpiringTaskProps): Promise<any> {
    this.auth = auth;

    // busca as tarefas com prazo a vencer
    const tasks = await this.getDueTask();
    if (!tasks) return;

    this.allUserIdsToNotify = await this.getAllActiveUsersIdsToNotify();

    for await (const task of tasks) {
      // busca as notificações já criadas da tarefa
      const notifiedUsersIds = await this.getNotifiedUsersIdsByTask(task.id);
      // remove os usuários já notificados
      const userIdsToNotify = _.difference(this.allUserIdsToNotify, notifiedUsersIds);
      // cria as notificações para os usuários
      let notifications: NotificationType[] = [];
      for (const user_id of userIdsToNotify) {
        notifications.push({
          tenant_id: auth.user!.tenant_id,
          tag: task.id,
          subject: `Prazo a vencer em ${task.make_in}`,
          message: `Cliente ${task.name}, ${task.service_name} ${
            task.initials && `- ${task.initials}`
          } ${task.court_number && task.court_number} ${task.description && task.description}`,
          status: "unread",
          user_id: null,
          from_id: null,
          to_id: user_id,
          go_to: `/tasks/${task.id}`,
        });
      }
      await Notification.createMany(notifications);
    }
  }

  public async getDueTask(): Promise<TaskType[] | null> {
    const { rows: tasks } = await Database.rawQuery<{ rows: TaskType[] }>(
      `
    SELECT t.id, t.description, to_char(timezone('EAT',t.make_in),'DD/MM/YYYY') make_in, co.initials, os.court_number, s."name" as service_name, c."name", c."document", c."natural"
    FROM tasks t
    JOIN customer_order_service os on t.customer_order_service_id = os.id
    LEFT JOIN courts co on os.court_id = co.id
    LEFT JOIN customers c on os.customer_id = c.id
    LEFT JOIN services s on os.service_id = s.id
    WHERE t.tenant_id = :tenant_id
    AND t.make_in - interval '${Env.get("INTERVAL_ALERT_DUE_TASKS", "2 days")}' <= now()
    AND t.confirmed_at ISNULL;
    `,
      { tenant_id: this.auth.user!.tenant_id }
    );

    if (tasks.length > 0) {
      return tasks;
    } else {
      return null;
    }
  }

  public async getAllActiveUsersIdsToNotify(): Promise<string[]> {
    const { rows: users } = await Database.rawQuery<{ rows: { id: string }[] }>(
      `
      select u.id
      from users u
      join role_user ru on u.id = ru.user_id
      join roles r on ru.role_id = r.id
      WHERE u.tenant_id = :tenant_id
      AND r.slug in('admin','supp')
      AND u.status = true;
      `,
      { tenant_id: this.auth.user!.tenant_id }
    );

    if (users.length > 0) {
      return users.map((user) => user.id);
    }
    return [];
  }

  public async getNotifiedUsersIdsByTask(tag: string): Promise<string[]> {
    const { rows: usersNotified } = await Database.rawQuery(
      `
      SELECT n.to_id, n.tag
      FROM notifications n
      WHERE n.tenant_id = :tenant_id
      AND n.tag = :tag;
    `,
      { tag, tenant_id: this.auth.user!.tenant_id }
    );

    if (usersNotified.length > 0) {
      return usersNotified.map((notification) => notification.to_id);
    }

    return [];
  }
}
