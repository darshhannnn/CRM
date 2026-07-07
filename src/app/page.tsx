"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { requestJson } from "@/lib/api-client";

type Tag = { id: number; name: string; color: string; _count?: { contacts: number } };
type Contact = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
  notes?: string | null;
  tags: Tag[];
  updatedAt: string;
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

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [q, setQ] = useState("");
  const [filterTag, setFilterTag] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [banner, setBanner] = useState<BannerState>(null);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingTags, setLoadingTags] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadContacts = useCallback(async () => {
    setLoadingContacts(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (filterTag) params.set("tagId", String(filterTag));
      const query = params.toString();
      const data = await requestJson<Contact[]>(
        query ? `/api/contacts?${query}` : "/api/contacts",
        { fallbackMessage: "Unable to load contacts" }
      );
      setContacts(data);
    } catch (error) {
      setContacts([]);
      setBanner({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to load contacts",
      });
    } finally {
      setLoadingContacts(false);
    }
  }, [filterTag, q]);

  const loadTags = useCallback(async () => {
    setLoadingTags(true);
    try {
      const data = await requestJson<Tag[]>("/api/tags", {
        fallbackMessage: "Unable to load tags",
      });
      setTags(data);
    } catch (error) {
      setTags([]);
      setBanner({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to load tags",
      });
    } finally {
      setLoadingTags(false);
    }
  }, []);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    void loadTags();
  }, [loadTags]);

  const createContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setBanner(null);

    try {
      await requestJson<Contact>("/api/contacts", {
        method: "POST",
        body: JSON.stringify(form),
        fallbackMessage: "Unable to create contact",
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      setBanner({ type: "success", message: "Contact created successfully." });
      await loadContacts();
    } catch (error) {
      setBanner({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to create contact",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteContact = async (id: number) => {
    if (!confirm("Delete this contact?")) return;

    setDeletingId(id);
    setBanner(null);
    try {
      await requestJson<{ ok: boolean }>(`/api/contacts/${id}`, {
        method: "DELETE",
        fallbackMessage: "Unable to delete contact",
      });
      setBanner({ type: "success", message: "Contact deleted." });
      await loadContacts();
    } catch (error) {
      setBanner({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to delete contact",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const activeTag = useMemo(
    () => tags.find((tag) => tag.id === filterTag) ?? null,
    [filterTag, tags]
  );

  const whatsappLink = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    return `https://wa.me/${cleaned}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage contacts, tags, and quick follow-ups from one place.
          </p>
        </div>
        <button
          onClick={() => {
            setBanner(null);
            setShowForm((current) => !current);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {showForm ? "Cancel" : "+ Add Contact"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Visible Contacts</p>
          <p className="mt-1 text-2xl font-semibold">{contacts.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Available Tags</p>
          <p className="mt-1 text-2xl font-semibold">{tags.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Active Filter</p>
          <p className="mt-1 text-sm font-medium text-gray-700">
            {activeTag ? activeTag.name : q.trim() ? `Search: ${q.trim()}` : "None"}
          </p>
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

      {showForm && (
        <form onSubmit={createContact} className="bg-white rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">New Contact</h2>
            {loadingTags && <span className="text-xs text-gray-500">Loading tags...</span>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Name *"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Phone *"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm w-full"
            rows={3}
          />
          {tags.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Tags</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className={`px-2 py-1 rounded-full text-xs cursor-pointer border ${
                      form.tagIds.includes(tag.id)
                        ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
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
                            : form.tagIds.filter((id) => id !== tag.id),
                        })
                      }
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <span className="text-xs text-gray-500">Name and phone are required.</span>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg border p-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Search contacts..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm flex-1"
          />
          <select
            value={filterTag ?? ""}
            onChange={(e) => setFilterTag(e.target.value ? Number(e.target.value) : null)}
            className="border rounded-lg px-3 py-2 text-sm sm:min-w-52"
          >
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setFilterTag(null);
            }}
            className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Search by name, phone, email, or company. Filter by tag to narrow down your list.
        </p>
      </div>

      {loadingContacts ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-gray-500">Loading contacts...</div>
      ) : contacts.length === 0 ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-gray-500">
          {q.trim() || filterTag
            ? "No contacts matched your current search or tag filter."
            : "No contacts yet. Add your first contact to get started."}
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-lg border p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:border-gray-300"
            >
              <Link href={`/contacts/${contact.id}`} className="flex-1 min-w-0">
                <div className="font-medium truncate">{contact.name}</div>
                <div className="text-sm text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>{contact.phone}</span>
                  {contact.company && <span className="text-gray-400">{contact.company}</span>}
                  {contact.email && <span className="text-gray-400">{contact.email}</span>}
                </div>
                {contact.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
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
              </Link>
              <div className="flex items-center gap-2 sm:ml-4">
                <a
                  href={whatsappLink(contact.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                  title="Open in WhatsApp"
                >
                  WhatsApp
                </a>
                <button
                  onClick={() => deleteContact(contact.id)}
                  disabled={deletingId === contact.id}
                  className="text-red-500 hover:text-red-600 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deletingId === contact.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
