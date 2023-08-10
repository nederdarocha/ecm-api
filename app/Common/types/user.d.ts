import { DateTime } from "luxon";

export type IUser = {
  id?: string;
  name: string;
  document?: string;
  email?: string;
  phone: string;
  salt?: number;
  password?: string;
  avatar?: string;
  status?: boolean;
};
