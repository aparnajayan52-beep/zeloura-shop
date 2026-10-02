import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api, { errorMessage } from "../api";
import { formatPrice } from "../utils";

export default function Orders() {
  const location = useLocation();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/orders/")
      .then((res) => setOrders(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  return (
    <section>
      <h1>My orders</h1>
      {location.state?.placed && (
        <p className="ok-box">Order #{location.state.placed} placed successfully 🎉</p>
      )}
      {error && <p className="alert">{error}</p>}
      {orders === null && !error && <p className="muted">Loading…</p>}
      {orders?.length === 0 && <p className="muted">You haven't placed any orders yet.</p>}

      {orders?.map((o) => (
        <div className="order" key={o.id}>
          <div className="row">
            <strong>Order #{o.id}</strong>
            <span className={`status ${o.status}`}>{o.status}</span>
          </div>
          <div className="muted">{new Date(o.created).toLocaleString()} · {o.address}</div>
          <ul>
            {o.items.map((it) => (
              <li key={it.id}>
                {it.quantity} × {it.title} — {formatPrice(it.line_total)}
              </li>
            ))}
          </ul>
          <div className="right"><strong>Total {formatPrice(o.total)}</strong></div>
        </div>
      ))}
    </section>
  );
}
