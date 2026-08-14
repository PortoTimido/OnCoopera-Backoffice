import { loadEnvFile } from "node:process";
import { defineConfig } from "prisma/config";

loadEnvFile("backend/.env");

export default defineConfig({
  schema: "db/prisma/schema.prisma",
  migrations: {
    path: "db/prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
