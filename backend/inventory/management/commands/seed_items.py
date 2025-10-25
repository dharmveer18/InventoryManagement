from django.core.management.base import BaseCommand
from inventory.models import Category, Item

class Command(BaseCommand):
    help = "Seeds the database with default categories and items"

    def handle(self, *args, **options):
        Item.objects.all().delete()
        Category.objects.all().delete()

        categories = {
            "Groceries": Category.objects.create(name="Groceries"),
            "Beverages": Category.objects.create(name="Beverages"),
            "Snacks": Category.objects.create(name="Snacks"),
            "Cleaning Supplies": Category.objects.create(name="Cleaning Supplies"),
            "Personal Care": Category.objects.create(name="Personal Care"),
        }

        # Create items first
        items_data = [
            {"name": "Whole Wheat Flour (5kg)", "category": categories["Groceries"], "price": 8.25, "low_stock_threshold": 25, "quantity": 50},
            {"name": "Olive Oil (1L)", "category": categories["Groceries"], "price": 12.00, "low_stock_threshold": 10, "quantity": 30},
            {"name": "Green Tea (20 bags)", "category": categories["Beverages"], "price": 6.50, "low_stock_threshold": 15, "quantity": 40},
            {"name": "Potato Chips (200g)", "category": categories["Snacks"], "price": 2.50, "low_stock_threshold": 30, "quantity": 100},
            {"name": "Dishwashing Liquid (500ml)", "category": categories["Cleaning Supplies"], "price": 3.75, "low_stock_threshold": 20, "quantity": 45},
            {"name": "Shampoo (250ml)", "category": categories["Personal Care"], "price": 7.00, "low_stock_threshold": 12, "quantity": 35},
        ]

        for item_data in items_data:
            quantity = item_data.pop('quantity')
            item = Item.objects.create(
                name=item_data['name'],
                category=item_data['category'],
                price=item_data['price'],
                low_stock_threshold=item_data['low_stock_threshold']
            )
            item.adjust_stock(quantity, "Initial stock")
            
        self.stdout.write(self.style.SUCCESS(f"✅ Seeded {len(items_data)} items and {len(categories)} categories."))
