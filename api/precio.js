export default async function handler(req, res) {
  const supermercado = req.query.super;
  let id = req.query.id;

  if (!id) return res.status(400).json({ error: "ID requerido" });

  // --- BONÀREA (API real) ---
if (supermercado === 'bonarea') {
  try {
    const response = await fetch(`https://www.bonarea-online.com/api/product/${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(404).json({ error: `BonArea no encuentra el producto ${id}` });
    }

    const data = await response.json();

    return res.status(200).json({
      id,
      nombre: data.name || "Producto BonÀrea",
      precio: parseFloat(data.price)
    });

  } catch (e) {
    return res.status(500).json({ error: "Error de conexión con BonArea" });
  }
}

