import os
from dotenv import load_dotenv

print("🔍 VERIFICANDO LEITURA DO .env")
print("=" * 40)

# Sem load_dotenv
print("SEM load_dotenv():")
print(f"SUPABASE_URL: {os.getenv('SUPABASE_URL')}")
print(f"SUPABASE_KEY: {os.getenv('SUPABASE_KEY', 'AUSENTE')}")

print("\n" + "=" * 40)

# Com load_dotenv
load_dotenv()
print("COM load_dotenv():")
print(f"SUPABASE_URL: {os.getenv('SUPABASE_URL')}")
print(f"SUPABASE_KEY: {os.getenv('SUPABASE_KEY', 'AUSENTE')}")