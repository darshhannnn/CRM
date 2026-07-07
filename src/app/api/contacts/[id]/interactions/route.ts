import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  parseIdParam,
  parseInteractionInput,
  readJsonBody,
} from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contactId = parseIdParam(params.id);
    const interactions = await prisma.interaction.findMany({
      where: { contactId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(interactions);
  } catch (error) {
    return handleApiError(error, "Failed to fetch interactions");
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contactId = parseIdParam(params.id);
    const body = await readJsonBody(req);
    const { type, content } = parseInteractionInput(body);

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
    return handleApiError(error, "Failed to create interaction");
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contactId = parseIdParam(params.id);
    const body = await readJsonBody(req);
    const interactionId = parseIdParam(body.interactionId, "interactionId");

    // Verify interaction belongs to this contact
    const existingInteraction = await prisma.interaction.findFirst({
      where: { id: interactionId, contactId },
    });

    if (!existingInteraction) {
      return NextResponse.json({ error: "Interaction not found" }, { status: 404 });
    }

    const { type, content } = parseInteractionInput(body);
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
    return handleApiError(error, "Failed to update interaction");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contactId = parseIdParam(params.id);
    const body = await readJsonBody(req);
    const interactionId = parseIdParam(body.interactionId, "interactionId");

    // Verify interaction belongs to this contact
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
    return handleApiError(error, "Failed to delete interaction");
  }
}
