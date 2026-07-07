type RequestJsonOptions = RequestInit & {
  fallbackMessage?: string;
};

export async function requestJson<T>(
  input: RequestInfo | URL,
  options: RequestJsonOptions = {}
): Promise<T> {
  const { fallbackMessage = "Request failed", headers, ...rest } = options;
  const response = await fetch(input, {
    ...rest,
    headers: {
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : fallbackMessage;
    throw new Error(message);
  }

  return payload as T;
}

// Tag helpers
export async function updateTag(id: number, data: { name: string; color: string }) {
  return await requestJson(`/api/tags/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    fallbackMessage: "Failed to update tag",
  });
}

// Interaction helpers
export async function deleteInteraction(contactId: number, interactionId: number) {
  return await requestJson(`/api/contacts/${contactId}/interactions/${interactionId}`, {
    method: "DELETE",
    fallbackMessage: "Failed to delete interaction",
  });
}

export async function updateInteraction(
  contactId: number,
  interactionId: number,
  data: { type: string; content: string }
) {
  return await requestJson(`/api/contacts/${contactId}/interactions/${interactionId}`, {
    method: "PUT",
    body: JSON.stringify(data),
    fallbackMessage: "Failed to update interaction",
  });
}
