import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface RequestBody {
  requestId: number;
  recipientEmail: string;
  recipientName: string;
  responseText: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase environment variables are not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: RequestBody = await req.json();
    const { requestId, recipientEmail, recipientName, responseText } = body;

    if (!requestId || !recipientEmail || !recipientName || !responseText) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "The Lens <recommendations@thelensreviews.com>",
        to: [recipientEmail],
        subject: "Your Recommendation from The Lens",
        html: `
          <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2a2118; font-size: 24px; margin-bottom: 20px;">Hi ${recipientName},</h1>
            <p style="color: #2a2118; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Thank you for reaching out! Here's my recommendation based on what you shared:
            </p>
            <div style="background-color: #f4f0ec; border-left: 4px solid #2a2118; padding: 16px; margin-bottom: 20px;">
              <p style="color: #2a2118; font-size: 16px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${responseText}</p>
            </div>
            <p style="color: #2a2118; font-size: 16px; line-height: 1.6;">
              Best,<br>
              <strong>The Lens</strong>
            </p>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              This email was sent from <a href="https://thelensreviews.com" style="color: #2a2118;">thelensreviews.com</a>
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData.message || "Unknown error"}`);
    }

    const { error: updateError } = await supabaseClient
      .from("recommendation_request")
      .update({
        has_responded: true,
        response: responseText,
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw new Error("Email sent but failed to update database");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent and request updated" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
