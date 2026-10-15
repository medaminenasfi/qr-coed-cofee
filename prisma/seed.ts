import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);
  await prisma.staff.upsert({
    where: { email: "admin@qrcafe.local" },
    update: {},
    create: { name: "Cafe Admin", email: "admin@qrcafe.local", passwordHash, role: Role.ADMIN }
  });
  const categories = [
    { name: "Coffee & Tea", nameFr: "Café & thé", nameAr: "قهوة وشاي", sortOrder: 1 },
    { name: "Cold Drinks", nameFr: "Boissons fraîches", nameAr: "مشروبات باردة", sortOrder: 2 },
    { name: "Food", nameFr: "Cuisine", nameAr: "مأكولات", sortOrder: 3 }
  ];
  for (const data of categories) {
    const category = await prisma.category.upsert({
      where: { id: `seed-${data.sortOrder}` },
      update: data,
      create: { id: `seed-${data.sortOrder}`, ...data }
    });
    const items = data.sortOrder === 1
      ? [{name:"Espresso",description:"Double shot, rich and smooth",price:"4.000",station:"BAR"},{name:"Cappuccino",description:"Espresso with silky milk foam",price:"6.500",station:"BAR"}]
      : data.sortOrder === 2
      ? [{name:"Fresh Lemonade",description:"Freshly squeezed lemon",price:"5.500",station:"BAR"},{name:"Iced Latte",description:"Chilled espresso and milk",price:"7.000",station:"BAR"}]
      : [{name:"Club Sandwich",description:"Chicken, cheese, lettuce and fries",price:"14.000",station:"KITCHEN"},{name:"Tunisian Brik",description:"Traditional crispy brik",price:"8.000",station:"KITCHEN"}];
    for (const item of items) {
      await prisma.menuItem.upsert({
        where: { id: `seed-${data.sortOrder}-${item.name.toLowerCase().replaceAll(" ","-")}` },
        update: { ...item, categoryId: category.id },
        create: { id: `seed-${data.sortOrder}-${item.name.toLowerCase().replaceAll(" ","-")}`, ...item, categoryId: category.id, price: item.price }
      });
    }
  }
  for (let number = 1; number <= 8; number++) {
    await prisma.diningTable.upsert({ where: { number }, update: {}, create: { number } });
  }
  console.log("Seed complete. Admin: admin@qrcafe.local / ChangeMe123!");
}
main().finally(() => prisma.$disconnect());
