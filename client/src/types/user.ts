export type UserRole = "AUTHOR" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  city?: string | null;
  joinedDate?: string | null;
}
