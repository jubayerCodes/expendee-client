"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "./loading";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading, getToken } = useAuth();

  const token = getToken();

  useEffect(() => {
    if (!token && !isLoading) {
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isLoading]);

  if (isLoading) {
    return <Loading />;
  }

  return children;
}

export default ProtectedRoute;
