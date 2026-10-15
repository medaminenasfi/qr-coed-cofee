import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
const schema = z.object({
 tableNumber: z.number().int().positive(), token: z.string().min(1),
 notes: z.string().max(500).optional(),
 items: z.array(z.object({menuItemId:z.string(),quantity:z.number().int().min(1).max(30)})).min(1).max(40)
});
export async function POST(req:Request) {
 try {
  const input=schema.parse(await req.json());
  const table=await prisma.diningTable.findUnique({where:{number:input.tableNumber}});
  if(!table||table.qrToken!==input.token)return NextResponse.json({error:"Invalid table QR token"}, {status:403});
  const ids=[...new Set(input.items.map(i=>i.menuItemId))];
  const menuItems=await prisma.menuItem.findMany({where:{id:{in:ids},available:true}});
  if(menuItems.length!==ids.length)return NextResponse.json({error:"One or more items are unavailable"}, {status:400});
  const quantities=new Map(input.items.map(i=>[i.menuItemId,i.quantity]));
  const total=menuItems.reduce((s,i)=>s+Number(i.price)*(quantities.get(i.id)||0),0);
  const order=await prisma.$transaction(async tx=>{
    const created=await tx.order.create({data:{tableId:table.id,total:total.toFixed(3),notes:input.notes,items:{create:menuItems.map(i=>({menuItemId:i.id,name:i.name,quantity:quantities.get(i.id)!,unitPrice:i.price,notes:input.notes}))}}});
    await tx.diningTable.update({where:{id:table.id},data:{status:"OCCUPIED"}});
    return created;
  });
  return NextResponse.json({id:order.id,status:order.status,total:Number(order.total)}, {status:201});
 } catch(e) { if(e instanceof z.ZodError)return NextResponse.json({error:"Please check your order details"}, {status:400}); console.error(e);return NextResponse.json({error:"Server error placing order"}, {status:500}); }
}
export async function GET() {
 const orders=await prisma.order.findMany({where:{status:{notIn:["SERVED","CANCELLED"]}},include:{table:true,items:true},orderBy:{createdAt:"desc"}});
 return NextResponse.json(orders);
}