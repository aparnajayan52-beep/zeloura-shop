import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorMessage } from "../api";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (items.length === 0) {
    return (
      <div className="center">
        <p>Nothing to check out.</p>
        <Link className="btn" to="/">Go shopping</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      // We only send product id + quantity. Django looks up the real price itself.
      const res = await api.post("/orders/", {
        ...form,
        cart: items.map((i) => ({ product: i.id, quantity: i.quantity })),
      });
      clear();
      navigate("/orders", { state: { placed: res.data.id } });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h1>Checkout</h1>
      {error && <p className="alert">{error}</p>}
      <label>Full name<input value={form.full_name} onChange={set("full_name")} required /></label>
      <label>Phone<input value={form.phone} onChange={set("phone")} required /></label>
      <label>Delivery address<textarea rows="3" value={form.address} onChange={set("address")} required /></label>
      <p>{items.length} item(s) · <strong>{formatPrice(total)}</strong></p>
      <button className="btn" disabled={busy}>{busy ? "Placing order…" : "Place order"}</button>
    </form>
  );
}
