export default async function handler(req, res) {
  const supermercado = req.query.super;
  const id = req.query.id;

  if (!id || id === "0") return res.status(400).json({ error: "ID no válido" });

  // --- MERCADONA (VILADECANS 08840) ---
  if (supermercado === 'mercadona') {
    try {
      const response = await fetch(`https://tienda.mercadona.es/api/products/${id}`, {
        headers: {
          'Cookie': 'warehouse=08840',
          'User-Agent': 'Mozilla/5.0'
        }
      });
      const data = await response.json();
      return res.status(200).json({
        id,
        nombre: data.display_name,
        precio: parseFloat(data.price_instructions.unit_price)
      });
    } catch (e) {
      return res.status(500).json({ error: "Error en Mercadona" });
    }
  }

  // --- BONÀREA (Buscador mejorado) ---
  if (supermercado === 'bonarea') {
    try {
      const response = await fetch(`https://www.bonarea-online.com/es/shop/product/${id}`);
      if (!response.ok) return res.status(404).json({ error: "No encontrado" });
      
      const html = await response.text();
      
      // Buscamos el precio dentro del objeto JSON "offers" de la web
      const precioMatch = html.match(/"price":\s*"([\d.]+)"/) || html.match(/price:\s*([\d.]+)/);
      const nombreMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);

      if (precioMatch) {
        return res.status(200).json({
          id,
          nombre: nombreMatch ? nombreMatch[1].trim() : "Producto BonÀrea",
          precio: parseFloat(precioMatch[1])
        });
      }
      return res.status(404).json({ error: "Precio no detectado" });
    } catch (e) {
      return res.status(500).json({ error: "Error en BonÀrea" });
    }
  }

  return res.status(404).json({ error: "Super no soportado" });
}
