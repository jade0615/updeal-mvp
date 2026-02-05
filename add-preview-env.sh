#!/bin/bash
set -e

echo "添加环境变量到 Vercel Preview 环境..."

# Supabase
echo "NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL preview production development <<< "https://vlnhnvanfzbgfnxqksln.supabase.co"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview production development <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODIxMjAsImV4cCI6MjA4MTM1ODEyMH0.13whLP60defQzrxiA_4bMg0exHHlTFfJ7Nq5AW1cvVE"
echo "SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY preview production development <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc"

echo "完成！"
