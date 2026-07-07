import { prisma } from "@/lib/prisma";
import { TagSchema } from "@/lib/validation";
import { readJsonBody } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { contacts: true } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("[GET /api/tags]", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await readJsonBody(req);
    const parsed = TagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, color } = parsed.data;

    const existing = await prisma.tag.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "Tag already exists" }, { status: 409 });
    }

    const tag = await prisma.tag.create({
      data: { name, color },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("[POST /api/tags]", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
