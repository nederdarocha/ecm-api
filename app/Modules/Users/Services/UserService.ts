import User from "../Models/User"

export class UserService {
  public async findById(id: string): Promise<Partial<User> | null> {
    const user = await User.query().preload("roles").where("id", id).firstOrFail()
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
    })
  }
}
