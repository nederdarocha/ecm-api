import { string } from "@ioc:Adonis/Core/Helpers";

export const SYSTEM_ROLES = ["Admin", "Seller", "Reports"] as const;

export type SystemRoles = typeof SYSTEM_ROLES[number];

type Role = {
  name: string;
  slug: string;
  description?: string;
};

type Roles = { [key in SystemRoles]: Role };

export const ROLES: Roles = SYSTEM_ROLES.reduce((roles, role) => {
  return Object.assign(roles, {
    [role]: {
      name: string.snakeCase(role).toUpperCase(),
      slug: string.dashCase(role),
    },
  });
}, {}) as Roles;
