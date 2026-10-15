import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-only-secret-change-this-before-deploying-123456");
export async function createSession(staff: { id: string; role: string; name: string }) {
  const token = await new SignJWT({ role: staff.role, name: staff.name })
    .setProtectedHeader({ alg: "HS256" }).setSubject(staff.id)
    .setIssuedAt().setExpirationTime("12h").sign(secret);
  (await cookies()).set("qrcafe_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 43200 });
}
export async function getSession() {
  const token = (await cookies()).get("qrcafe_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: String(payload.sub), role: String(payload.role), name: String(payload.name) };
  } catch { return null; }
}
export async function requireStaff(roles?: string[]) {
  const session = await getSession();
  if (!session || (roles && !roles.includes(session.role))) return null;
  const staff = await prisma.staff.findUnique({ where: { id: session.id } });
  if (!staff?.active) return null;
  return session;
}
