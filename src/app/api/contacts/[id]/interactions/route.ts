import { prisma } from "@/lib/prisma";
import { InteractionSchema } from "@/lib/validation";
import { parseIdParam, readJsonBody } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contactId = parseIdParam(params.id);

    const contactExists = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contactExists) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const interactions = await prisma.interaction.findMany({
      where: { contactId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(interactions);
  } catch (error) {
    console.error("[GET /api/contacts/:id/interactions]", error);
    return NextResponse.json(
      { error: "Failed to fetch interactions" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contactId = parseIdParam(params.id);
    const body = await readJsonBody(req);
    const parsed = InteractionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { type, content } = parsed.data;

    const contactExists = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contactExists) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const interaction = await prisma.interaction.create({
      data: {
        contactId,
        type,
        content,
      },
    });

    await prisma.contact.update({
      where: { id: contactId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(interaction, { status: 201 });
  } catch (error) {
    console.error("[POST /api/contacts/:id/interactions]", error);
    return NextResponse.json(
      { error: "Failed to create interaction" },
      { status: 500 }
    );
  }
}
