/*
|*****************************************************************
| NOTE: Lembre-se de registra a policy no arquivo start/bouncer.ts
|******************************************************************
*/

import { BasePolicy } from "@ioc:Adonis/Addons/Bouncer";
import User from "App/Modules/Users/Models/User";

export default class UserPolicy extends BasePolicy {
  public async tenant(
    userAuth: User, // User should always be the first argument
    user: User
  ) {
    return user.tenant_id === userAuth.tenant_id;
  }
}
