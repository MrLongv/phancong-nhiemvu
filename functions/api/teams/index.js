import { json, requireUser } from '../_utils.js';
export async function onRequestGet(context) {
  const user = await requireUser(context); if (!user) return json({ error: 'Chưa đăng nhập' }, 401);
  const url = new URL(context.request.url);
  const dep = url.searchParams.get('department_id');
  let stmt = context.env.DB.prepare('SELECT * FROM teams WHERE (? IS NULL OR department_id=?) ORDER BY name').bind(dep, dep);
  const { results } = await stmt.all();
  return json({ teams: results });
}
