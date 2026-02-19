export default async function handler(req, res) {
  const supermercado = req.query.super;
  const id = req.query.id;

  if (!id) return res.status(400).json({ error: "ID requerido" });

  // --- MERCADONA (VILADECANS 08840) ---
  if (supermercado === 'mercadona') {
    try {
      const response = await fetch(`https://tienda.mercadona.es/api/products/${id}`, {
        headers: { 
            'Cookie': 'warehouse=08840', 
            'User-Agent': 'Mozilla/5.0' 
        }
      });
      if (!response.ok) return res.status(404).json({ error: "No encontrado en Mercadona" });
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

 // --- BONPREU / ESCLAT (Versión Actualizada 2026) ---
  if (supermercado === 'bonpreu') {
    try {
      // Intentamos con la API de producto directa
      const urlBonPreu = `https://www.compraonline.bonpreuesclat.cat/api/v3/products/${id}`;
      
      const response = await fetch(urlBonPreu, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return res.status(404).json({ error: `BonPreu no reconoce el ID ${id}` });
      }

      const data = await response.json();
      
      // Verificamos que existan los campos de precio
      if (data && data.prices && data.prices.pc) {
        return res.status(200).json({
          id,
          nombre: data.name || "Producto BonPreu",
          precio: parseFloat(data.prices.pc.amount)
        });
      } else {
        return res.status(404).json({ error: "Estructura de precio no encontrada" });
      }

    } catch (e) {
      return res.status(500).json({ error: "Error de conexión con la API de BonPreu" });
    }
  }
