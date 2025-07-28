export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export function isRole(role: string): role is Role {
  return Object.values(Role).includes(role as Role);
}
