from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings
# from simple_history.models import HistoricalRecords

class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)

    def __str__(self):
        return self.name

class Item(models.Model):
  name = models.CharField(max_length=120, unique=True)
  category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="items")
  price = models.DecimalField(max_digits=12, decimal_places=2)
  low_stock_threshold = models.PositiveIntegerField(default=0)
  quantity = models.PositiveIntegerField(default=0)
  # history = HistoricalRecords()
  def __str__(self):
    return self.name


# class StockHistory(models.Model):
#   item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="history")
#   delta = models.IntegerField() # +in / -out
#   balance = models.IntegerField() # set on save
#   note = models.CharField(max_length=200, blank=True)
#   created_at = models.DateTimeField(auto_now_add=True)
#   created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)


#   class Meta:
#     ordering = ["-created_at"]
