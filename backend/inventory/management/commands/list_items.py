from django.core.management.base import BaseCommand
from django.db import connection
from inventory.models import Item, Category

class Command(BaseCommand):
    help = 'Lists all items in the inventory with their details'

    def add_arguments(self, parser):
        parser.add_argument(
            '--category',
            help='Filter items by category name',
        )
        parser.add_argument(
            '--sql',
            action='store_true',
            help='Use raw SQL query instead of ORM',
        )

    def handle(self, *args, **options):
        if options['sql']:
            self.list_items_sql(options['category'])
        else:
            self.list_items_orm(options['category'])

    def list_items_orm(self, category_filter=None):
        """List items using Django ORM"""
        # Base queryset
        items = Item.objects.select_related('category').all()
        
        # Apply category filter if provided
        if category_filter:
            items = items.filter(category__name__iexact=category_filter)

        # Check if we have any items
        if not items.exists():
            self.stdout.write(self.style.WARNING('No items found.'))
            return

        # Print header
        self.stdout.write(self.style.SUCCESS('\n=== Inventory Items ==='))
        header = f"{'Name':<30} | {'Category':<15} | {'Quantity':<8} | {'Price':<10} | {'Low Stock':<9}"
        self.stdout.write(header)
        self.stdout.write('-' * len(header))

        # Print each item
        for item in items:
            category_name = item.category.name if item.category else 'No Category'
            self.stdout.write(
                f"{item.name:<30} | {category_name:<15} | {item.quantity:<8} | ${item.price:<9} | {item.low_stock_threshold:<9}"
            )

        # Print summary
        self.stdout.write('-' * len(header))
        self.stdout.write(self.style.SUCCESS(f'Total Items: {items.count()}'))

    def list_items_sql(self, category_filter=None):
        """List items using raw SQL query"""
        with connection.cursor() as cursor:
            # Base query
            query = """
                SELECT 
                    i.name,
                    COALESCE(c.name, 'No Category') as category_name,
                    i.quantity,
                    i.price,
                    i.low_stock_threshold
                FROM inventory_item i
                LEFT JOIN inventory_category c ON i.category_id = c.id
            """
            
            params = []
            if category_filter:
                query += " WHERE LOWER(c.name) = LOWER(%s)"
                params.append(category_filter)
            
            query += " ORDER BY i.name"
            
            # Execute query
            cursor.execute(query, params)
            items = cursor.fetchall()

            if not items:
                self.stdout.write(self.style.WARNING('No items found.'))
                return

            # Print header
            self.stdout.write(self.style.SUCCESS('\n=== Inventory Items (SQL) ==='))
            header = f"{'Name':<30} | {'Category':<15} | {'Quantity':<8} | {'Price':<10} | {'Low Stock':<9}"
            self.stdout.write(header)
            self.stdout.write('-' * len(header))

            # Print each item
            for item in items:
                self.stdout.write(
                    f"{item[0]:<30} | {item[1]:<15} | {item[2]:<8} | ${item[3]:<9} | {item[4]:<9}"
                )

            # Print summary
            self.stdout.write('-' * len(header))
            self.stdout.write(self.style.SUCCESS(f'Total Items: {len(items)}'))