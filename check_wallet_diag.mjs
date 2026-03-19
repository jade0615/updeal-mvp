const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc'

async function q(path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
  })
  return r.json()
}

async function main() {
  const prefix = 'a895d3'

  // Test with correct % wildcard via PostgREST ilike
  const users1 = await q(`users?select=id,name,phone&id=ilike.${prefix}*&limit=5`)
  console.log('Using * wildcard:', JSON.stringify(users1))

  const users2 = await q(`users?select=id,name,phone&id=ilike.${prefix}%25&limit=5`)
  console.log('Using %25 wildcard:', JSON.stringify(users2))

  // Try startsWith via PostgREST filter
  const r = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,name,phone&id=ilike.${prefix}*&limit=5`, {
    headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Range-Unit': 'items' }
  })
  console.log('Status:', r.status)
  const d = await r.json()
  console.log('Result:', JSON.stringify(d))

  // Try raw SQL via RPC
  const rpc = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,name,phone&id=like.${prefix}*&limit=5`, {
    headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
  })
  console.log('Using like.*', JSON.stringify(await rpc.json()))
}
main().catch(console.error)
