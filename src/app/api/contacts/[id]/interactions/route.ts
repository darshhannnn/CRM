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
