import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dreamshare_backend.settings')
django.setup()

from core.models import Usuario

# Create joaoportolan@gmail.com
if not Usuario.objects.filter(email='joaoportolan@gmail.com').exists():
    user = Usuario.objects.create_user(
        email='joaoportolan@gmail.com',
        nome_usuario='joaoportolan',
        nome_completo='João Portolan',
        password='teste123'
    )
    user.bio = "Desenvolvedor do DreamShare 🚀"
    user.save()
    print("✅ Conta joaoportolan@gmail.com criada com senha 'teste123'")
else:
    print("⚠️ joaoportolan@gmail.com já existe")

# Create admin@root (admin account)
if not Usuario.objects.filter(email='admin@root').exists():
    user = Usuario.objects.create_user(
        email='admin@root',
        nome_usuario='admin',
        nome_completo='Administrador',
        password='admin123'
    )
    user.is_admin = True
    user.bio = "Administrador do Sistema 🔒"
    user.save()
    print("✅ Conta admin@root criada com senha 'admin123' (é admin)")
else:
    print("⚠️ admin@root já existe")

print("\n📋 Credenciais:")
print("  joaoportolan@gmail.com / teste123")
print("  admin@root / admin123 (acesso ao painel admin)")
