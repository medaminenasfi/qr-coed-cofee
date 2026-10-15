import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
export async function GET(){
 const staff=await requireStaff(["ADMIN","MANAGER"]);
 if(!staff)return NextResponse.json({error:"Unauthorized"},{status:401});
 const [categories,items,tables,staffCount]=await Promise.all([prisma.category.findMany({orderBy:{sortOrder:"asc"}}),prisma.menuItem.findMany({include:{category:true},orderBy:{name:"asc"}}),prisma.diningTable.findMany({orderBy:{number:"asc"}}),prisma.staff.count()]);
 return NextResponse.json({categories,items,tables,staffCount});
}
export async function POST(req:Request){
 const staff=await requireStaff(["ADMIN","MANAGER"]);
 if(!staff)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const body=await req.json();
  if(body.type==="table"){
   const number=Number(body.number);if(!Number.isInteger(number)||number<1)return NextResponse.json({error:"Table number must be positive"},{status:400});
   const table=await prisma.diningTable.create({data:{number}});return NextResponse.json(table,{status:201});
  }
  if(body.type==="category"){
   const name=String(body.name||"").trim();if(!name)return NextResponse.json({error:"Category name required"},{status:400});
   return NextResponse.json(await prisma.category.create({data:{name}}),{status:201});
  }
  if(body.type==="item"){
   const name=String(body.name||"").trim(),price=Number(body.price),categoryId=String(body.categoryId||"");
   if(!name||!Number.isFinite(price)||price<0||!categoryId)return NextResponse.json({error:"Name, valid price and category required"},{status:400});
   const item=await prisma.menuItem.create({data:{name,description:String(body.description||""),price:price.toFixed(3),categoryId,station:body.station==="BAR"?"BAR":"KITCHEN"}});
   return NextResponse.json(item,{status:201});
  }
  return NextResponse.json({error:"Unknown create type"},{status:400});
 }catch{return NextResponse.json({error:"Could not save. Check for duplicate table number."},{status:400});}
}
export async function PATCH(req:Request){
 const staff=await requireStaff(["ADMIN","MANAGER"]);if(!staff)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{const {id,available}=await req.json();const item=await prisma.menuItem.update({where:{id},data:{available:Boolean(available)}});return NextResponse.json(item);}catch{return NextResponse.json({error:"Could not update item"},{status:400});}
}