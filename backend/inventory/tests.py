from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from inventory.models import Item, Category
from django.contrib.auth import get_user_model
from users.models import Roles

class ItemAPITestCase(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username="testuser", password="testpass")
        self.client.force_authenticate(user=self.user)
        self.category = Category.objects.create(name="Test Category")
        self.item = Item.objects.create(
            name="Test Item",
            category=self.category,
            price=10.99,
            low_stock_threshold=5
        )

    def test_get_item(self):
        url = reverse('item-detail', args=[self.item.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.item.id)
        self.assertEqual(response.data['name'], self.item.name)
        self.assertEqual(response.data['category']['id'], self.category.id)

class CategoryAPITestCase(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username="testuser", password="testpass")
        self.client.force_authenticate(user=self.user)
        self.category = Category.objects.create(name="Test Category")

    def test_get_category(self):
        url = reverse('category-detail', args=[self.category.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.category.id)
        self.assertEqual(response.data['name'], self.category.name)

class StockAPITestCase(APITestCase):
    def setUp(self):
        self.manager = get_user_model().objects.create_user(
            username="manager",
            password="testpass",
            role=Roles.MANAGER,
        )
        self.client.force_authenticate(user=self.manager)
        self.category = Category.objects.create(name="Test Category")
        self.item = Item.objects.create(
            name="Test Item",
            category=self.category,
            price=10.99,
            low_stock_threshold=5
        )

    def test_update_stock(self):
        url = reverse('item-adjust-stock', args=[self.item.id])
        payload = {
            "item": self.item.id,
            "delta": 5,
            "note": "Restock",
            "reason": "manual"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.item.refresh_from_db()
        self.assertEqual(self.item.quantity, 5)


class BulkStockAPITestCase(APITestCase):
    def setUp(self):
        self.manager = get_user_model().objects.create_user(
            username="manager2",
            password="testpass",
            role=Roles.MANAGER,
        )
        self.client.force_authenticate(user=self.manager)
        self.category = Category.objects.create(name="Bulk Cat")
        # Create two items and give the first an initial stock of 5
        self.item1 = Item.objects.create(
            name="Bulk Item 1",
            category=self.category,
            price=5.00,
            low_stock_threshold=2,
        )
        self.item1.adjust_stock(5, reason="init", user=self.manager)

        self.item2 = Item.objects.create(
            name="Bulk Item 2",
            category=self.category,
            price=7.50,
            low_stock_threshold=3,
        )

    def test_bulk_with_wrong_item_id_returns_400_and_no_changes(self):
        url = reverse('item-bulk-adjust-stock')
        payload = {
            "adjustments": [
                {"item": self.item1.id, "delta": 3, "note": "recount", "reason": "csv"},
                {"item": 999999, "delta": -2, "note": "bad id", "reason": "csv"},
            ],
            "reason": "csv",
        }

        # Capture initial quantities
        q1_before = self.item1.quantity
        q2_before = self.item2.quantity  # should be 0

        resp = self.client.post(url, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

        # Ensure no changes applied to any items
        self.item1.refresh_from_db()
        self.item2.refresh_from_db()
        self.assertEqual(self.item1.quantity, q1_before)
        self.assertEqual(self.item2.quantity, q2_before)

    def test_bulk_all_valid_applies_both_adjustments(self):
        url = reverse('item-bulk-adjust-stock')
        payload = {
            "adjustments": [
                {"item": self.item1.id, "delta": +5, "note": "restock", "reason": "csv"},
                {"item": self.item2.id, "delta": -1, "note": "count", "reason": "csv"},
            ],
            "reason": "csv",
        }

        q1_before = self.item1.quantity  # 5
        q2_before = self.item2.quantity  # 0

        resp = self.client.post(url, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # Expect two transactions serialized
        self.assertIsInstance(resp.data, list)
        self.assertEqual(len(resp.data), 2)

        self.item1.refresh_from_db()
        self.item2.refresh_from_db()
        self.assertEqual(self.item1.quantity, q1_before + 5)
        self.assertEqual(self.item2.quantity, max(0, q2_before - 1))
