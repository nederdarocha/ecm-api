import { File } from "../Models/File"

export class UserService {
  public async findById(id: string): Promise<Partial<File> | null> {
    const user = await File.query().where("id", id).firstOrFail()
    return user.serialize({
      fields: {
        omit: ["id", "created_at", "updated_at"],
      },
      relations: {
        roles: {
          fields: {
            pick: ["slug"],
          },
        },
      },
    })
  }
}
