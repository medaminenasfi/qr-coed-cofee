import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
export async function POST(req:Request) {
 try {
  const data=z.object({email:z.string().email(),password:z.string().min(1)}).parse(await req.json());
  const staff=await prisma.staff.findUnique({where:{email:data.email}});
  if(!staff||!staff.active||!(await bcrypt.compare(data.password,staff.passwordHash)))return NextResponse.json({error:"Invalid email or password"}, {status:401});
  await createSession({id:staff.id,role:staff.role,name:staff.name});
  return NextResponse.json({ok:true,role:staff.role});
 } catch{return NextResponse.json({error:"Please enter a valid email and password"}, {status:400});}
}