import { prisma } from "@/lib/prisma";
import { ContactSchema } from "@/lib/validation";
import { parseIdParam, readJsonBody } from "@/lib/api-utils";
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
    console.error("[GET /api/contacts/:id]", error);
    return NextResponse.json(
      { error: "Failed to fetch contact" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contactId = parseIdParam(params.id);
    const body = await readJsonBody(req);
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, phone, email, company, notes, tagIds } = parsed.data;

    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        name,
        phone,
        email: email || null,
        company: company || null,
        notes: notes || null,
        tags: tagIds !== undefined
          ? { set: tagIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { tags: true },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("[PUT /api/contacts/:id]", error);
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
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
    console.error("[DELETE /api/contacts/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
