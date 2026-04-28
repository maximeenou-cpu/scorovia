import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid form data" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const media = formData.get("media");
  if (!media) {
    return new Response(JSON.stringify({ error: "Missing media field" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const fd = new FormData();
  fd.append("media", media);
  fd.append("models", "nudity-2.0,offensive");
  fd.append("api_user", Deno.env.get("SIGHTENGINE_API_USER")!);
  fd.append("api_secret", Deno.env.get("SIGHTENGINE_API_SECRET")!);

  let safe = true;
  try {
    const r = await fetch("https://api.sightengine.com/1.0/check.json", {
      method: "POST",
      body: fd,
    });
    const d = await r.json();

    if (d.status === "success") {
      const n = d.nudity || {};
      const o = d.offensive?.prob || 0;
      safe = !(
        n.sexual_activity > 0.5 ||
        n.sexual_display > 0.5 ||
        n.erotica > 0.6 ||
        o > 0.7
      );
    }
  } catch {
    // Si SightEngine est inaccessible, on laisse passer (fail-open)
    safe = true;
  }

  return new Response(JSON.stringify({ safe }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
