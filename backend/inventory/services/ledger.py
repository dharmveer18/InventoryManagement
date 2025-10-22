from django.db import transaction
# from inventory.models import Item, StockHistory
# from inventory.tasks import send_low_stock_alert


# @transaction.atomic
# def apply_stock_delta(*, item: Item, delta: int, user, note: str = "") -> StockHistory:
#   last = item.history.order_by("-created_at").first()
#   balance = (last.balance if last else 0) + delta
#   entry = StockHistory.objects.create(item=item, delta=delta, balance=balance, note=note, created_by=user)
#   if balance <= item.low_stock_threshold:
#     # send_low_stock_alert.delay(item.id)
#     print("low balance")
#   return entry