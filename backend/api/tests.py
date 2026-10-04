import io

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework.test import APITestCase

from product.models import Product, Order


def fake_image(name="p.png"):
    buf = io.BytesIO()
    Image.new("RGB", (4, 4)).save(buf, "PNG")
    return SimpleUploadedFile(name, buf.getvalue(), content_type="image/png")


@override_settings(MEDIA_ROOT="/tmp/ekart_test_media")
class EkartApiTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user("owner", password="StrongPass#123", is_staff=True)
        self.other = User.objects.create_user("other", password="StrongPass#123")
        self.p = Product.objects.create(slug="serum", title="Serum", text="x" * 100,
                                        price="500.00", stock=5, image="products/x.png",
                                        author=self.owner)

    def login(self, username="owner"):
        r = self.client.post("/api/auth/login/", {"username": username, "password": "StrongPass#123"})
        self.assertEqual(r.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION="Token " + r.data["token"])

    # ---- auth
    def test_register_returns_token(self):
        r = self.client.post("/api/auth/register/", {"username": "new", "password": "StrongPass#123"})
        self.assertEqual(r.status_code, 201)
        self.assertIn("token", r.data)

    def test_register_rejects_weak_password(self):
        r = self.client.post("/api/auth/register/", {"username": "new", "password": "12345678"})
        self.assertEqual(r.status_code, 400)

    def test_login_wrong_password(self):
        r = self.client.post("/api/auth/login/", {"username": "owner", "password": "nope"})
        self.assertEqual(r.status_code, 400)

    def test_me_requires_login(self):
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 401)
        self.login()
        self.assertEqual(self.client.get("/api/auth/me/").data["username"], "owner")

    # ---- products
    def test_anyone_can_list_and_search(self):
        r = self.client.get("/api/products/?search=serum")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.data), 1)

    def test_create_requires_login(self):
        r = self.client.post("/api/products/", {"title": "A", "text": "b", "price": "10", "image": fake_image()},
                             format="multipart")
        self.assertEqual(r.status_code, 401)

    def test_create_product_autoslug_and_author(self):
        self.login()
        r = self.client.post("/api/products/", {"title": "Face Wash", "text": "b", "price": "99.50",
                                                "stock": 3, "image": fake_image()}, format="multipart")
        self.assertEqual(r.status_code, 201, r.data)
        self.assertEqual(r.data["slug"], "face-wash")
        self.assertEqual(Product.objects.get(slug="face-wash").author, self.owner)

    def test_only_author_can_delete(self):
        self.login("other")
        self.assertEqual(self.client.delete("/api/products/serum/").status_code, 403)
        self.login("owner")
        self.assertEqual(self.client.delete("/api/products/serum/").status_code, 204)

    def test_missing_product_is_404(self):
        self.assertEqual(self.client.get("/api/products/nope/").status_code, 404)

    # ---- orders
    def order_payload(self, qty=2, price_lie="1.00"):
        return {"full_name": "A B", "phone": "9999999999", "address": "Somewhere, Kerala",
                "cart": [{"product": self.p.id, "quantity": qty, "price": price_lie}]}

    def test_order_requires_login(self):
        self.assertEqual(self.client.post("/api/orders/", self.order_payload(), format="json").status_code, 401)

    def test_order_uses_server_price_and_reduces_stock(self):
        self.login("other")
        r = self.client.post("/api/orders/", self.order_payload(qty=2), format="json")
        self.assertEqual(r.status_code, 201, r.data)
        self.assertEqual(str(r.data["total"]), "1000.00")     # 2 x 500, NOT the "1.00" the client sent
        self.p.refresh_from_db()
        self.assertEqual(self.p.stock, 3)

    def test_order_fails_when_not_enough_stock_and_rolls_back(self):
        self.login("other")
        r = self.client.post("/api/orders/", self.order_payload(qty=6), format="json")
        self.assertEqual(r.status_code, 400)
        self.assertEqual(Order.objects.count(), 0)            # no half-created order left behind
        self.p.refresh_from_db()
        self.assertEqual(self.p.stock, 5)

    def test_user_sees_only_own_orders(self):
        self.login("other")
        self.client.post("/api/orders/", self.order_payload(qty=1), format="json")
        self.login("owner")
        self.assertEqual(len(self.client.get("/api/orders/").data), 0)
    def test_customer_cannot_create_product(self):
        self.login("other")
        r = self.client.post("/api/products/", {"title": "A", "text": "b", "price": "10", "image": fake_image()},format="multipart")
        self.assertEqual(r.status_code, 403)
