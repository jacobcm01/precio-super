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

  // --- BONPREU / ESCLAT ---
  if (supermercado === 'bonpreu') {
    try {
      // Usamos su API v3 que es muy rápida
      const response = await fetch(`https://www.compraonline.bonpreuesclat.cat/api/v3/products/${id}`);
      
      if (!response.ok) return res.status(404).json({ error: "No encontrado en BonPreu" });
      
      const data = await response.json();
      
      return res.status(200).json({
        id,
        nombre: data.name,
        precio: parseFloat(data.prices.pc.amount)
      });
    } catch (e) {
      return res.status(500).json({ error: "Error en BonPreu" });
    }
  }

  return res.status(404).json({ error: "Supermercado no soportado" });
}
