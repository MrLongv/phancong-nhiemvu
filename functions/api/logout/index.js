import { json } from '../_utils.js';
export async function onRequestPost() {
  return json({ ok: true }, 200, { 'Set-Cookie': 'pc_user=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0' });
}
