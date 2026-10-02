import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils";

export default function Cart() {
  const { items, setQuantity, removeItem, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="center">
        <h1>Your cart is empty</h1>
        <Link className="btn" to="/">Continue shopping</Link>
      </div>
    );
  }

  return (
    <section>
      <h1>Your cart</h1>
      <div className="cart">
        {items.map((i) => (
          <div className="cart-row" key={i.id}>
            <img src={i.image} alt={i.title} />
            <div className="grow">
              <Link to={`/products/${i.slug}`}>{i.title}</Link>
              <div className="muted">{formatPrice(i.price)} each</div>
            </div>
            <input
              type="number"
              className="qty"
              min="1"
              max={i.stock}
              value={i.quantity}
              onChange={(e) => setQuantity(i.id, Number(e.target.value) || 1)}
            />
            <strong className="line">{formatPrice(i.price * i.quantity)}</strong>
            <button className="link-btn" onClick={() => removeItem(i.id)}>Remove</button>
          </div>
        ))}
      </div>
      <div className="summary">
        <span>Total</span>
        <strong>{formatPrice(total)}</strong>
        <button className="btn" onClick={() => navigate("/checkout")}>Checkout</button>
      </div>
    </section>
  );
}
