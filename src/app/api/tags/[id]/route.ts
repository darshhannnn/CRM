import { prisma } from "@/lib/prisma";
import { handleApiError, parseIdParam, parseTagInput } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tagId = parseIdParam(params.id);
    const body = await req.json();
    const { name, color } = parseTagInput(body);

    // Check if name is already taken by another tag
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
    return handleApiError(error, "Failed to update tag");
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
    return handleApiError(error, "Failed to delete tag");
  }
}
