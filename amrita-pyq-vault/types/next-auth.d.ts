import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: "STUDENT" | "MODERATOR" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "STUDENT" | "MODERATOR" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "STUDENT" | "MODERATOR" | "ADMIN";
  }
}
