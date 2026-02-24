export default async function handler(req, res) {
  const { super: supermercado, id } = req.query;

  if (!id) return res.status(400).json({ error: "ID requerido" });

  try {
    // --- MERCADONA ---
    if (supermercado === 'mercadona') {
      // Para 08840, el almacén correspondiente es bcn1
      // Usamos una combinación de cookies que Mercadona exige ahora
      const response = await fetch(`https://tienda.mercadona.es/api/products/${id}/`, {
        headers: { 
          'Cookie': 'customer_postal_code=08840; warehouse=bcn1', 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'es-ES,es;q=0.9'
        }
      });

      if (!response.ok) return res.status(404).json({ error: "No encontrado en Mercadona" });

      const data = await response.json();
      
      return res.status(200).json({
        nombre: data.display_name,
        precio: parseFloat(data.price_instructions.unit_price)
      });
    }

    return res.status(400).json({ error: "Este supermercado se gestiona directamente desde la App" });

  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
