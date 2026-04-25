import { json, requireUser, log } from '../_utils.js';
async function getEmployee(context, id){
  return context.env.DB.prepare(`SELECT e.*, d.name department_name, t.name team_name, a.work_area,a.main_tasks,a.sub_tasks,a.daily_tasks,a.periodic_tasks,a.related_docs
    FROM employees e LEFT JOIN departments d ON d.id=e.department_id LEFT JOIN teams t ON t.id=e.team_id LEFT JOIN assignments a ON a.employee_id=e.id WHERE e.id=?`).bind(id).first();
}
export async function onRequestGet(context) {
  const user = await requireUser(context); if (!user) return json({ error: 'Chưa đăng nhập' }, 401);
  const id = context.params.id;
  const emp = await getEmployee(context,id);
  if (!emp) return json({ error:'Không tìm thấy nhân viên' },404);
  if (user.role==='quanly' && emp.department_id !== user.department_id) return json({ error:'Không có quyền xem nhân viên bộ phận khác' },403);
  return json({ employee: emp });
}
export async function onRequestPut(context) {
  const user = await requireUser(context); if (!user) return json({ error: 'Chưa đăng nhập' }, 401);
  const id = context.params.id;
  const old = await getEmployee(context,id); if (!old) return json({error:'Không tìm thấy'},404);
  if (user.role==='quanly' && old.department_id !== user.department_id) return json({ error:'Không có quyền sửa nhân viên bộ phận khác' },403);
  const b = await context.request.json().catch(()=>({}));
  await context.env.DB.prepare(`UPDATE employees SET emp_code=?,full_name=?,position=?,department_id=?,team_id=?,manager_name=?,status=?,note=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .bind(b.emp_code,b.full_name,b.position||'',b.department_id||null,b.team_id||null,b.manager_name||'',b.status||'dang_lam',b.note||'',id).run();
  await context.env.DB.prepare(`INSERT INTO assignments(employee_id,work_area,main_tasks,sub_tasks,daily_tasks,periodic_tasks,related_docs) VALUES(?,?,?,?,?,?,?) ON CONFLICT(employee_id) DO UPDATE SET work_area=excluded.work_area, main_tasks=excluded.main_tasks, sub_tasks=excluded.sub_tasks, daily_tasks=excluded.daily_tasks, periodic_tasks=excluded.periodic_tasks, related_docs=excluded.related_docs, updated_at=CURRENT_TIMESTAMP`)
    .bind(id,b.work_area||'',b.main_tasks||'',b.sub_tasks||'',b.daily_tasks||'',b.periodic_tasks||'',b.related_docs||'').run();
  await log(context,user,'update_employee','employee',Number(id),JSON.stringify(b));
  return json({ ok:true });
}
