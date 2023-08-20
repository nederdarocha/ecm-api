import Customer from "../Models/Customer";

export class CustomerService {
  public async findById(id: string): Promise<Partial<Customer> | null> {
    const user = await Customer.findOrFail(id);
    return user.serialize({
      fields: {
        omit: ["tenant_id", "created_at", "updated_at"],
      },
    });
  }
}
