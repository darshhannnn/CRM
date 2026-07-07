import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  parseTagInput,
  readJsonBody,
} from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { contacts: true } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(tags);
  } catch (error) {
    return handleApiError(error, "Failed to fetch tags");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await readJsonBody(req);
    const { name, color } = parseTagInput(body);

    const existing = await prisma.tag.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "Tag already exists" }, { status: 409 });
    }

    const tag = await prisma.tag.create({
      data: { name, color: color || "#6366f1" },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to create tag");
  }
}
