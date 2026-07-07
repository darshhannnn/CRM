import { prisma } from "@/lib/prisma";
import {
  escapeLike,
  handleApiError,
  parseContactInput,
  parseIdParam,
  readJsonBody,
} from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const tagId = searchParams.get("tagId");

    const where: Record<string, unknown> = {};

    if (q) {
      const escaped = escapeLike(q);
      where.OR = [
        { name: { contains: escaped } },
        { phone: { contains: escaped } },
        { email: { contains: escaped } },
        { company: { contains: escaped } },
      ];
    }

    if (tagId) {
      where.tags = { some: { id: parseIdParam(tagId, "tagId") } };
    }

    const contacts = await prisma.contact.findMany({
      where,
      include: { tags: true },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    return handleApiError(error, "Failed to fetch contacts");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await readJsonBody(req);
    const { name, phone, email, company, notes, tagIds } = parseContactInput(body);

    const contact = await prisma.contact.create({
      data: {
        name,
        phone,
        email: email || null,
        company: company || null,
        notes: notes || null,
        tags: tagIds?.length
          ? { connect: tagIds.map((id: number) => ({ id })) }
          : undefined,
      },
      include: { tags: true },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to create contact");
  }
}
