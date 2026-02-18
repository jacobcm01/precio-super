export default async function handler(req, res) {
  const { super: supermercado, id } = req.query;

  if (supermercado === 'mercadona' && id === '13016') {
    return res.status(200).json({ precio: 5.95 });
  }

  return res.status(404).json({ error: 'Producto no encontrado' });
}
