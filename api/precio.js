export default async function handler(req, res) {
  const { super: supermercado, id } = req.query;

  if (!id) return res.status(400).json({ error: "ID requerido" });

  try {
    // --- MERCADONA (Funciona perfecto en Vercel) ---
    if (supermercado === 'mercadona') {
      const response = await fetch(`https://tienda.mercadona.es/api/products/${id}`, {
        headers: { 
          'Cookie': 'warehouse=08840', 
          'User-Agent': 'Mozilla/5.0' 
        }
      });
      if (!response.ok) return res.status(404).json({ error: "No encontrado en Mercadona" });
      const data = await response.json();
      return res.status(200).json({
        nombre: data.display_name,
        precio: parseFloat(data.price_instructions.unit_price)
      });
    }

    // Si la App pide cualquier otra cosa (como bonpreu), el servidor dice que no es su trabajo
    return res.status(400).json({ error: "Este supermercado se gestiona directamente desde la App" });

  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
