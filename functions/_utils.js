export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers }
  });
}

export function getCookie(request, name) {
  const cookie = request.headers.get('cookie') || '';
  const parts = cookie.split(';').map(v => v.trim());
  const found = parts.find(v => v.startsWith(name + '='));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : '';
}

export async function requireUser(context) {
  const sid = getCookie(context.request, 'pc_user');
  if (!sid) return null;
  try {
    const raw = atob(sid);
    const [id, username, role, department_id] = raw.split('|');
    if (!id || !username || !role) return null;
    return { id: Number(id), username, role, department_id: department_id === 'null' ? null : Number(department_id) };
  } catch { return null; }
}

export function canEdit(user) {
  return user && ['admin','ns','gd','quanly'].includes(user.role);
}

export function canManageAll(user) {
  return user && ['admin','ns','gd'].includes(user.role);
}

export async function log(context, user, action, target_type, target_id, detail) {
  try {
    await context.env.DB.prepare('INSERT INTO activity_logs(user_id,action,target_type,target_id,detail) VALUES(?,?,?,?,?)')
      .bind(user?.id || null, action, target_type || null, target_id || null, detail || null).run();
  } catch {}
}
