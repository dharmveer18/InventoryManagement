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

        items_list = [
            Item(name="Whole Wheat Flour (5kg)", category=categories["Groceries"], price=8.25, low_stock_threshold=25, quantity=5),
            Item(name="Olive Oil (1L)", category=categories["Groceries"], price=12.00, low_stock_threshold=10, quantity=5),
            Item(name="Green Tea (20 bags)", category=categories["Beverages"], price=6.50, low_stock_threshold=15,  quantity=5),
            Item(name="Potato Chips (200g)", category=categories["Snacks"], price=2.50, low_stock_threshold=30,  quantity=5),
            Item(name="Dishwashing Liquid (500ml)", category=categories["Cleaning Supplies"], price=3.75, low_stock_threshold=20,  quantity=5),
            Item(name="Shampoo (250ml)", category=categories["Personal Care"], price=7.00, low_stock_threshold=12,  quantity=5),
        ]

        Item.objects.bulk_create(items_list)
        self.stdout.write(self.style.SUCCESS(f"✅ Seeded {len(items_list)} items and {len(categories)} categories."))
