import { verifyLiffToken } from "./verify-token";

export async function getAuthUser(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const idToken = authHeader.slice(7);
  return verifyLiffToken(idToken);
}
