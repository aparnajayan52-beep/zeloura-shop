import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    setBusy(true);
    setError("");
    try {
      await register(form.username, form.email, form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h1>Create account</h1>
      {error && <p className="alert">{error}</p>}
      <label>Username<input value={form.username} onChange={set("username")} required autoFocus /></label>
      <label>Email<input type="email" value={form.email} onChange={set("email")} /></label>
      <label>Password (min 8 characters)<input type="password" value={form.password} onChange={set("password")} required /></label>
      <label>Confirm password<input type="password" value={form.confirm} onChange={set("confirm")} required /></label>
      <button className="btn" disabled={busy}>{busy ? "Creating…" : "Sign up"}</button>
      <p className="muted">Already have an account? <Link to="/login">Login</Link></p>
    </form>
  );
}
