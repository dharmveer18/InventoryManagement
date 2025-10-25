from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Lists all usernames and emails by executing a raw SQL query.'

    def handle(self, *args, **options):
        # Use the connection cursor to execute raw SQL
        with connection.cursor() as cursor:
            # Using the custom user model table 'users_user'
            cursor.execute("""
                SELECT username, email, is_staff, role 
                FROM users_user 
                ORDER BY username
            """)
            
            # Fetch all results
            user_list = cursor.fetchall()

        if not user_list:
            self.stdout.write(self.style.WARNING('No users found.'))
            return

        self.stdout.write(self.style.SUCCESS('--- System User List ---'))
        
        # Iterate and print results
        for username, email, is_staff, role in user_list:
            status = 'Staff' if is_staff else 'User'
            self.stdout.write(f"{username:<15} | {email:<30} | Role: {role:<8} | Status: {status}")

        self.stdout.write(self.style.SUCCESS('------------------------'))