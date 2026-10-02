import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <img src="/logo.jpg" alt="Zeloura" className="brand-logo" />
        Zeloura
      </Link>
      <nav>
        <NavLink to="/">Shop</NavLink>
        {user ? (
          <>
            <NavLink to="/products/new">Add product</NavLink>
            <NavLink to="/orders">My orders</NavLink>
            <span className="muted hello">Hi, {user.username}</span>
            <button className="link-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Sign up</NavLink>
          </>
        )}
        <NavLink to="/cart" className="cart-link">
          Cart{count > 0 && <span className="badge">{count}</span>}
        </NavLink>
      </nav>
    </header>
  );
}
