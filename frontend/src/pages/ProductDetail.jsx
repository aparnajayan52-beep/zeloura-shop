import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { errorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api
      .get(`/products/${slug}/`)
      .then((res) => setProduct(res.data))
      .catch((err) => setError(err.response?.status === 404 ? "Product not found." : errorMessage(err)));
  }, [slug]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${slug}/`);
      navigate("/");
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (error) return <p className="alert">{error}</p>;
  if (!product) return <p className="muted">Loading…</p>;

  const canEdit = user && (user.id === product.author_id || user.is_staff);

  return (
    <article className="detail">
      <img src={product.image} alt={product.title} />
      <div>
        <h1>{product.title}</h1>
        <p className="price">{formatPrice(product.price)}</p>
        <p>{product.text}</p>
        <p className="muted">
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"} · added by {product.author}
        </p>

        {product.stock > 0 && (
          <div className="row left">
            <input
              type="number"
              min="1"
              max={product.stock}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(Number(e.target.value) || 1, product.stock)))}
              className="qty"
            />
            <button
              className="btn"
              onClick={() => {
                addItem(product, qty);
                setAdded(true);
              }}
            >
              Add to cart
            </button>
            {added && <span className="ok">Added ✓</span>}
          </div>
        )}

        {canEdit && (
          <button className="btn danger" onClick={handleDelete}>Delete product</button>
        )}
      </div>
    </article>
  );
}
