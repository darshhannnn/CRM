import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  parseContactInput,
  parseIdParam,
  readJsonBody,
} from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contactId = parseIdParam(params.id);
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: { tags: true, interactions: { orderBy: { createdAt: "desc" } } },
    });

    if (!contact) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error) {
    return handleApiError(error, "Failed to fetch contact");
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contactId = parseIdParam(params.id);
    const body = await readJsonBody(req);
    const { name, phone, email, company, notes, tagIds } = parseContactInput(body);

    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        name,
        phone,
        email: email || null,
        company: company || null,
        notes: notes || null,
        tags: tagIds !== undefined
          ? { set: tagIds.map((id: number) => ({ id })) }
          : undefined,
      },
      include: { tags: true },
    });

    return NextResponse.json(contact);
  } catch (error) {
    return handleApiError(error, "Failed to update contact");
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contactId = parseIdParam(params.id);
    await prisma.contact.delete({ where: { id: contactId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "Failed to delete contact");
  }
}
