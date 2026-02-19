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

 // --- BONÀREA (FORZAR IDIOMA, COOKIES Y EVITAR REDIRECCIONES) ---
if (supermercado === 'bonarea') {
  try {
    const idDecodificado = decodeURIComponent(id);
    const urlBonArea = `https://www.bonarea-online.com/online/producte/${idDecodificado}`;

    const response = await fetch(urlBonArea, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ca-ES,ca;q=0.9,es-ES;q=0.8",
        "Referer": "https://www.bonarea-online.com/online",
        "Cookie": "cookie_consent=1; ba_lang=ca"
      }
    });

    const html = await response.text();

    // Buscamos precio en varios formatos
    const precioMatch =
      html.match(/data-price="([\d.,]+)"/) ||
      html.match(/"price"\s*:\s*"([\d.,]+)"/) ||
      html.match(/<span[^>]*class="price"[^>]*>([\d.,]+)<\/span>/);

    const nombreMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);

    if (precioMatch) {
      return res.status(200).json({
        id: idDecodificado,
        nombre: nombreMatch ? nombreMatch[1].trim() : "Producto BonÀrea",
        precio: parseFloat(precioMatch[1].replace(",", "."))
      });
    }

    return res.status(404).json({
      error: "Precio no encontrado en HTML",
      urlLlamada: urlBonArea,
      htmlRecibido: html.slice(0, 500)
    });

  } catch (e) {
    return res.status(500).json({ error: "Error de conexión con BonÀrea", detalle: e.message });
  }
}




  return res.status(404).json({ error: "Super no soportado" });
}
