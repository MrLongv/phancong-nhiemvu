export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const departmentId = url.searchParams.get('department_id');

  let stmt;

  if (departmentId) {
    stmt = env.DB
      .prepare('SELECT id, department_id, name, code FROM teams WHERE department_id = ? ORDER BY id')
      .bind(departmentId);
  } else {
    stmt = env.DB
      .prepare('SELECT id, department_id, name, code FROM teams ORDER BY id');
  }

  const { results } = await stmt.all();

  return Response.json(results || []);
}
