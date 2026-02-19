export default async function handler(req, res) {
  const { super: supermercado, id } = req.query;
  if (!id) return res.status(400).json({ error: "ID requerido" });

  try {
    // --- LÓGICA MERCADONA ---
    if (supermercado === 'mercadona') {
      const response = await fetch(`https://tienda.mercadona.es/api/products/${id}`, {
        headers: { 'Cookie': 'warehouse=08840', 'User-Agent': 'Mozilla/5.0' }
      });
      const data = await response.json();
      return res.status(200).json({ nombre: data.display_name, precio: parseFloat(data.price_instructions.unit_price) });
    }

    // --- LÓGICA BONPREU (CON PRE-SESIÓN) ---
    if (supermercado === 'bonpreu') {
      // PASO 1: Pedir la Home para "despertar" la sesión y obtener cookies
      const homeRes = await fetch('https://www.compraonline.bonpreuesclat.cat/es', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      
      // Extraemos las cookies que nos da BonPreu
      const cookies = homeRes.headers.get('set-cookie');

      // PASO 2: Pedir el producto usando esas cookies
      const urlBonPreu = `https://www.compraonline.bonpreuesclat.cat/api/v3/products/${id}`;
      const response = await fetch(urlBonPreu, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Cookie': cookies, // Aquí le pasamos el "pase de prensa" que acabamos de conseguir
          'Referer': 'https://www.compraonline.bonpreuesclat.cat/'
        }
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: "BonPreu sigue bloqueando la entrada" });
      }

      const data = await response.json();
      const precioFinal = data.prices?.pc?.amount || data.prices?.p1?.amount;

      if (precioFinal) {
        return res.status(200).json({
          nombre: data.name,
          precio: parseFloat(precioFinal)
        });
      }
    }
    
    return res.status(404).json({ error: "No se pudo obtener el precio" });

  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
