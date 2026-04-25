export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);

  const q = url.searchParams.get('q');
  const departmentId = url.searchParams.get('department_id');

  let sql = `
    SELECT 
      e.*,
      d.name AS department_name,
      t.name AS team_name
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN teams t ON e.team_id = t.id
    WHERE 1=1
  `;

  const params = [];

  if (q) {
    sql += ` AND (e.full_name LIKE ? OR e.emp_code LIKE ?)`;
    params.push(`%${q}%`, `%${q}%`);
  }

  if (departmentId) {
    sql += ` AND e.department_id = ?`;
    params.push(departmentId);
  }

  sql += ` ORDER BY e.id DESC`;

  const { results } = await env.DB.prepare(sql).bind(...params).all();

  return Response.json(results || []);
}

export async function onRequestPost({ request, env }) {
  const data = await request.json();

  const result = await env.DB.prepare(`
    INSERT INTO employees 
    (emp_code, full_name, position, department_id, team_id, manager_name, status, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.emp_code,
    data.full_name,
    data.position || '',
    data.department_id || null,
    data.team_id || null,
    data.manager_name || '',
    data.status || 'dang_lam',
    data.note || ''
  ).run();

  const employeeId = result.meta.last_row_id;

  await env.DB.prepare(`
    INSERT INTO assignments
    (employee_id, work_area, main_tasks, sub_tasks, daily_tasks, periodic_tasks, related_docs)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    employeeId,
    data.work_area || '',
    data.main_tasks || '',
    data.sub_tasks || '',
    data.daily_tasks || '',
    data.periodic_tasks || '',
    data.related_docs || ''
  ).run();

  return Response.json({ ok: true, id: employeeId });
}

export async function onRequestPut({ request, env }) {
  const data = await request.json();

  await env.DB.prepare(`
    UPDATE employees SET
      emp_code = ?,
      full_name = ?,
      position = ?,
      department_id = ?,
      team_id = ?,
      manager_name = ?,
      status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    data.emp_code,
    data.full_name,
    data.position || '',
    data.department_id || null,
    data.team_id || null,
    data.manager_name || '',
    data.status || 'dang_lam',
    data.id
  ).run();

  await env.DB.prepare(`
    UPDATE assignments SET
      work_area = ?,
      main_tasks = ?,
      sub_tasks = ?,
      daily_tasks = ?,
      periodic_tasks = ?,
      related_docs = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE employee_id = ?
  `).bind(
    data.work_area || '',
    data.main_tasks || '',
    data.sub_tasks || '',
    data.daily_tasks || '',
    data.periodic_tasks || '',
    data.related_docs || '',
    data.id
  ).run();

  return Response.json({ ok: true });
}
