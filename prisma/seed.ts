import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.interaction.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.tag.deleteMany();

  console.log("Cleared existing data.");

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "Lead", color: "#10b981" } }),
    prisma.tag.create({ data: { name: "Customer", color: "#6366f1" } }),
    prisma.tag.create({ data: { name: "VIP", color: "#f59e0b" } }),
    prisma.tag.create({ data: { name: "Cold", color: "#ef4444" } }),
  ]);
  console.log("Created tags.");

  // Create contacts with interactions
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        name: "Alice Smith",
        phone: "+1234567890",
        email: "alice@example.com",
        company: "Tech Corp",
        notes: "Interested in our enterprise plan.",
        tags: { connect: [{ id: tags[0].id }, { id: tags[2].id }] },
        interactions: {
          createMany: {
            data: [
              {
                type: "call",
                content: "Initial outreach call. Very interested in the product.",
                createdAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
              },
              {
                type: "whatsapp",
                content: "Sent brochure link. Will follow up next week.",
                createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
              },
            ],
          },
        },
      },
    }),
    prisma.contact.create({
      data: {
        name: "Bob Johnson",
        phone: "+0987654321",
        email: "bob@example.com",
        company: "Design Studio",
        notes: "Existing customer, uses monthly plan.",
        tags: { connect: [{ id: tags[1].id }] },
        interactions: {
          create: {
            type: "meeting",
            content: "QBR meeting - reviewed usage and plans for next quarter.",
            createdAt: new Date(Date.now() - 86400000 * 1), // 1 day ago
          },
        },
      },
    }),
    prisma.contact.create({
      data: {
        name: "Charlie Davis",
        phone: "+1122334455",
        email: "charlie@example.com",
        tags: { connect: [{ id: tags[3].id }] },
      },
    }),
  ]);
  console.log("Created contacts and interactions.");
  console.log(`Created ${contacts.length} contacts.`);
  console.log(`Created ${tags.length} tags.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
