from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group
from users.models import User

class Command(BaseCommand):
    help = 'Seed the database with sample users - 2 with roles and 2 without roles'

    def handle(self, *args, **options):
        # Create or get groups (roles)
        admin_group, _ = Group.objects.get_or_create(name='Admin')
        manager_group, _ = Group.objects.get_or_create(name='Manager')

        # Define user data
        users_data = [
            {
                'username': 'admin.user',
                'email': 'admin@example.com',
                'password': 'Admin@123',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'role': 'admin',
                'group': admin_group
            },
            {
                'username': 'manager.user',
                'email': 'manager@example.com',
                'password': 'Manager@123',
                'first_name': 'Manager',
                'last_name': 'User',
                'role': 'manager',
                'group': manager_group
            },
            {
                'username': 'basic.user1',
                'email': 'basic1@example.com',
                'password': 'Basic@123',
                'first_name': 'Basic',
                'last_name': 'User One',
                'role': 'viewer'
            },
            {
                'username': 'basic.user2',
                'email': 'basic2@example.com',
                'password': 'Basic@123',
                'first_name': 'Basic',
                'last_name': 'User Two',
                'role': 'viewer'
            }
        ]

        # Create or update users
        for user_data in users_data:
            group = user_data.pop('group', None)
            username = user_data['username']
            
            try:
                user = User.objects.get(username=username)
                # Update existing user
                for key, value in user_data.items():
                    if key != 'password':  # Don't update password of existing users
                        setattr(user, key, value)
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Updated existing user: {username}'))
            except User.DoesNotExist:
                # Create new user
                user = User.objects.create_user(**user_data)
                self.stdout.write(self.style.SUCCESS(f'Created new user: {username}'))
            
            # Handle group assignment
            if group:
                user.groups.clear()
                user.groups.add(group)

        self.stdout.write(self.style.SUCCESS('Successfully created/updated all sample users'))