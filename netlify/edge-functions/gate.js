// Triad Retail — password landing page
// Runs on Netlify's edge before every request. Visitors see the landing page until they
// enter the password; after that a cookie lets them straight through for REMEMBER_DAYS days.
//
// TO CHANGE THE PASSWORD: edit the line below, save, upload to GitHub. Everyone will need
// to enter the new password once (old cookies stop working automatically).

const PASSWORD = "Cannes2026";
const REMEMBER_DAYS = 30;

// ---- No need to edit below this line ----

const COOKIE = "tr_access";

async function tokenFor(password) {
  const data = new TextEncoder().encode("triad-retail::" + password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

export default async (request, context) => {
  const url = new URL(request.url);

  // Let the logo and image files through (needed by the landing page itself), plus robots.txt.
  if (url.pathname.startsWith("/assets/") || url.pathname === "/robots.txt") return context.next();

  const token = await tokenFor(PASSWORD);

  // Already unlocked?
  if (getCookie(request, COOKIE) === token) return context.next();

  // Password submitted?
  if (request.method === "POST") {
    const form = await request.formData();
    const attempt = (form.get("password") || "").toString().trim();
    if (attempt === PASSWORD) {
      const maxAge = REMEMBER_DAYS * 24 * 60 * 60;
      return new Response(null, {
        status: 303,
        headers: {
          Location: url.pathname === "/" ? "/" : url.pathname,
          "Set-Cookie": `${COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`,
          "Cache-Control": "no-store",
        },
      });
    }
    return landing(true);
  }

  return landing(false);
};

function landing(wrong) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Triad Retail</title>
<link rel="icon" href="/assets/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;600;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    font-family: 'Manrope', -apple-system, sans-serif; font-weight: 300; color: #fff;
    background: #0a0a0a; -webkit-font-smoothing: antialiased; overflow: hidden;
    display: flex; flex-direction: column; min-height: 100vh;
  }
  .glow { position: fixed; inset: -20%; pointer-events: none; z-index: 0;
    background:
      radial-gradient(ellipse 45% 40% at 20% 30%, rgba(123,44,191,0.28) 0%, transparent 60%),
      radial-gradient(ellipse 40% 35% at 80% 75%, rgba(123,44,191,0.16) 0%, transparent 60%);
    animation: drift 18s ease-in-out infinite alternate; }
  @keyframes drift { from { transform: translate(0,0) scale(1); } to { transform: translate(4%, -3%) scale(1.08); } }
  .grain { position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.35;
    background: repeating-linear-gradient(180deg, transparent 0, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 3px); }
  .frame { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column; padding: clamp(28px, 5vw, 56px); }
  header img { height: 30px; display: block; opacity: 0; animation: up 0.9s ease 0.1s forwards; }
  main { flex: 1; display: flex; align-items: center; justify-content: center; }
  .card { width: 100%; max-width: 560px; text-align: center; }
  .eyebrow { font-size: 11px; letter-spacing: 0.36em; text-transform: uppercase; color: rgba(255,255,255,0.5); font-weight: 600;
    display: inline-flex; align-items: center; gap: 16px; margin-bottom: 28px; opacity: 0; animation: up 0.9s ease 0.3s forwards; }
  .eyebrow::before, .eyebrow::after { content: ""; width: 32px; height: 1px; background: rgba(255,255,255,0.25); }
  h1 { font-size: clamp(38px, 6vw, 68px); font-weight: 800; line-height: 1.02; letter-spacing: -0.03em; margin-bottom: 44px; opacity: 0; animation: up 0.9s ease 0.45s forwards; }
  h1 span { color: #9D4EDD; }
  p.lead { font-size: 17px; line-height: 1.6; color: rgba(255,255,255,0.6); font-weight: 400; max-width: 420px; margin: 0 auto 44px; opacity: 0; animation: up 0.9s ease 0.6s forwards; }
  form { display: flex; gap: 8px; max-width: 420px; margin: 0 auto; opacity: 0; animation: up 0.9s ease 0.75s forwards; }
  input { flex: 1; min-width: 0; font: inherit; font-size: 16px; font-weight: 400; color: #fff; background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.22); border-radius: 100px; padding: 15px 24px; outline: none; transition: border-color .2s, background .2s; letter-spacing: 0.02em; }
  input::placeholder { color: rgba(255,255,255,0.4); }
  input:focus { border-color: #9D4EDD; background: rgba(123,44,191,0.12); }
  button { font: inherit; font-size: 15px; font-weight: 600; color: #fff; background: #7B2CBF; border: 1px solid #7B2CBF; border-radius: 100px; padding: 15px 28px; cursor: pointer; transition: background .2s, border-color .2s; white-space: nowrap; }
  button:hover { background: #9D4EDD; border-color: #9D4EDD; }
  .error { margin-top: 18px; font-size: 14px; color: #E0AAFF; font-weight: 400; }
  .error:empty { display: none; }
  footer { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-size: 13px; color: rgba(255,255,255,0.45); opacity: 0; animation: up 0.9s ease 1s forwards; }
  footer a { color: rgba(255,255,255,0.7); text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.25); padding-bottom: 1px; }
  footer a:hover { color: #9D4EDD; border-color: #9D4EDD; }
  @keyframes up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 520px) { form { flex-direction: column; } button { width: 100%; } body { overflow: auto; } }
</style>
</head>
<body>
<div class="glow"></div>
<div class="grain"></div>
<div class="frame">
  <header><img src="/assets/logo-white.png" alt="Triad Retail"></header>
  <main>
    <div class="card">
      <h1>Retail activations built for the <span>realities</span> of travel retail.</h1>
      <form method="POST" action="/" autocomplete="off">
        <input type="password" name="password" placeholder="Password" aria-label="Password" autofocus required>
        <button type="submit">Enter</button>
      </form>
      <div class="error">${wrong ? "That password was not recognised. Please try again." : ""}</div>
    </div>
  </main>
  <footer>
    <div>© ${new Date().getFullYear()} Triad Limited</div>
    <div><a href="mailto:hello@triadretail.co.uk">hello@triadretail.co.uk</a> &nbsp;·&nbsp; <a href="tel:+441604771100">01604 771100</a></div>
  </footer>
</div>
</body>
</html>`;
  return new Response(html, {
    status: wrong ? 401 : 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
