"use client";

import React, { useState } from "react";
import { useTradingStore } from "@/store";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Textarea } from "@/components/ui";
import { format } from "date-fns";
import { Plus, Edit2, Trash2, Tag, Calendar, BookOpen, Smile, Meh, Frown } from "lucide-react";
import type { JournalEntry } from "@/types";
import { cn } from "@/lib/utils";

export default function JournalPage() {
  const { journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useTradingStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    mood: "neutral" as "positive" | "neutral" | "negative",
    lessonLearned: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entryData: JournalEntry = {
      id: editingId || Math.random().toString(36).substring(2, 15),
      date: new Date(),
      title: formData.title,
      content: formData.content,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      mood: formData.mood,
      lessonLearned: formData.lessonLearned || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (editingId) {
      updateJournalEntry(editingId, entryData);
      setEditingId(null);
    } else {
      addJournalEntry(entryData);
    }

    setFormData({
      title: "",
      content: "",
      tags: "",
      mood: "neutral",
      lessonLearned: "",
    });
    setIsCreating(false);
  };

  const handleEdit = (entry: JournalEntry) => {
    setFormData({
      title: entry.title,
      content: entry.content,
      tags: entry.tags.join(", "),
      mood: entry.mood || "neutral",
      lessonLearned: entry.lessonLearned || "",
    });
    setEditingId(entry.id);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this journal entry?")) {
      deleteJournalEntry(id);
    }
  };

  const getMoodIcon = (mood?: "positive" | "neutral" | "negative") => {
    switch (mood) {
      case "positive":
        return <Smile className="w-4 h-4 text-emerald-500/90" />;
      case "negative":
        return <Frown className="w-4 h-4 text-rose-500/90" />;
      default:
        return <Meh className="w-4 h-4 text-amber-500/90" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 
            className="text-xl font-medium text-slate-100 tracking-tight"
            style={{ fontFamily: 'var(--font-instrument)' }}
          >
            Trading Journal
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Document your trades, insights, and lessons learned
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4" />
          New Entry
        </Button>
      </div>

      {/* Journal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/50 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-500/80" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Total Entries</p>
              <p className="text-xl font-semibold text-slate-200 tabular-nums" style={{ fontFamily: 'var(--font-jetbrains)' }}>{journalEntries.length}</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/50 flex items-center justify-center">
              <Smile className="w-5 h-5 text-emerald-500/80" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Positive Days</p>
              <p className="text-xl font-semibold text-slate-200 tabular-nums" style={{ fontFamily: 'var(--font-jetbrains)' }}>
                {journalEntries.filter((e) => e.mood === "positive").length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950/50 flex items-center justify-center">
              <Meh className="w-5 h-5 text-amber-500/80" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Neutral Days</p>
              <p className="text-xl font-semibold text-slate-200 tabular-nums" style={{ fontFamily: 'var(--font-jetbrains)' }}>
                {journalEntries.filter((e) => e.mood === "neutral").length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-950/50 flex items-center justify-center">
              <Frown className="w-5 h-5 text-rose-500/80" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Negative Days</p>
              <p className="text-xl font-semibold text-slate-200 tabular-nums" style={{ fontFamily: 'var(--font-jetbrains)' }}>
                {journalEntries.filter((e) => e.mood === "negative").length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Entry" : "New Journal Entry"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Entry title..."
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Content</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your thoughts, analysis, observations..."
                  required
                  rows={6}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Tags (comma separated)</label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="analysis, risk-management, psychology..."
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Mood</label>
                  <div className="flex gap-2">
                    {(["positive", "neutral", "negative"] as const).map((mood) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => setFormData({ ...formData, mood })}
                        className={cn(
                          "flex-1 p-2 rounded-lg border transition-colors flex items-center justify-center gap-2",
                          formData.mood === mood
                            ? mood === "positive"
                              ? "bg-emerald-950/50 border-emerald-600/50"
                              : mood === "negative"
                              ? "bg-rose-950/50 border-rose-600/50"
                              : "bg-amber-950/50 border-amber-600/50"
                            : "bg-slate-800/60 border-slate-700/50 hover:border-slate-600/50"
                        )}
                      >
                        {getMoodIcon(mood)}
                        <span className="text-sm capitalize text-slate-300">{mood}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Lesson Learned (optional)</label>
                <Textarea
                  value={formData.lessonLearned}
                  onChange={(e) => setFormData({ ...formData, lessonLearned: e.target.value })}
                  placeholder="What did you learn from today's trading?"
                  rows={2}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                    setFormData({
                      title: "",
                      content: "",
                      tags: "",
                      mood: "neutral",
                      lessonLearned: "",
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingId ? "Update" : "Save Entry"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Journal Entries */}
      <div className="space-y-4">
        {journalEntries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-200 mb-2" style={{ fontFamily: 'var(--font-instrument)' }}>No journal entries yet</h3>
              <p className="text-slate-500 mb-4">
                Start documenting your trading journey by creating your first entry.
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4" />
                Create First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          journalEntries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getMoodIcon(entry.mood)}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200" style={{ fontFamily: 'var(--font-instrument)' }}>{entry.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(entry.date), "MMMM dd, yyyy")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-2 rounded-lg hover:bg-slate-800/60 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 rounded-lg hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-400 whitespace-pre-wrap mb-4">{entry.content}</p>

                {entry.lessonLearned && (
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/30 mb-4">
                    <p className="text-xs text-emerald-500/90 font-medium mb-1 uppercase tracking-wider">Lesson Learned</p>
                    <p className="text-sm text-slate-400">{entry.lessonLearned}</p>
                  </div>
                )}

                {entry.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-3 h-3 text-slate-600" />
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="default" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
