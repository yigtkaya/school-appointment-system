import { requireAuth } from "@/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/__authenticated")({
  beforeLoad: async ({ context }) => {
    requireAuth(context.auth)
  },
});