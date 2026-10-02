# Ekart — Django backend + React frontend (connected)

```
ekart/
├── backend/    Django + Django REST Framework  -> http://localhost:8000
└── frontend/   React + Vite                    -> http://localhost:5173
```

## Run it (Windows PowerShell) — two windows, both stay open

**Window 1 – backend**
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Window 2 – frontend**
```powershell
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## First-time setup (2 minutes)
Your 4 existing products have **price = 0** because the price column is new.
Open http://localhost:8000/admin/ (log in as your superuser **Aparna**), go to *Products*, and set a price for each.

## How the two halves talk
React (`frontend/src/api.js`) -> HTTP + JSON -> Django (`backend/api/`)

| What | Endpoint |
|---|---|
| Sign up / login / logout / who am I | `POST /api/auth/register/` `login/` `logout/`, `GET /api/auth/me/` |
| List / search products | `GET /api/products/?search=serum` |
| Product detail | `GET /api/products/<slug>/` |
| Add product (login) | `POST /api/products/` (multipart, with image) |
| Delete product (author only) | `DELETE /api/products/<slug>/` |
| Place order (login) | `POST /api/orders/` |
| My orders (login) | `GET /api/orders/` |

Login gives the browser a **token**; `api.js` attaches it to every request automatically.

## Tests
```powershell
cd backend
python manage.py test
```

## Your original Django-template pages still work
http://localhost:8000/ (the old server-rendered shop) — with the bugs fixed.

## Still to do (ideas for later)
- Payment gateway (Razorpay/Stripe) — checkout currently places the order as "pending"
- Edit-product page in React (API already supports `PATCH /api/products/<slug>/`)
- Product categories, reviews, pagination
- Deployment: set `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=0`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` as environment variables; use PostgreSQL; build the frontend with `npm run build`
