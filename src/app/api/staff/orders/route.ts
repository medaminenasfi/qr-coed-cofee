import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
export async function GET(){
 const staff=await requireStaff(["ADMIN","MANAGER","SERVER","KITCHEN","BAR"]);
 if(!staff)return NextResponse.json({error:"Unauthorized"},{status:401});
 const where=staff.role==="KITCHEN"?{items:{some:{menuItem:{station:"KITCHEN"}}}}:staff.role==="BAR"?{items:{some:{menuItem:{station:"BAR"}}}}:{};
 const orders=await prisma.order.findMany({where:{...where,status:{notIn:["SERVED","CANCELLED"]}},include:{table:true,items:{include:{menuItem:true}}},orderBy:{createdAt:"asc"}});
 return NextResponse.json(orders);
}
export async function PATCH(req:Request){
 const staff=await requireStaff(["ADMIN","MANAGER","SERVER","KITCHEN","BAR"]);
 if(!staff)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const {id,status}=await req.json();
  const allowed=["CONFIRMED","PREPARING","READY","SERVED","CANCELLED"];
  if(!id||!allowed.includes(status))return NextResponse.json({error:"Invalid order update"},{status:400});
  const order=await prisma.order.update({where:{id},data:{status}});
  if(status==="SERVED"||status==="CANCELLED"){
   const remaining=await prisma.order.count({where:{tableId:order.tableId,status:{notIn:["SERVED","CANCELLED"]}}});
   if(!remaining)await prisma.diningTable.update({where:{id:order.tableId},data:{status:"FREE"}});
  }
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"Could not update order"},{status:400});}
}