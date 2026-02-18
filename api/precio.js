export default async function handler(req, res) {
  const supermercado = req.query.super;
  const id = req.query.id;

  // --- LÓGICA MERCADONA ---
  if (supermercado === 'mercadona') {
    try {
      const response = await fetch(`https://tienda.mercadona.es/api/products/${id}`);

      if (!response.ok) {
        return res.status(404).json({ error: "Producto no encontrado en Mercadona" });
      }

      const data = await response.json();
      const precio = data.price_instructions.unit_price;

      return res.status(200).json({
        id,
        nombre: data.display_name,
        precio: parseFloat(precio)
      });

    } catch (error) {
      return res.status(500).json({ error: "Error obteniendo datos de Mercadona" });
    }
  }

  // --- LÓGICA BONÀREA ---
  if (supermercado === 'bonarea') {
    try {
      // BonÀrea usa IDs numéricos en su URL de producto
      const response = await fetch(`https://www.bonarea-online.com/es/shop/product/${id}`);
      
      if (!response.ok) {
        return res.status(404).json({ error: "Producto no encontrado en BonÀrea" });
      }

      const html = await response.text();
      
      // Buscamos el precio en el HTML (está en una etiqueta meta de Schema.org o similar)
      const precioMatch = html.match(/"price":\s*"([\d.]+)"/);
      const nombreMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);

      if (precioMatch) {
        return res.status(200).json({
          id,
          nombre: nombreMatch ? nombreMatch[1].trim() : "Producto BonÀrea",
          precio: parseFloat(precioMatch[1])
        });
      } else {
        return res.status(404).json({ error: "No se pudo extraer el precio de BonÀrea" });
      }

    } catch (error) {
      return res.status(500).json({ error: "Error obteniendo datos de BonÀrea" });
    }
  }

  return res.status(404).json({ error: "Supermercado no soportado" });
}
