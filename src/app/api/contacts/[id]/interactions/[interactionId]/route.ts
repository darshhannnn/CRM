import { prisma } from "@/lib/prisma";
import { InteractionSchema } from "@/lib/validation";
import { parseIdParam, readJsonBody } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; interactionId: string } }
) {
  try {
    const contactId = parseIdParam(params.id);
    const interactionId = parseIdParam(params.interactionId, "interactionId");

    const existingInteraction = await prisma.interaction.findFirst({
      where: { id: interactionId, contactId },
    });

    if (!existingInteraction) {
      return NextResponse.json({ error: "Interaction not found" }, { status: 404 });
    }

    const body = await readJsonBody(req);
    const parsed = InteractionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { type, content } = parsed.data;
    const updatedInteraction = await prisma.interaction.update({
      where: { id: interactionId },
      data: { type, content },
    });

    await prisma.contact.update({
      where: { id: contactId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(updatedInteraction);
  } catch (error) {
    console.error("[PUT /api/contacts/:id/interactions/:interactionId]", error);
    return NextResponse.json(
      { error: "Failed to update interaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; interactionId: string } }
) {
  try {
    const contactId = parseIdParam(params.id);
    const interactionId = parseIdParam(params.interactionId, "interactionId");

    const existingInteraction = await prisma.interaction.findFirst({
      where: { id: interactionId, contactId },
    });

    if (!existingInteraction) {
      return NextResponse.json({ error: "Interaction not found" }, { status: 404 });
    }

    await prisma.interaction.delete({ where: { id: interactionId } });

    await prisma.contact.update({
      where: { id: contactId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/contacts/:id/interactions/:interactionId]", error);
    return NextResponse.json(
      { error: "Failed to delete interaction" },
      { status: 500 }
    );
  }
}
