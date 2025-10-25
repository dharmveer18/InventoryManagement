from django.db.models import QuerySet
from inventory.models import Item

def get_items() -> QuerySet[Item]:
    """
    Get all items with their related data efficiently loaded.
    
    Returns:
        QuerySet of Items with category and current_level pre-loaded
    """
    return Item.objects.select_related(
        "category",
        "current_level"
    )