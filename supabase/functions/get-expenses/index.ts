import { createClient } from "npm:@supabase/supabase-js@2"
import { corsHeaders } from "jsr:@supabase/supabase-js@2/cors"

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const teamId = url.searchParams.get("teamId")

    if (!teamId) {
      return new Response(JSON.stringify({ error: "Missing teamId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const publishableKeysRaw = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS")
    if (!publishableKeysRaw) throw new Error("SUPABASE_PUBLISHABLE_KEYS is required")
    const publishableKeys = JSON.parse(publishableKeysRaw) as Record<string, string>

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      publishableKeys["default"],
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    const { data, error } = await supabase
      .from("expenses")
      .select("*, profiles(full_name, email)")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
