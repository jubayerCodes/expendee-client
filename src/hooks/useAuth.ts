import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Cookies from "js-cookie";

const supabase = createClient();

export function useAuth() {

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);

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

      setIsLoading(false);
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
    isLoading,
  };
}
