import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dreamshare_backend.settings')
django.setup()

from core.models import Usuario

# Check accounts
accounts = ['joaoportolan@gmail.com', 'admin@root']

for email in accounts:
    user = Usuario.objects.filter(email=email).first()
    if user:
        print(f"\n{email}:")
        print(f"  - Status: {user.status} (1=Ativo, 2=Suspenso)")
        print(f"  - Has password: {bool(user.password)}")
        print(f"  - Password starts with: {user.password[:20]}...")
        
        # Reset password
        user.set_password('teste123')
        user.status = 1  # Ensure active
        user.save()
        print(f"  ✅ Password reset to 'teste123' and status set to Ativo")
    else:
        print(f"\n{email}: NAO EXISTE no banco")
