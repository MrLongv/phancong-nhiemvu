function removeVN(str = '') {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);

  const q = url.searchParams.get('q');
  const departmentId = url.searchParams.get('department_id');

  let sql = `
    SELECT 
      e.*,
      d.name AS department_name,
      t.name AS team_name,
      a.work_area,
      a.main_tasks,
      a.sub_tasks,
      a.daily_tasks,
      a.periodic_tasks,
      a.related_docs
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN teams t ON e.team_id = t.id
    LEFT JOIN assignments a ON a.employee_id = e.id
    WHERE 1=1
  `;

  const params = [];

  if (q) {
    const qRaw = String(q).trim().toLowerCase();
    const qKd = removeVN(q);

    sql += `
      AND (
        LOWER(e.emp_code) LIKE ?
        OR LOWER(e.full_name) LIKE ?
        OR LOWER(COALESCE(e.full_name_kd, '')) LIKE ?
      )
    `;

    params.push(`%${qRaw}%`, `%${qRaw}%`, `%${qKd}%`);
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

  const fullNameKd = removeVN(data.full_name);

  const existed = await env.DB.prepare(`
    SELECT id FROM employees WHERE emp_code = ? LIMIT 1
  `).bind(data.emp_code).first();

  if (existed) {
  if (!data.overwrite) {
    return Response.json({
      ok: true,
      skipped: true,
      message: 'Mã NV đã tồn tại, bỏ qua vì không cho phép ghi đè'
    });
  }

  data.id = existed.id;

  await onRequestPut({
    request: new Request(request.url, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
    env
  });

  return Response.json({
    ok: true,
    updated: true,
    id: existed.id
  });
}

  const result = await env.DB.prepare(`
    INSERT INTO employees 
    (emp_code, full_name, full_name_kd, position, department_id, team_id, manager_name, status, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.emp_code,
    data.full_name,
    fullNameKd,
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

  const fullNameKd = removeVN(data.full_name);

  await env.DB.prepare(`
    UPDATE employees SET
      emp_code = ?,
      full_name = ?,
      full_name_kd = ?,
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
    fullNameKd,
    data.position || '',
    data.department_id || null,
    data.team_id || null,
    data.manager_name || '',
    data.status || 'dang_lam',
    data.id
  ).run();

  const existed = await env.DB.prepare(`
    SELECT id FROM assignments WHERE employee_id = ? LIMIT 1
  `).bind(data.id).first();

  if (existed) {
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
  } else {
    await env.DB.prepare(`
      INSERT INTO assignments
      (employee_id, work_area, main_tasks, sub_tasks, daily_tasks, periodic_tasks, related_docs)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.id,
      data.work_area || '',
      data.main_tasks || '',
      data.sub_tasks || '',
      data.daily_tasks || '',
      data.periodic_tasks || '',
      data.related_docs || ''
    ).run();
  }

  return Response.json({ ok: true });
}
