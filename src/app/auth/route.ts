import { NextResponse } from "next/server";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev_secret");

export async function POST(req: Request) {
  const body = await req.json();
  const user = { id: "u1", name: body.name, email: body.email };
  const token = await new SignJWT(user).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("auth", token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
