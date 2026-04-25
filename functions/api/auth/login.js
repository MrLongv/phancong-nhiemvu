import { json } from '../_utils.js';
export async function onRequestPost(context) {
  const body = await context.request.json().catch(() => ({}));
  const { username, password } = body;
  if (!username || !password) return json({ error: 'Thiếu tài khoản hoặc mật khẩu' }, 400);
  const user = await context.env.DB.prepare('SELECT id,username,role,department_id,full_name FROM users WHERE username=? AND password=? AND active=1')
    .bind(username, password).first();
  if (!user) return json({ error: 'Sai tài khoản hoặc mật khẩu' }, 401);
  const token = btoa(`${user.id}|${user.username}|${user.role}|${user.department_id ?? 'null'}`);
  return json({ user }, 200, { 'Set-Cookie': `pc_user=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400` });
}
