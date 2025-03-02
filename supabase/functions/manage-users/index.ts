
import { serve } from "https://deno.land/std@0.198.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  // Ensure request method is POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const requestData = await req.json();
    const { operation, email, password, userId, roleId, newPassword } = requestData;

    console.log(`Received operation: ${operation}`);
    
    // Operations to require admin role
    const adminRequiredOperations = ['create_user_with_role', 'update_role', 'delete_user'];
    
    // Verify admin permissions if required
    if (adminRequiredOperations.includes(operation)) {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        });
      }
      
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.error('Auth error:', authError);
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        });
      }
      
      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('roles:role_id(name)')
        .eq('user_id', user.id)
        .single();
      
      if (roleError || !roleData || roleData.roles?.name !== 'admin') {
        console.error('Role verification error:', roleError);
        return new Response(JSON.stringify({ error: 'Admin role required for this operation' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        });
      }
    }

    // Handle different operations
    let result;
    
    if (operation === 'create_user_with_role') {
      console.log(`Creating new user with email: ${email} and roleId: ${roleId}`);
      
      // Create user
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (userError) {
        console.error('User creation error:', userError);
        return new Response(JSON.stringify({ error: userError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const user = userData.user;
      console.log('User created successfully:', user.id);

      // Wait for profile to be created by the trigger
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Assign role to user using SQL directly to bypass RLS
      if (roleId) {
        console.log(`Assigning role ${roleId} to user ${user.id}`);
        const { data: roleData, error: roleError } = await supabase.rpc('assign_user_role', { 
          p_user_id: user.id, 
          p_role_id: roleId 
        });

        if (roleError) {
          console.error('Error assigning role:', roleError);
          // Don't fail if role assignment fails, just log it
        } else {
          console.log('Role assigned successfully:', roleData);
        }
      }

      result = { success: true, user };
    } 
    else if (operation === 'update_role') {
      console.log(`Updating role for user ${userId} to ${roleId}`);
      
      // First remove existing roles
      const { error: deleteError } = await supabase.rpc('delete_user_roles', { 
        p_user_id: userId 
      });
      
      if (deleteError) {
        console.error('Error removing existing roles:', deleteError);
        return new Response(JSON.stringify({ error: deleteError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      
      // Then assign the new role
      if (roleId) {
        const { data: roleData, error: roleError } = await supabase.rpc('assign_user_role', { 
          p_user_id: userId, 
          p_role_id: roleId 
        });
        
        if (roleError) {
          console.error('Error assigning new role:', roleError);
          return new Response(JSON.stringify({ error: roleError.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }
        console.log('Role updated successfully:', roleData);
      }
      
      result = { success: true, message: 'Role updated successfully' };
    }
    else if (operation === 'update_password') {
      console.log(`Updating password for user ${userId}`);
      
      const { data, error } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );
      
      if (error) {
        console.error('Password update error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      
      result = { success: true, message: 'Password updated successfully' };
    }
    else if (operation === 'delete_user') {
      console.log(`Deleting user ${userId}`);
      
      // Delete user
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) {
        console.error('User deletion error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      
      result = { success: true, message: 'User deleted successfully' };
    }
    else {
      return new Response(JSON.stringify({ error: 'Invalid operation' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Return successful response
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: `Unexpected error: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
