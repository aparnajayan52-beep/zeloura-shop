import { useEffect, useState } from "react";
import api, { errorMessage } from "../api";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Re-fetch whenever the search text changes (after a short pause so we don't spam the server)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .get("/products/", { params: { search } })
        .then((res) => {
          setProducts(res.data);
          setError("");
        })
        .catch((err) => setError(errorMessage(err)))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <section>
      <div className="page-head">
        <h1>Our Best Sellers</h1>
        <input
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="alert">{error}</p>}
      {loading && <p className="muted">Loading products…</p>}
      {!loading && !error && products.length === 0 && <p className="muted">No products found.</p>}

      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
