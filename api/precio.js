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
        nombre: data.display_name,
        precio: parseFloat(data.price_instructions.unit_price)
      });
    } catch (e) {
      return res.status(500).json({ error: "Error en Mercadona" });
    }
  }

  // --- BONÀREA (Versión Ultra-Compatible) ---
  if (supermercado === 'bonarea') {
    try {
      // Forzamos el ID a número por si acaso
      const cleanId = parseInt(id, 10);
      const urlBonArea = `https://www.bonarea-online.com/es/shop/product/${cleanId}`;
      
      const response = await fetch(urlBonArea, {
          headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Referer': 'https://www.bonarea-online.com/'
          }
      });

      if (!response.ok) return res.status(404).json({ error: `BonArea no responde: ${response.status}` });
      
      const html = await response.text();
      
      // Intentamos extraer el precio buscando el patrón específico que usa BonÀrea en su JSON oculto
      const precioMatch = html.match(/"price"\s*:\s*"?([\d.]+)"?/);
      const nombreMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);

      if (precioMatch && precioMatch[1]) {
        return res.status(200).json({
          id: id,
          nombre: nombreMatch ? nombreMatch[1].trim() : "Producto BonÀrea",
          precio: parseFloat(precioMatch[1])
        });
      }
      
      return res.status(404).json({ error: "Precio no encontrado en el HTML de BonArea" });
    } catch (e) {
      return res.status(500).json({ error: "Error de servidor al conectar con BonArea" });
    }
  }

  return res.status(404).json({ error: "Super no soportado" });
}
