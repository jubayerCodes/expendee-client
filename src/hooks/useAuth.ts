import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const supabase = createClient();

export function useAuth() {
  const router = useRouter();
  const routerRef = useRef(router);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        Cookies.set("access_token", session.access_token, {
          expires: 1,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
        Cookies.set("refresh_token", session.refresh_token, {
          expires: 1,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
      } else {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
      }

      if (event === "SIGNED_OUT") routerRef.current.push("/login");
      if (event === "SIGNED_IN") routerRef.current.push("/dashboard");
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    signUp: (email: string, password: string) =>
      supabase.auth.signUp({ email, password }),

    signIn: (email: string, password: string) =>
      supabase.auth.signInWithPassword({ email, password }),

    signOut: () => supabase.auth.signOut(),

    getToken: () => Cookies.get("access_token"),
  };
}
