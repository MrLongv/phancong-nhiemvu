import { json, requireUser } from '../../_utils.js';
export async function onRequestGet(context) {
  const user = await requireUser(context); if (!user) return json({ error: 'Chưa đăng nhập' }, 401);
  const { results } = await context.env.DB.prepare('SELECT * FROM departments ORDER BY name').all();
  return json({ departments: results });
}
