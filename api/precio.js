export default async function handler(req, res) {
  const supermercado = req.query.super;
  const id = req.query.id;

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
        precio
      });

    } catch (error) {
      return res.status(500).json({ error: "Error obteniendo datos de Mercadona" });
    }
  }

  return res.status(404).json({ error: "Supermercado no soportado" });
}
