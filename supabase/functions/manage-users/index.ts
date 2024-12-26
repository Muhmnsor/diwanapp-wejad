import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('Received request:', req.method)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Creating Supabase client...')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { operation, userId, newPassword, newRole } = await req.json()
    console.log('Managing user:', { operation, userId })

    if (operation === 'get_users') {
      console.log('Fetching users...')
      const { data: users, error: usersError } = await supabaseClient.auth.admin.listUsers()
      if (usersError) {
        console.error('Error fetching users:', usersError)
        throw usersError
      }

      console.log('Retrieved users count:', users.users.length)
      return new Response(
        JSON.stringify({ users: users.users }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (operation === 'update_password') {
      console.log('Updating password for user:', userId)
      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      )
      if (updateError) {
        console.error('Error updating password:', updateError)
        throw updateError
      }

      console.log('Password updated successfully for user:', userId)
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (operation === 'update_role') {
      console.log('Updating role for user:', userId, 'to:', newRole)
      
      // Get role ID
      const { data: roleData, error: roleError } = await supabaseClient
        .from('roles')
        .select('id')
        .eq('name', newRole)
        .single()

      if (roleError) {
        console.error('Error fetching role:', roleError)
        throw roleError
      }

      // Delete existing roles for the user
      const { error: deleteError } = await supabaseClient
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

      if (deleteError) {
        console.error('Error deleting existing roles:', deleteError)
        throw deleteError
      }

      // Insert new role
      const { error: insertError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleData.id
        })

      if (insertError) {
        console.error('Error inserting new role:', insertError)
        throw insertError
      }

      console.log('Role updated successfully for user:', userId)
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (operation === 'delete_user') {
      console.log('Deleting user:', userId)
      // First delete user roles
      const { error: deleteRolesError } = await supabaseClient
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

      if (deleteRolesError) {
        console.error('Error deleting user roles:', deleteRolesError)
        throw deleteRolesError
      }

      // Then delete the user from auth.users
      const { error: deleteUserError } = await supabaseClient.auth.admin.deleteUser(
        userId
      )
      if (deleteUserError) {
        console.error('Error deleting user:', deleteUserError)
        throw deleteUserError
      }

      console.log('User deleted successfully:', userId)
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error(`Unsupported operation: ${operation}`)
  } catch (error) {
    console.error('Error in manage-users function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})