import { DateTime } from "luxon";

export type IPart = {
  id: string;
  order: number;
  name: string;
  variation_id: string;
  value: number | null;
  build_days: number | null;
  description?: string;
  status: boolean;
  user_id: string;
  product_id: string;
  part_id: string | null;
  createdAt: DateTime;
  updatedAt: DateTime;
};

export type IDictionaryId = {
  oldId: string;
  newId: string;
};
