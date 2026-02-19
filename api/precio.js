export default async function handler(req, res) {
  const { super: supermercado, id } = req.query;
  if (!id) return res.status(400).json({ error: "ID requerido" });

  try {
    if (supermercado === 'mercadona') {
      const response = await fetch(`https://tienda.mercadona.es/api/products/${id}`, {
        headers: { 'Cookie': 'warehouse=08840', 'User-Agent': 'Mozilla/5.0' }
      });
      const data = await response.json();
      return res.status(200).json({ nombre: data.display_name, precio: parseFloat(data.price_instructions.unit_price) });
    }

    if (supermercado === 'bonpreu') {
      // Añadimos un número aleatorio al final para evitar bloqueos por repetición
      const urlBonPreu = `https://www.compraonline.bonpreuesclat.cat/api/v3/products/${id}?t=${Date.now()}`;
      
      const response = await fetch(urlBonPreu, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'es-ES,es;q=0.9',
          'Referer': 'https://www.compraonline.bonpreuesclat.cat/',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin'
        }
      });

      if (!response.ok) return res.status(404).json({ error: `BonPreu ha rechazado la conexión (${response.status})` });

      const data = await response.json();
      const precioFinal = data.prices?.pc?.amount || data.prices?.p1?.amount;

      if (precioFinal) {
        return res.status(200).json({ nombre: data.name, precio: parseFloat(precioFinal) });
      }
      return res.status(404).json({ error: "Precio no disponible" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Error interno" });
  }
}
