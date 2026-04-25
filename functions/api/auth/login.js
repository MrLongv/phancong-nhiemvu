export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    if (!env.DB) {
      return Response.json({ error: 'Chưa bind D1 DB' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));

    const username = String(body.username || '').trim();
    const password = String(body.password || '').trim();

    if (!username || !password) {
      return Response.json({ error: 'Thiếu tài khoản hoặc mật khẩu' }, { status: 400 });
    }

    const user = await env.DB
      .prepare(`
        SELECT id, username, role, department_id, full_name
        FROM users
        WHERE username = ? AND password = ?
        LIMIT 1
      `)
      .bind(username, password)
      .first();

    if (!user) {
      return Response.json({ error: 'Sai tài khoản hoặc mật khẩu' }, { status: 401 });
    }

    const token = btoa(JSON.stringify({
      id: user.id,
      username: user.username,
      role: user.role,
      department_id: user.department_id
    }));

    return Response.json(
      { user },
      {
        status: 200,
        headers: {
          'Set-Cookie': `pc_user=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
        }
      }
    );
  } catch (err) {
    return Response.json(
      {
        error: 'Lỗi server login',
        detail: String(err && err.message ? err.message : err)
      },
      { status: 500 }
    );
  }
}
