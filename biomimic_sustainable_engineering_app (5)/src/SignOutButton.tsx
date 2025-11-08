"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-6 py-2 rounded bg-white text-gray-600 border border-gray-200 font-medium hover:bg-gray-50 hover:text-black transition-colors"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );
}
