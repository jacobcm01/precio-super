export default async function handler(req, res) {
  const { super: supermercado, id } = req.query;

  if (!id) return res.status(400).json({ error: "ID requerido" });

  try {
    if (supermercado === 'mercadona') {
      const response = await fetch(`https://tienda.mercadona.es/api/products/${id}/`, {
        headers: { 
          // Añadimos 'region' para intentar forzar el impuesto de Cataluña
          'Cookie': 'customer_postal_code=08840; warehouse=bcn1; region=es-ct', 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'ca-ES,ca;q=0.9,es-ES;q=0.8,es;q=0.7',
          'Origin': 'https://tienda.mercadona.es',
          'Referer': 'https://tienda.mercadona.es/'
        }
      });

      if (!response.ok) return res.status(404).json({ error: "No encontrado" });

      const data = await response.json();
      
      // Mercadona a veces desglosa el precio. 
      // Si existe 'unit_price_with_tax' o similar en el JSON profundo lo usaríamos,
      // pero normalmente 'unit_price' ya debería venir con el IVA.
      // Si el impuesto de azúcares se suma al final, la API a veces no lo muestra 
      // a menos que simulemos un carrito.
      
      return res.status(200).json({
        nombre: data.display_name,
        precio: parseFloat(data.price_instructions.unit_price)
      });
    }

    return res.status(400).json({ error: "Supermercado no soportado" });

  } catch (error) {
    return res.status(500).json({ error: "Error de servidor" });
  }
}
