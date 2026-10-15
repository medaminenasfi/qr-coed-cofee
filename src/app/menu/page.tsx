import { prisma } from "@/lib/prisma";
import MenuClient from "./menu-client";
export const dynamic = "force-dynamic";
export default async function MenuPage({ searchParams }: { searchParams: Promise<{table?:string;token?:string}> }) {
 const params = await searchParams;
 const number = Math.max(1, Number(params.table || 1));
 let table = await prisma.diningTable.findUnique({ where: { number } });
 if (!table) table = await prisma.diningTable.create({ data: { number } }).catch(() => prisma.diningTable.findUniqueOrThrow({where:{number}}));
 const validToken = !params.token || params.token === table.qrToken;
 const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { items: { where: { available: true }, orderBy: { name: "asc" } } } });
 const menu = categories.map(c => ({id:c.id,name:c.name,items:c.items.map(i=>({id:i.id,name:i.name,description:i.description,price:Number(i.price),station:i.station}))}));
 return <MenuClient tableNumber={number} token={table.qrToken} validToken={validToken} categories={menu}/>;
}