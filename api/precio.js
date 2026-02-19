export default async function handler(req, res) {
  const supermercado = req.query.super;
  const id = req.query.id;

  if (!id) return res.status(400).json({ error: "ID requerido" });

  // --- MERCADONA (NO TOCAR, YA FUNCIONA) ---
  if (supermercado === 'mercadona') {
    try {
      const response = await fetch(`https://tienda.mercadona.es/api/products/${id}`, {
        headers: { 
          'Cookie': 'warehouse=08840', 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
        }
      });

      const data = await response.json();

      return res.status(200).json({
        id,
        nombre: data.display_name || "Producto Mercadona",
        precio: parseFloat(data.price_instructions.unit_price)
      });

    } catch (e) {
      return res.status(500).json({ error: "Error en Mercadona" });
    }
  }

  // --- BONÀREA (API REAL, SIN SCRAPING) ---
  if (supermercado === 'bonarea') {
    try {
      const response = await fetch(`https://www.bonarea-online.com/api/product/${id}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return res.status(404).json({ error: `BonÀrea no encuentra el producto ${id}` });
      }

      const data = await response.json();

      return res.status(200).json({
        id,
        nombre: data.name || "Producto BonÀrea",
        precio: parseFloat(data.price)
      });

    } catch (e) {
      return res.status(500).json({ error: "Error de conexión con BonÀrea" });
    }
  }

  return res.status(404).json({ error: "Super no soportado" });
}
