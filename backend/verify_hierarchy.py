import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Usuario, Publicacao, Comentario
from core.serializers import ComentarioSerializer


def main():
    # Confirmation before deletion
    confirm = input(
        "This script will delete comments with conteudo_texto starting with "
        "'TEST_HIERARCHY'. Proceed? [y/N]: "
    )
    if confirm.lower() != "y":
        print("Aborting without running hierarchy verification.")
        return

    # Cleanup previous test data
    Comentario.objects.filter(conteudo_texto__startswith="TEST_HIERARCHY").delete()

    # Setup
    user = Usuario.objects.first()
    post = Publicacao.objects.first()

    if not user or not post:
        print("Error: No user or post found to test.")
        return

    print(f"Testing with User: {user.nome_usuario}, Post ID: {post.id_publicacao}")

    # 1. Create Root Comment
    root_comment = Comentario.objects.create(
        usuario=user,
        publicacao=post,
        conteudo_texto="TEST_HIERARCHY_ROOT"
    )
    print(f"Created Root Comment ID: {root_comment.id_comentario}")

    # 2. Create Reply
    reply_comment = Comentario.objects.create(
        usuario=user,
        publicacao=post,
        conteudo_texto="TEST_HIERARCHY_REPLY",
        comentario_pai=root_comment
    )
    print(f"Created Reply Comment ID: {reply_comment.id_comentario}")

    # 3. Test Serialization
    serializer = ComentarioSerializer(root_comment)
    data = serializer.data

    print("\n--- Serialized Data ---")
    # Check if answers are present
    if 'respostas' in data:
        print("SUCCESS: 'respostas' field found in serializer data.")
        respostas = data['respostas']
        print(f"Number of replies: {len(respostas)}")
        
        found_reply = False
        for r in respostas:
            if r['id_comentario'] == reply_comment.id_comentario:
                found_reply = True
                print("SUCCESS: specific reply found in nested list.")
                break
        
        if not found_reply:
            print("FAILURE: Reply not found in nested list.")
    else:
        print("FAILURE: 'respostas' field MISSING in serializer data.")

    # 4. Test ViewSet QuerySet Logic
    # Emulate what get_queryset does
    root_comments_qs = Comentario.objects.filter(publicacao=post, comentario_pai__isnull=True)
    if root_comment in root_comments_qs:
        print("SUCCESS: Root comment is in filtered queryset.")
    else:
        print("FAILURE: Root comment NOT in filtered queryset.")

    if reply_comment not in root_comments_qs:
        print("SUCCESS: Reply comment is NOT in filtered queryset (as expected).")
    else:
        print("FAILURE: Reply comment IS in filtered queryset (should be excluded).")

    # Cleanup
    # root_comment.delete() # Cascade deletes reply
    # print("Test data cleaned up.")


if __name__ == "__main__":
    main()
