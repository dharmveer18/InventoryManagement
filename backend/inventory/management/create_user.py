from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group

class Command(BaseCommand):
    help = "Create a user and optionally assign a group"

    def add_arguments(self, parser):
        parser.add_argument("username", type=str)
        parser.add_argument("email", type=str)
        parser.add_argument("password", type=str)
        parser.add_argument("--group", type=str, help="Group name (admin, manager, viewer)")

    def handle(self, *args, **options):
        username = options["username"]
        email = options["email"]
        password = options["password"]
        group_name = options.get("group")

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f"User '{username}' already exists."))
            return

        user = User.objects.create_user(username=username, email=email, password=password)

        if group_name:
            group, _ = Group.objects.get_or_create(name=group_name)
            user.groups.add(group)

        self.stdout.write(self.style.SUCCESS(f"✅ Created user '{username}' (group: {group_name or 'none'})"))
