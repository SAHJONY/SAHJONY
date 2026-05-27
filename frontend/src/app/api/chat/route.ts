import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Service not configured' }), { status: 503 })
  }

  const { agentId } = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { data: agent } = await supabase
    .from('agents')
    .select('id, name')
    .eq('id', agentId)
    .single()

  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert({
      user_id: user.id,
      agent_id: agentId,
      title: agent?.name ? `Chat with ${agent.name}` : 'New Chat',
    })
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return Response.json(conversation)
}