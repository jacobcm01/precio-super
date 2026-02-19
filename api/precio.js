export default async function handler(req, res) {
  const supermercado = req.query.super;
  let id = req.query.id;

  if (!id) return res.status(400).json({ error: "ID requerido" });

  // --- MERCADONA (VILADECANS 08840) ---
  // *** ESTE BLOQUE ESTÁ 100% IGUAL QUE EL TUYO ***
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
        nombre: data.display_name || "Producto Mercadona",
        precio: parseFloat(data.price_instructions.unit_price)
      });
    } catch (e) {
      return res.status(500).json({ error: "Error en Mercadona" });
    }
  }

  // --- BONÀREA (SCRAPING REAL) ---
if (supermercado === 'bonarea') {
  try {
    // Android envía "arros-extra/13_7553" pero llega como "arros-extra%2F13_7553"
    const idDecodificado = decodeURIComponent(id);

    const urlBonArea = `https://www.bonarea-online.com/online/producte/${idDecodificado}`;

    const response = await fetch(urlBonArea, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html'
      }
    });

    if (!response.ok) {
      return res.status(404).json({ error: `BonÀrea no encuentra el producto ${idDecodificado}` });
    }

    const html = await response.text();

    const precioMatch = html.match(/data-price="([\d.,]+)"/);
    const nombreMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);

    if (precioMatch) {
      return res.status(200).json({
        id: idDecodificado,
        nombre: nombreMatch ? nombreMatch[1].trim() : "Producto BonÀrea",
        precio: parseFloat(precioMatch[1].replace(',', '.'))
      });
    }

    return res.status(404).json({ error: "HTML cargado pero precio no encontrado" });

  } catch (e) {
    return res.status(500).json({ error: "Error de conexión con BonÀrea" });
  }
}


  return res.status(404).json({ error: "Super no soportado" });
}
