import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is an admin/super_admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role client for all admin operations
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Verify caller identity via getClaims
    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = claimsData.claims.sub;

    // Check caller has admin or super_admin role
    const { data: callerRoles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .in("role", ["admin", "super_admin"]);

    if (!callerRoles || callerRoles.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, password, role, display_name, phone } = await req.json();

    if (!email || !password || !role) {
      return new Response(JSON.stringify({ error: "Missing required fields: email, password, role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validRoles = ["admin", "developer", "user"];
    if (!validRoles.includes(role)) {
      return new Response(JSON.stringify({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Create the user via admin API (or find existing)
    let userId: string;
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: display_name || email.split("@")[0],
        phone: phone || null,
      },
    });

    if (createError) {
      // If user already exists, look them up and proceed
      if (createError.message.includes("already been registered")) {
        const { data: { users } } = await adminClient.auth.admin.listUsers();
        const existing = users?.find((u: any) => u.email === email);
        if (!existing) {
          return new Response(JSON.stringify({ error: "User exists but could not be found" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        userId = existing.id;
      } else {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      userId = newUser.user.id;
    }

    // 2. Assign the role
    const { error: roleError } = await adminClient
      .from("user_roles")
      .insert({ user_id: userId, role });

    if (roleError) {
      console.error("Role assignment error:", roleError);
    }

    // 3. Create creator profile
    const referralCode = "IAMBLESSED" + Math.random().toString(36).substring(2, 6).toUpperCase();
    const { error: profileError } = await adminClient
      .from("creator_profiles")
      .insert({
        user_id: userId,
        email,
        display_name: display_name || email.split("@")[0],
        referral_code: referralCode,
        congrats_completed: "completed", // Skip onboarding for admin-invited users
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
    }

    // 4. Send password reset email so user can set their own password
    const { error: resetError } = await adminClient.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/admin`,
      },
    });

    // 5. Also send invite email via Resend if available
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      try {
        // Generate a magic link for first login
        const { data: linkData } = await adminClient.auth.admin.generateLink({
          type: "magiclink",
          email,
          options: {
            redirectTo: `https://funnel-architect-ai-30.lovable.app/admin`,
          },
        });

        const magicLink = linkData?.properties?.action_link || "";

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "I Am Blessed AF <team@iamblessedaf.com>",
            to: [email],
            subject: "🔑 You've been invited to the Admin Panel",
            html: `
              <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                <h1 style="font-size: 24px; color: #111;">Welcome ${display_name || "Team Member"}! 🙌</h1>
                <p style="color: #555; font-size: 16px;">You've been granted <strong>${role}</strong> access to the I Am Blessed AF admin panel.</p>
                
                 <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; margin: 24px 0;">
                   <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Your login email:</strong></p>
                   <p style="margin: 4px 0; font-size: 14px;">📧 Email: <code style="background: #e5e5e5; padding: 2px 6px; border-radius: 4px;">${email}</code></p>
                 </div>

                <p style="color: #555; font-size: 14px;">Click the button below to sign in securely via magic link:</p>
                 
                 ${magicLink ? `<a href="${magicLink}" 
                    style="display: inline-block; background: #7c3aed; color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 16px; margin: 16px 0;">
                   Sign In to Admin Panel →
                 </a>` : `<a href="https://funnel-architect-ai-30.lovable.app/admin" 
                    style="display: inline-block; background: #7c3aed; color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 16px; margin: 16px 0;">
                   Open Admin Panel →
                 </a>`}

                 <p style="color: #999; font-size: 12px; margin-top: 24px;">
                   🔒 For security, use the magic link above to sign in. You can set your own password in profile settings after logging in.
                 </p>
              </div>
            `,
          }),
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        email,
        role,
        message: `User created and invitation sent to ${email}`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Invite error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
