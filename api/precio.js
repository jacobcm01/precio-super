export default async function handler(req, res) {
  const supermercado = req.query.super;
  let id = req.query.id;

  if (!id) return res.status(400).json({ error: "ID requerido" });

  // --- MERCADONA (VILADECANS 08840) ---
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

  // --- BONÀREA (Buscador Robusto) ---
  if (supermercado === 'bonarea') {
    try {
      // Intentamos con el ID limpio (quitando prefijos como 13_ si los hubiera)
      const idLimpio = id.includes('_') ? id.split('_')[1] : id;
      const urlBonArea = `https://www.bonarea-online.com/es/shop/product/${idLimpio}`;
      
      const response = await fetch(urlBonArea, {
          headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html',
              'Referer': 'https://www.bonarea-online.com/'
          }
      });

      if (!response.ok) {
          // Si da 404, devolvemos un mensaje claro para el Logcat
          return res.status(404).json({ error: `BonArea no encuentra el producto ${idLimpio}` });
      }
      
      const html = await response.text();
      
      // Buscamos el precio en el script JSON de la página
      const precioMatch = html.match(/"price"\s*:\s*"([\d.]+)"/) || html.match(/price\s*:\s*([\d.]+)/);
      const nombreMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);

      if (precioMatch) {
        return res.status(200).json({
          id: idLimpio,
          nombre: nombreMatch ? nombreMatch[1].trim() : "Producto BonÀrea",
          precio: parseFloat(precioMatch[1])
        });
      }
      return res.status(404).json({ error: "HTML cargado pero precio no encontrado" });
    } catch (e) {
      return res.status(500).json({ error: "Error de conexión con BonArea" });
    }
  }

  return res.status(404).json({ error: "Super no soportado" });
}
