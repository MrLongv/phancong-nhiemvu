import { json, requireUser, canManageAll, log } from '../../_utils.js';
export async function onRequestGet(context) {
  const user = await requireUser(context); if (!user) return json({ error: 'Chưa đăng nhập' }, 401);
  const url = new URL(context.request.url);
  const q = `%${(url.searchParams.get('q') || '').trim()}%`;
  const department = url.searchParams.get('department_id') || null;
  const where = [];
  const binds = [];
  where.push('(e.emp_code LIKE ? OR e.full_name LIKE ?)'); binds.push(q, q);
  if (department) { where.push('e.department_id=?'); binds.push(department); }
  if (user.role === 'quanly') { where.push('e.department_id=?'); binds.push(user.department_id); }
  const sql = `SELECT e.*, d.name department_name, t.name team_name
    FROM employees e
    LEFT JOIN departments d ON d.id=e.department_id
    LEFT JOIN teams t ON t.id=e.team_id
    WHERE ${where.join(' AND ')}
    ORDER BY e.full_name LIMIT 100`;
  const { results } = await context.env.DB.prepare(sql).bind(...binds).all();
  return json({ employees: results });
}
export async function onRequestPost(context) {
  const user = await requireUser(context); if (!user) return json({ error: 'Chưa đăng nhập' }, 401);
  const b = await context.request.json().catch(()=>({}));
  if (!b.emp_code || !b.full_name) return json({ error: 'Thiếu mã số hoặc họ tên' }, 400);
  if (user.role === 'quanly' && Number(b.department_id) !== user.department_id) return json({ error: 'Quản lý chỉ thêm nhân viên trong bộ phận mình' }, 403);
  const r = await context.env.DB.prepare(`INSERT INTO employees(emp_code,full_name,position,department_id,team_id,manager_name,status,note) VALUES(?,?,?,?,?,?,?,?)`)
    .bind(b.emp_code,b.full_name,b.position||'',b.department_id||null,b.team_id||null,b.manager_name||'',b.status||'dang_lam',b.note||'').run();
  await context.env.DB.prepare('INSERT INTO assignments(employee_id,work_area,main_tasks,sub_tasks,daily_tasks,periodic_tasks,related_docs) VALUES(?,?,?,?,?,?,?)')
    .bind(r.meta.last_row_id,'','','','','','').run();
  await log(context,user,'create_employee','employee',r.meta.last_row_id,JSON.stringify(b));
  return json({ ok:true, id:r.meta.last_row_id });
}
