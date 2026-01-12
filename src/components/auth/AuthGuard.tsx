"use client";

import { useRole } from "@/providers/RoleProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, userId } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !userId) {
      router.replace("/login");
    }
  }, [loading, userId, router]);

  if (loading || !userId) return null;

  return <>{children}</>;
}