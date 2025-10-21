import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/__authenticated")({
  beforeLoad: async ({ context }) => {
    const { isAuthenticated } = context.authentication;
    if (!isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
});