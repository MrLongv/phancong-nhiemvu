import { json, requireUser } from '../../_utils.js';
export async function onRequestGet(context) {
  const user = await requireUser(context);
  if (!user) return json({ user: null }, 401);
  const full = await context.env.DB.prepare('SELECT id,username,role,department_id,full_name FROM users WHERE id=?').bind(user.id).first();
  return json({ user: full });
}
