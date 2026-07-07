import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

type JsonObject = Record<string, unknown>;

export class ApiError extends Error {
  status: number;
  details?: JsonObject;

  constructor(status: number, message: string, details?: JsonObject) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function asObject(value: unknown, message = "Invalid request body"): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(400, message);
  }

  return value as JsonObject;
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asOptionalString(value: unknown): string | null {
  const parsed = asTrimmedString(value);
  return parsed ? parsed : null;
}

function asIdArray(value: unknown): number[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new ApiError(400, "tagIds must be an array of numeric IDs");
  }

  const ids = value.map((entry) => Number(entry));
  if (ids.some((id) => !Number.isInteger(id) || id < 1)) {
    throw new ApiError(400, "tagIds must only contain positive numeric IDs");
  }

  return Array.from(new Set(ids));
}

export function parseIdParam(value: unknown, fieldName = "id"): number {
  const strValue = String(value);
  const parsed = Number(strValue);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ApiError(400, `Invalid ${fieldName}`);
  }

  return parsed;
}

export async function readJsonBody(req: Request): Promise<JsonObject> {
  try {
    return asObject(await req.json());
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "Request body must be valid JSON");
  }
}

export function parseContactInput(body: unknown) {
  const payload = asObject(body);
  const name = asTrimmedString(payload.name);
  const phone = asTrimmedString(payload.phone);
  const email = asOptionalString(payload.email);
  const company = asOptionalString(payload.company);
  const notes = asOptionalString(payload.notes);
  const tagIds = "tagIds" in payload ? asIdArray(payload.tagIds) : undefined;

  if (!name) {
    throw new ApiError(400, "Name is required");
  }

  if (!phone) {
    throw new ApiError(400, "Phone is required");
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "Email must be a valid email address");
  }

  return { name, phone, email, company, notes, tagIds };
}

export function parseTagInput(body: unknown) {
  const payload = asObject(body);
  const name = asTrimmedString(payload.name);
  const color = asTrimmedString(payload.color) || "#6366f1";

  if (!name) {
    throw new ApiError(400, "Name is required");
  }

  if (!/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(color)) {
    throw new ApiError(400, "Color must be a valid hex value");
  }

  return { name, color };
}

export function parseInteractionInput(body: unknown) {
  const payload = asObject(body);
  const content = asTrimmedString(payload.content);
  const type = asTrimmedString(payload.type) || "note";
  const allowedTypes = new Set(["note", "call", "meeting", "whatsapp"]);

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  if (!allowedTypes.has(type)) {
    throw new ApiError(400, "Interaction type is invalid");
  }

  return { type, content };
}

export function handleApiError(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details ?? null,
      },
      { status: error.status }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A record with that value already exists" }, { status: 409 });
    }

    if (error.code === "P2003") {
      return NextResponse.json({ error: "This request references a related record that does not exist" }, { status: 400 });
    }

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
  }

  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
