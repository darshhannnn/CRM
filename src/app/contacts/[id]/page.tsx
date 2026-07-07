"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { requestJson, deleteInteraction, updateInteraction } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { Avatar } from "@/components/Avatar";

type Tag = { id: number; name: string; color: string };
type Interaction = { id: number; type: string; content: string; createdAt: string };
type Contact = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
  notes: string | null;
  tags: Tag[];
  interactions: Interaction[];
};

type BannerState = {
  type: "success" | "error";
  message: string;
} | null;

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  company: "",
  notes: "",
  tagIds: [] as number[],
};

const EMPTY_INTERACTION = {
  type: "note",
  content: "",
};

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<BannerState>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [newInteraction, setNewInteraction] = useState(EMPTY_INTERACTION);
  const [saving, setSaving] = useState(false);
  const [addingInteraction, setAddingInteraction] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingInteractionId, setEditingInteractionId] = useState<number | null>(null);
  const [editingInteractionData, setEditingInteractionData] = useState({
    type: "note",
    content: "",
  });
  const [savingInteraction, setSavingInteraction] = useState(false);
  const [deletingInteractionId, setDeletingInteractionId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [loadedContact, loadedTags] = await Promise.all([
        requestJson<Contact>(`/api/contacts/${id}`, {
          fallbackMessage: "Unable to load contact details",
        }),
        requestJson<Tag[]>("/api/tags", {
          fallbackMessage: "Unable to load tags",
        }),
      ]);
      setContact(loadedContact);
      setAllTags(loadedTags);
      setForm({
        name: loadedContact.name,
        phone: loadedContact.phone,
        email: loadedContact.email || "",
        company: loadedContact.company || "",
        notes: loadedContact.notes || "",
        tagIds: loadedContact.tags.map((tag) => tag.id),
      });
    } catch (error) {
      setContact(null);
      setBanner({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to load contact details",
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setBanner(null);

    try {
      await requestJson<Contact>(`/api/contacts/${id}`, {
        method: "PUT",
        body: JSON.stringify(form),
        fallbackMessage: "Unable to update contact",
      });
      setEditing(false);
      setBanner({ type: "success", message: "Contact updated successfully." });
      await load();
    } catch (error) {
      setBanner({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to update contact",
      });
    } finally {
      setSaving(false);
    }
  };

  const addInteractionHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInteraction.content.trim()) return;

    setAddingInteraction(true);
    setBanner(null);
    try {
      await requestJson<Interaction>(`/api/contacts/${id}/interactions`, {
        method: "POST",
        body: JSON.stringify(newInteraction),
        fallbackMessage: "Unable to add interaction",
      });
      setNewInteraction(EMPTY_INTERACTION);
      setBanner({ type: "success", message: "Interaction added successfully." });
      await load();
    } catch (error) {
      setBanner({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to add interaction",
      });
    } finally {
      setAddingInteraction(false);
    }
  };

  const deleteContact = async () => {
    if (!confirm("Delete this contact?")) return;

    setDeleting(true);
    setBanner(null);
    try {
      await requestJson<{ ok: boolean }>(`/api/contacts/${id}`, {
        method: "DELETE",
        fallbackMessage: "Unable to delete contact",
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      setBanner({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to delete contact",
      });
      setDeleting(false);
    }
  };

  const startEditInteraction = (interaction: Interaction) => {
    setEditingInteractionId(interaction.id);
    setEditingInteractionData({ type: interaction.type, content: interaction.content });
  };

  const cancelEditInteraction = () => {
    setEditingInteractionId(null);
    setEditingInteractionData({ type: "note", content: "" });
  };

  const saveEditInteraction = async (interactionId: number) => {
    if (!editingInteractionData.content.trim()) return;
    setSavingInteraction(true);
    setBanner(null);
    try {
      await updateInteraction(contact!.id, interactionId, editingInteractionData);
      setEditingInteractionId(null);
      setBanner({ type: "success", message: "Interaction updated successfully." });
      await load();
    } catch (error) {
      setBanner({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to update interaction",
      });
    } finally {
      setSavingInteraction(false);
    }
  };

  const deleteInteractionHandler = async (interactionId: number) => {
    if (!confirm("Delete this interaction?")) return;
    setDeletingInteractionId(interactionId);
    setBanner(null);
    try {
      await deleteInteraction(contact!.id, interactionId);
      setBanner({ type: "success", message: "Interaction deleted successfully." });
      await load();
    } catch (error) {
      setBanner({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to delete interaction",
      });
    } finally {
      setDeletingInteractionId(null);
    }
  };

  const whatsappLink = useMemo(() => {
    if (!contact) return "#";
    return `https://wa.me/${contact.phone.replace(/\D/g, "")}`;
  }, [contact]);

  if (loading) {
    return <div className="rounded-lg border bg-white p-6 text-sm text-gray-500">Loading contact...</div>;
  }

  if (!contact) {
    return (
      <div className="space-y-4">
        {banner && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {banner.message}
          </div>
        )}
        <Link href="/" className="text-sm text-indigo-600 hover:underline">
          &larr; Back to contacts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-indigo-600 hover:underline">
          &larr; Back to contacts
        </Link>
        <div className="flex gap-2">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700"
          >
            WhatsApp
          </a>
          {!editing && (
            <button
              onClick={() => {
                setBanner(null);
                setEditing(true);
              }}
              className="border rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
            >
              Edit
            </button>
          )}
          <button
            onClick={deleteContact}
            disabled={deleting}
            className="text-red-500 hover:text-red-600 text-sm px-3 py-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {banner && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            banner.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {banner.message}
        </div>
      )}

      {editing ? (
        <form onSubmit={save} className="bg-white rounded-lg border p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-name" className="block text-xs font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="edit-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm w-full"
              />
            </div>
            <div>
              <label htmlFor="edit-phone" className="block text-xs font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                id="edit-phone"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm w-full"
              />
            </div>
            <div>
              <label htmlFor="edit-email" className="block text-xs font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="edit-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm w-full"
              />
            </div>
            <div>
              <label htmlFor="edit-company" className="block text-xs font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                id="edit-company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm w-full"
              />
            </div>
          </div>
          <div>
            <label htmlFor="edit-notes" className="block text-xs font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="edit-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm w-full"
              rows={4}
            />
          </div>
          {allTags.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Tags</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <label
                    key={tag.id}
                    className={`px-2 py-1 rounded-full text-xs cursor-pointer border ${
                      form.tagIds.includes(tag.id)
                        ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.tagIds.includes(tag.id)}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          tagIds: e.target.checked
                            ? [...form.tagIds, tag.id]
                            : form.tagIds.filter((currentId) => currentId !== tag.id),
                        })
                      }
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setForm({
                  name: contact.name,
                  phone: contact.phone,
                  email: contact.email || "",
                  company: contact.company || "",
                  notes: contact.notes || "",
                  tagIds: contact.tags.map((tag) => tag.id),
                });
              }}
              className="border rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <Avatar name={contact.name} className="w-12 h-12 text-base" />
              <div>
                <h2 className="text-xl font-bold">{contact.name}</h2>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>Phone: {contact.phone}</p>
                  {contact.email && <p>Email: {contact.email}</p>}
                  {contact.company && <p>Company: {contact.company}</p>}
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
              {contact.interactions.length} interaction{contact.interactions.length !== 1 && "s"}
            </div>
          </div>
          {contact.notes && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">
              {contact.notes}
            </div>
          )}
          {contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {contact.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Add Interaction</h3>
        <form onSubmit={addInteractionHandler} className="flex flex-col gap-2 sm:flex-row">
          <div>
            <label htmlFor="interaction-type" className="sr-only">
              Interaction type
            </label>
            <select
              id="interaction-type"
              value={newInteraction.type}
              onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm sm:w-40"
            >
              <option value="note">Note</option>
              <option value="call">Call</option>
              <option value="meeting">Meeting</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="interaction-content" className="sr-only">
              Interaction details
            </label>
            <input
              id="interaction-content"
              placeholder="What happened..."
              value={newInteraction.content}
              onChange={(e) => setNewInteraction({ ...newInteraction, content: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>
          <button
            type="submit"
            disabled={addingInteraction}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {addingInteraction ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      <div>
        <h3 className="font-semibold mb-3">History</h3>
        {contact.interactions.length === 0 ? (
          <div className="rounded-lg border bg-white p-4 text-sm text-gray-500">
            No interactions yet. Add one to keep the timeline up to date.
          </div>
        ) : (
          <div className="space-y-2">
            {contact.interactions.map((interaction) => (
            <div key={interaction.id} className="bg-white rounded-lg border p-3">
              {editingInteractionId === interaction.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveEditInteraction(interaction.id);
                  }}
                  className="space-y-2"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <select
                      value={editingInteractionData.type}
                      onChange={(e) =>
                        setEditingInteractionData({
                          ...editingInteractionData,
                          type: e.target.value })
                      }
                      className="border rounded-lg px-3 py-2 text-sm sm:w-40"
                    >
                      <option value="note">Note</option>
                      <option value="call">Call</option>
                      <option value="meeting">Meeting</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                    <input
                      value={editingInteractionData.content}
                      onChange={(e) =>
                        setEditingInteractionData({
                          ...editingInteractionData,
                          content: e.target.value,
                        })
                      }
                      className="border rounded-lg px-3 py-2 text-sm flex-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={savingInteraction}
                      className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {savingInteraction ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditInteraction}
                      disabled={savingInteraction}
                      className="border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-medium uppercase">{interaction.type}</span>
                      <span>&middot;</span>
                      <span>{formatDate(interaction.createdAt)}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditInteraction(interaction)}
                        className="text-xs text-gray-500 hover:text-indigo-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteInteractionHandler(interaction.id)}
                        disabled={deletingInteractionId === interaction.id}
                        className="text-xs text-gray-500 hover:text-red-500 disabled:opacity-60"
                      >
                        {deletingInteractionId === interaction.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm">{interaction.content}</p>
                </>
              )}
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}
