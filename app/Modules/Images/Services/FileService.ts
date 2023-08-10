import Image from "../Models/Image";

export class UserService {
  public async findById(id: string): Promise<Partial<Image> | null> {
    const user = await Image.query().where("id", id).firstOrFail();
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
    });
  }
}
