const ADMIN_USER = process.env.ADMIN_USER ?? "admin";
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

function unauthorized() {
  return new Response("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin Area"' },
  });
}

export function requireAdminAuth(request: Request) {
  if (!ADMIN_PASS) {
    throw new Response("Admin is not configured", { status: 500 });
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    throw unauthorized();
  }

  const [scheme, encoded] = authHeader.split(" ");
  if (!encoded || scheme !== "Basic") {
    throw unauthorized();
  }

  const buffer = Buffer.from(encoded, "base64");
  const [user, pass] = buffer.toString("utf-8").split(":");

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    throw new Response("Forbidden", { status: 403 });
  }
}
