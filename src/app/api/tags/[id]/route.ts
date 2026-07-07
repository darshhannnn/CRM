import { prisma } from "@/lib/prisma";
import { TagSchema } from "@/lib/validation";
import { parseIdParam, readJsonBody } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tagId = parseIdParam(params.id);
    const body = await readJsonBody(req);
    const parsed = TagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, color } = parsed.data;

    const existingTagByName = await prisma.tag.findFirst({
      where: { name, NOT: { id: tagId } },
    });

    if (existingTagByName) {
      return NextResponse.json(
        { error: "Tag name already exists" },
        { status: 409 }
      );
    }

    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: { name, color },
    });

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error("[PUT /api/tags/:id]", error);
    return NextResponse.json(
      { error: "Failed to update tag" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tagId = parseIdParam(params.id);
    await prisma.tag.delete({ where: { id: tagId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/tags/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}
