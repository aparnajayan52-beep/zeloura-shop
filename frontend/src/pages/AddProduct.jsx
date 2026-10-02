import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errorMessage } from "../api";

export default function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", text: "", price: "", stock: "10" });
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return setError("Please choose an image.");
    setBusy(true);
    setError("");
    // Files must be sent as FormData (multipart), not as plain JSON.
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    data.append("image", image);
    try {
      const res = await api.post("/products/", data);
      navigate(`/products/${res.data.slug}`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h1>Add product</h1>
      {error && <p className="alert">{error}</p>}
      <label>Title<input value={form.title} onChange={set("title")} required /></label>
      <label>Description<textarea rows="4" value={form.text} onChange={set("text")} required /></label>
      <label>Price (₹)<input type="number" min="0" step="0.01" value={form.price} onChange={set("price")} required /></label>
      <label>Stock<input type="number" min="0" value={form.stock} onChange={set("stock")} required /></label>
      <label>Image
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />
      </label>
      {image && <img className="preview" src={URL.createObjectURL(image)} alt="preview" />}
      <button className="btn" disabled={busy}>{busy ? "Saving…" : "Create product"}</button>
    </form>
  );
}
