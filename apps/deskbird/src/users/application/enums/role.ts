export enum Roles {
  ADMIN = 'admin',
  USER = 'user',
}

export function isRole(role: string): role is Roles {
  return Object.values(Roles).includes(role as Roles);
}
