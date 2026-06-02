export type AuthenticatedUser = {
  id: string;
  email: string;
  username: string;
  roles: string[];
  permissions: string[];
};
