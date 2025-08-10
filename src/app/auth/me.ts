import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev_secret");

export async function GET(req: Request) {
  const cookie = (req as any).cookies?.get?.("auth")?.value ?? "";
  const token = cookie || (req.headers.get("cookie") || "").split("; ").find(s=>s.startsWith("auth="))?.split("=")[1];
  if (!token) return NextResponse.json({ user: null }, { status: 200 });
  try {
    const { payload } = await jwtVerify(token, secret);
    return NextResponse.json({ user: payload }, { status: 200 });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
