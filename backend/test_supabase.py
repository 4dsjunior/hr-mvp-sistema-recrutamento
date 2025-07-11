from supabase import create_client

# Teste com service_role (permissão total)
SUPABASE_URL = "https://dcfekbodccwlvyfxvukx.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmVrYm9kY2N3bHZ5Znh2dWt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU1NjU1OCwiZXhwIjoyMDY3MTMyNTU4fQ.NVYtQTzK36fBDN8J6Lqq7pi65Z8x8zf0MR6I3rdcgH4"

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Testar jobs
try:
    result = supabase.table('jobs').select('*').execute()
    print(f"✅ Jobs encontrados: {len(result.data)}")
    if result.data:
        print(f"Primeiro job: {result.data[0]}")
except Exception as e:
    print(f"❌ Erro jobs: {e}")

# Testar applications
try:
    result = supabase.table('applications').select('*').execute()
    print(f"✅ Applications encontradas: {len(result.data)}")
except Exception as e:
    print(f"❌ Erro applications: {e}")