export default async function handler(req, res) {
  const { super: supermercado, id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID requerido" });
  }

  try {
    // --- MERCADONA ---
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

    // --- BONPREU ---
    if (supermercado === 'bonpreu') {
      // Usamos la URL de la API que corresponde a la web que me has pasado
      const urlBonPreu = `https://www.compraonline.bonpreuesclat.cat/api/v3/products/${id}`;
      
      const response = await fetch(urlBonPreu, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Origin': 'https://www.compraonline.bonpreuesclat.cat'
        }
      });

      if (!response.ok) {
        return res.status(404).json({ error: "Producto no encontrado en BonPreu" });
      }

      const data = await response.json();
      
      // En la API v3 de BonPreu, el precio suele estar en data.prices.pc.amount
      // Pero si es un pack (como tu leche 6x1L), a veces cambia. 
      // Esta lógica asegura que capturemos el precio correctamente:
      const precioFinal = data.prices?.pc?.amount || data.prices?.p1?.amount;

      if (precioFinal) {
        return res.status(200).json({
          nombre: data.name,
          precio: parseFloat(precioFinal)
        });
      } else {
        return res.status(404).json({ error: "Precio no disponible en los datos" });
      }
    }

    return res.status(400).json({ error: "Supermercado no soportado" });

  } catch (error) {
    console.error("Error en el servidor:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
