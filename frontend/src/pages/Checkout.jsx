import { useEffect, useState } from "react";
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
  // Pre-fill name/phone/address from the customer's most recent order (newest comes first)
  useEffect(() => {
    api
      .get("/orders/")
      .then((res) => {
        const last = res.data[0];
        if (last) {
          setForm((f) => ({
            full_name: f.full_name || last.full_name,
            phone: f.phone || last.phone,
            address: f.address || last.address,
          }));
        }
      })
      .catch(() => { }); // pre-fill is optional; ignore errors
  }, []);
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
      <label>Full name
        <input value={form.full_name} onChange={set("full_name")} required minLength={2}
          pattern="[^0-9]*" title="Name cannot contain numbers" />
      </label>
      <label>Mobile number
        <input type="tel" inputMode="numeric" value={form.phone} onChange={set("phone")} required
          placeholder="10-digit mobile number" pattern="(\+91|91|0)?[ \-]?[6-9][0-9 \-]{9,12}"
          title="Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9" />
      </label>
      <label>Delivery address
        <textarea rows="3" value={form.address} onChange={set("address")} required minLength={10}
          placeholder="House name/number, street, area, city, PIN code" />
      </label>
      <p>{items.length} item(s) · <strong>{formatPrice(total)}</strong></p>
      <button className="btn" disabled={busy}>{busy ? "Placing order…" : "Place order"}</button>
    </form>
  );
}
