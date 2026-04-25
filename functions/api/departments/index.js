export async function onRequestGet({ env }) {
  const { results } = await env.DB
    .prepare('SELECT id, name, code FROM departments ORDER BY id')
    .all();

  return Response.json(results || []);
}
