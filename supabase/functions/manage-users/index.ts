
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.1.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the request is from an admin user
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return new Response(JSON.stringify({ error: "Authorization header is required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check if user is admin
    const { data: roles, error: rolesError } = await supabaseClient
      .from("user_roles")
      .select(`
        role_id,
        roles (
          name
        )
      `)
      .eq("user_id", user.id);

    if (rolesError) {
      return new Response(JSON.stringify({ error: "Error fetching user roles" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const isAdmin = roles?.some(r => r.roles?.name === "admin");

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Unauthorized - Admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Parse request body
    const { operation, userId, newPassword, roleId } = await req.json();

    // Perform the requested operation
    switch (operation) {
      case "update_password":
        if (!userId || !newPassword) {
          return new Response(JSON.stringify({ error: "User ID and new password are required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
          userId,
          { password: newPassword }
        );

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

      case "delete_user":
        if (!userId) {
          return new Response(JSON.stringify({ error: "User ID is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(userId);

        if (deleteError) {
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

      default:
        return new Response(JSON.stringify({ error: "Invalid operation" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
