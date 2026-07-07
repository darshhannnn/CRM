"use client";

import { useCallback, useEffect, useState } from "react";
import { requestJson, updateTag } from "@/lib/api-client";

type Tag = { id: number; name: string; color: string; _count: { contacts: number } };

type BannerState = {
  type: "success" | "error";
  message: string;
} | null;

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [banner, setBanner] = useState<BannerState>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setBanner(null);
    try {
      await requestJson<Tag>("/api/tags", {
        method: "POST",
        body: JSON.stringify({ name, color }),
        fallbackMessage: "Unable to create tag",
      });
      setName("");
      setColor(COLORS[0]);
      setBanner({ type: "success", message: "Tag created successfully." });
      await load();
    } catch (error) {
      setBanner({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to create tag",
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this tag?")) return;

    setDeletingId(id);
    setBanner(null);
    try {
      await requestJson<{ ok: boolean }>(`/api/tags/${id}`, {
        method: "DELETE",
        fallbackMessage: "Unable to delete tag",
      });
      setBanner({ type: "success", message: "Tag deleted." });
      await load();
    } catch (error) {
      setBanner({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to delete tag",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditColor("");
  };

  const saveEdit = async (id: number) => {
    if (!editName.trim()) return;

    setSavingEdit(true);
    setBanner(null);
    try {
      await updateTag(id, { name: editName, color: editColor });
      setBanner({ type: "success", message: "Tag updated successfully." });
      setEditingId(null);
      await load();
    } catch (error) {
      setBanner({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to update tag",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tags</h1>
        <p className="mt-1 text-sm text-gray-500">
          Organize contacts with reusable tags and color coding.
        </p>
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

      <form onSubmit={create} className="bg-white rounded-lg border p-4 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="sm:w-72">
            <label htmlFor="tag-name" className="block text-xs font-medium text-gray-700 mb-1">
              Tag name
            </label>
            <input
              id="tag-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>
          <div className="self-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Adding..." : "Add Tag"}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((currentColor) => (
            <button
              key={currentColor}
              type="button"
              onClick={() => setColor(currentColor)}
              className={`h-8 w-8 rounded-full border-2 ${
                color === currentColor ? "border-gray-900" : "border-transparent"
              }`}
              style={{ backgroundColor: currentColor }}
              title={`Select ${currentColor}`}
            />
          ))}
        </div>
      </form>

      {loading ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-gray-500">Loading tags...</div>
      ) : tags.length === 0 ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-gray-500">
          No tags yet. Create one to start grouping contacts.
        </div>
      ) : (
        <div className="space-y-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="bg-white rounded-lg border p-4"
            >
              {editingId === tag.id ? (
                <div className="space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="sm:w-72">
                      <label htmlFor={`edit-tag-${tag.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                        Tag name
                      </label>
                      <input
                        id={`edit-tag-${tag.id}`}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm w-full"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map((currentColor) => (
                        <button
                          key={currentColor}
                          type="button"
                          onClick={() => setEditColor(currentColor)}
                          className={`h-8 w-8 rounded-full border-2 ${
                            editColor === currentColor ? "border-gray-900" : "border-transparent"
                          }`}
                          style={{ backgroundColor: currentColor }}
                          title={`Select ${currentColor}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => saveEdit(tag.id)}
                      disabled={savingEdit}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {savingEdit ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={savingEdit}
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium">{tag.name}</span>
                    <span className="text-sm text-gray-500">
                      {tag._count.contacts} contact{tag._count.contacts !== 1 && "s"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(tag)}
                      className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(tag.id)}
                      disabled={deletingId === tag.id}
                      className="text-red-500 hover:text-red-600 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {deletingId === tag.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
