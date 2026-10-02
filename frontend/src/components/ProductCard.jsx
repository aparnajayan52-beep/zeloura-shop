import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils";


export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const soldOut = product.stock === 0;

  return (
    <article className="card">
      <Link to={`/products/${product.slug}`}>
        <img src={product.image} alt={product.title} loading="lazy" />
      </Link>
      <div className="card-body">
        <h3><Link to={`/products/${product.slug}`}>{product.title}</Link></h3>
        <p className="muted clamp">{product.text}</p>
        <div className="row">
          <strong>{formatPrice(product.price)}</strong>
          <button className="btn small" disabled={soldOut} onClick={() => addItem(product)}>
            {soldOut ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
