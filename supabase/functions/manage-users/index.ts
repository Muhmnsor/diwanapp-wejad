import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { operation, userId, newPassword, newRole } = await req.json()
    
    console.log('Managing user:', { operation, userId })

    if (operation === 'get_users') {
      const { data: users, error: usersError } = await supabaseClient.auth.admin.listUsers()
      if (usersError) throw usersError

      console.log('Retrieved users count:', users.users.length)
      return new Response(
        JSON.stringify({ users: users.users }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (operation === 'update_password') {
      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      )
      if (updateError) throw updateError

      console.log('Password updated successfully for user:', userId)
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (operation === 'update_role') {
      console.log('Updating role for user:', { userId, newRole })

      // First get the role ID
      const { data: roleData, error: roleError } = await supabaseClient
        .from('roles')
        .select('id')
        .eq('name', newRole)
        .single()

      if (roleError) throw roleError

      // Delete existing roles for the user
      const { error: deleteError } = await supabaseClient
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      // Insert new role
      const { error: insertError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleData.id
        })

      if (insertError) throw insertError

      console.log('Role updated successfully for user:', userId)
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (operation === 'delete_user') {
      // First delete user roles
      const { error: deleteRolesError } = await supabaseClient
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

      if (deleteRolesError) throw deleteRolesError

      // Then delete the user from auth.users
      const { error: deleteUserError } = await supabaseClient.auth.admin.deleteUser(
        userId
      )
      if (deleteUserError) throw deleteUserError

      console.log('User deleted successfully:', userId)
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid operation')
  } catch (error) {
    console.error('Error managing users:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})