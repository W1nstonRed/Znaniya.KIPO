import { Role } from "@prisma/client";

export type CurrentUser = {
  id: string;
  username: string;
  fullName: string | null;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  isAuthenticated: true;
  groupId?: string;
  teacherId?: string;
  studentId?: string;
};

export type JwtPayload = {
  sub: string;
  username: string;
  role: Role;
};
