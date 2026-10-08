"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Search, Folder, FileText, Clock, Tag, ChevronRight, ChevronDown, Plus, Pencil, Trash2, X, Save, BookOpen, Brain,
  Shield, Network, Eye, Lightbulb, TrendingUp, Newspaper, Filter, RefreshCw, CheckCircle, XCircle, AlertCircle,
  Settings, Layers, Zap, Database
} from "lucide-react";
import { LabTerminalFrame, LabSectionLabel } from "@/components/ui/lab-primitives";
import RichTextEditor from "@/components/RichTextEditor";
import ChatMarkdown from "@/components/agent/ChatMarkdown";
import type { ShifterMemory, IcmFolder, IcmFile } from "@/lib/shifter-icm";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CR", { year: "numeric", month: "short", day: "2-digit" });
}

function fileBadge(extension: string): { label: string; color: string } {
  switch (extension) {
    case ".md":
      return { label: "DOC", color: "text-[#5BE9FF] border-[#5BE9FF]/30 bg-[#5BE9FF]/8" };
    case ".json":
      return { label: "DATA", color: "text-[#F540FF] border-[#F540FF]/30 bg-[#F540FF]/8" };
    case ".yml":
    case ".yaml":
      return { label: "CONF", color: "text-[#00FF88] border-[#00FF88]/30 bg-[#00FF88]/8" };
    case ".ts":
    case ".tsx":
      return { label: "CODE", color: "text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/8" };
    default:
      return { label: "FILE", color: "text-white/70 border-white/15 bg-white/5" };
  }
}

function simpleMarkdownToHtml(md: string): string {
  if (!md) return "<p></p>";
  const withBlocks = md
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.*$)/gim, "<li>$1</li>");

  const html = withBlocks
    .replace(/(<li>.*?<\/li>)/gim, "<ul>$1</ul>")
    .split("\n\n")
    .map((p) => (p.trim().startsWith("<") ? p : `<p>${p}</p>`))
    .join("");

  return html;
}

interface FolderNode {
  id: string;
  name: string;
  relativePath: string;
  folder: IcmFolder | null;
  children: FolderNode[];
  totalFiles: number;
}

function buildFolderTree(folders: IcmFolder[]): FolderNode {
  const root: FolderNode = {
    id: "root",
    name: "Shifter ICM",
    relativePath: "",
    folder: null,
    children: [],
    totalFiles: 0,
  };

  for (const folder of folders) {
    const parts = folder.relativePath ? folder.relativePath.split("/") : [];
    let current = root;
    let builtPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      builtPath = builtPath ? `${builtPath}/${part}` : part;
      let child = current.children.find((c) => c.name === part);
      if (!child) {
        child = {
          id: builtPath.replace(/[^a-zA-Z0-9]/g, "_"),
          name: part,
          relativePath: builtPath,
          folder: null,
          children: [],
          totalFiles: 0,
        };
        current.children.push(child);
      }
      current = child;
    }

    current.folder = folder;
    current.totalFiles += folder.files.length;
  }

  const computeTotals = (node: FolderNode): number => {
    let sum = node.folder ? node.folder.files.length : 0;
    for (const child of node.children) {
      sum += computeTotals(child);
    }
    node.totalFiles = sum;
    return sum;
  };
  computeTotals(root);

  const sortNodes = (node: FolderNode) => {
    node.children.sort((a, b) => {
      // Folders with children first, then alphabetical
      if (a.children.length > 0 && b.children.length === 0) return -1;
      if (a.children.length === 0 && b.children.length > 0) return 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortNodes);
  };
  sortNodes(root);

  return root;
}

function folderIcon(path: string) {
  const p = path.toLowerCase();
  if (p === "memory") return Brain;
  if (p === "_config") return Settings;
  if (p === "skills") return Zap;
  if (p === "stages") return Layers;
  if (p === "output" || p.endsWith("/output")) return Database;
  return Folder;
}

function FolderTreeItem({
  node,
  depth,
  selectedFolderId,
  expandedFolders,
  onToggle,
  onSelect,
}: {
  node: FolderNode;
  depth: number;
  selectedFolderId: string;
  expandedFolders: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const isExpanded = expandedFolders.has(node.id);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedFolderId === node.id;
  const Icon = folderIcon(node.relativePath);
  const Chevron = isExpanded ? ChevronDown : ChevronRight;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) onToggle(node.id);
          onSelect(node.id);
        }}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        className={`flex w-full items-center gap-1.5 rounded-lg py-1.5 pr-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F540FF]/60 ${
          isSelected ? "bg-[#141A36] text-white" : "text-white/60 hover:bg-white/[0.04] hover:text-white"
        }`}
      >
        {hasChildren ? (
          <Chevron size={12} className="shrink-0 text-white/40" />
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <Icon size={14} className={`shrink-0 ${isSelected ? "text-[#F540FF]" : "text-white/40"}`} />
        <span className="min-w-0 flex-1 truncate [font-family:var(--font-figtree)] text-[12px]">{node.name}</span>
        <span className="shrink-0 [font-family:var(--font-fira-mono)] text-[9px] text-white/30">{node.totalFiles}</span>
      </button>
      {isExpanded &&
        node.children.map((child) => (
          <FolderTreeItem
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedFolderId={selectedFolderId}
            expandedFolders={expandedFolders}
            onToggle={onToggle}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}

type RightPanel = "preview" | "sources" | "insights" | "entities" | "columns" | "trends" | "graph";

interface MemoryInsight {
  id: number;
  slug: string;
  title: string;
  body: string;
  confidence: "low" | "medium" | "high";
  status: "emerging" | "validated" | "deprecated";
  first_seen: string;
  last_updated: string;
}

interface MemoryEntity {
  id: number;
  name: string;
  type: string;
  relevance: "high" | "medium" | "low";
}

interface MemoryRelationship {
  id: number;
  from_entity: string;
  to_entity: string;
  relation: string;
  context: string;
}

interface MemoryColumn {
  id: number;
  slug: string;
  title: string;
  tension: string;
  thesis: string;
  lede: string;
  status: string;
  last_updated: string;
}

const TABS: { id: RightPanel; label: string; icon: typeof Eye }[] = [
  { id: "preview", label: "Vista", icon: Eye },
  { id: "sources", label: "Fuentes", icon: BookOpen },
  { id: "insights", label: "Aprendizaje", icon: Lightbulb },
  { id: "trends", label: "Tendencias", icon: TrendingUp },
  { id: "entities", label: "Entidades", icon: Network },
  { id: "columns", label: "Columnas", icon: Newspaper },
  { id: "graph", label: "Grafo", icon: Brain },
];

export default function MemoryTab({ memory, apiBase = "/api/shifter" }: { memory: ShifterMemory; apiBase?: string }) {
  const folderTree = useMemo(() => buildFolderTree(memory.folders), [memory]);

  const [selectedFolderId, setSelectedFolderId] = useState<string>(() => {
    const firstWithFiles = memory.folders.find((f) => f.files.length > 0);
    return firstWithFiles?.id || folderTree.id;
  });
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    const initial = new Set<string>([folderTree.id]);
    folderTree.children.forEach((c) => initial.add(c.id));
    return initial;
  });
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<"all" | "md" | "json" | "code" | "other">("all");
  const [fileDateFilter, setFileDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<IcmFile | null>(null);
  const [editorValue, setEditorValue] = useState("");
  const [editorFilename, setEditorFilename] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [rightPanel, setRightPanel] = useState<RightPanel>("preview");

  // Memory data from DB
  const [insights, setInsights] = useState<MemoryInsight[]>([]);
  const [entities, setEntities] = useState<MemoryEntity[]>([]);
  const [relationships, setRelationships] = useState<MemoryRelationship[]>([]);
  const [columns, setColumns] = useState<MemoryColumn[]>([]);
  const [loadingMemory, setLoadingMemory] = useState(false);
  const [insightFilter, setInsightFilter] = useState<"all" | "emerging" | "validated" | "deprecated">("all");
  const [insightConfidenceFilter, setInsightConfidenceFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [insightQuery, setInsightQuery] = useState("");
  const [selectedInsight, setSelectedInsight] = useState<MemoryInsight | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<MemoryEntity | null>(null);

  const allFiles = useMemo(() => memory.folders.flatMap((f) => f.files), [memory]);

  const filteredFiles = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return allFiles.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.relativePath.toLowerCase().includes(q) ||
        f.content.toLowerCase().includes(q)
    );
  }, [query, allFiles]);

  const findFolderById = (node: FolderNode, id: string): IcmFolder | null => {
    if (node.id === id) return node.folder;
    for (const child of node.children) {
      const found = findFolderById(child, id);
      if (found) return found;
    }
    return null;
  };

  const selectedFolder = findFolderById(folderTree, selectedFolderId) || memory.folders[0];
  const visibleFiles = useMemo(() => {
    let files: IcmFile[] = query.trim() ? filteredFiles || [] : selectedFolder?.files || [];

    if (fileTypeFilter !== "all") {
      files = files.filter((f) => {
        if (fileTypeFilter === "md") return f.extension === ".md";
        if (fileTypeFilter === "json") return f.extension === ".json";
        if (fileTypeFilter === "code") return [".ts", ".tsx", ".js", ".jsx"].includes(f.extension);
        return ![".md", ".json", ".ts", ".tsx", ".js", ".jsx"].includes(f.extension);
      });
    }

    if (fileDateFilter !== "all") {
      const now = Date.now();
      const ms = fileDateFilter === "today" ? 86400000 : fileDateFilter === "week" ? 604800000 : 2592000000;
      files = files.filter((f) => new Date(f.modifiedAt).getTime() >= now - ms);
    }

    return files;
  }, [filteredFiles, selectedFolder, query, fileTypeFilter, fileDateFilter]);
  const selectedFile: IcmFile | null =
    allFiles.find((f) => f.id === selectedFileId) || visibleFiles[0] || null;

  const fetchMemory = async () => {
    setLoadingMemory(true);
    try {
      const [i, e, r, c] = await Promise.all([
        fetch(`${apiBase}/memory?type=insights`).then((r) => r.json()),
        fetch(`${apiBase}/memory?type=entities`).then((r) => r.json()),
        fetch(`${apiBase}/memory?type=relationships`).then((r) => r.json()),
        fetch(`${apiBase}/memory?type=columns`).then((r) => r.json()),
      ]);
      if (i.success) setInsights(i.data);
      if (e.success) setEntities(e.data);
      if (r.success) setRelationships(r.data);
      if (c.success) setColumns(c.data);
    } catch (err) {
      console.error("Failed to fetch memory", err);
    } finally {
      setLoadingMemory(false);
    }
  };

  useEffect(() => {
    if (["insights", "entities", "columns", "trends", "graph"].includes(rightPanel)) {
      fetchMemory();
    }
  }, [rightPanel, refreshTick, apiBase]);

  const updateInsight = async (id: number, updates: Partial<MemoryInsight>) => {
    try {
      const res = await fetch(`${apiBase}/memory`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "insight", id, data: updates }),
      });
      if (res.ok) {
        setRefreshTick((t) => t + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openCreate = () => {
    setEditingFile(null);
    setEditorFilename("nuevo-documento.md");
    setEditorValue("<p>Escribe aquí el contenido del documento...</p>");
    setEditorOpen(true);
  };

  const openEdit = (file: IcmFile) => {
    setEditingFile(file);
    setEditorFilename(file.name);
    setEditorValue(simpleMarkdownToHtml(file.content));
    setEditorOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const rel = editingFile ? editingFile.relativePath : `${selectedFolder.relativePath}/${editorFilename}`;
      const res = await fetch(`${apiBase}/icm`, {
        method: editingFile ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relativePath: rel, content: editorValue, contentType: "html" }),
      });
      const data = await res.json();
      if (data.success) {
        setEditorOpen(false);
        setRefreshTick((t) => t + 1);
        window.location.reload();
      } else {
        alert(data.error || "Error guardando");
      }
    } catch (e) {
      alert("Error de red");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (file: IcmFile) => {
    if (!confirm(`¿Eliminar ${file.relativePath}?`)) return;
    try {
      const res = await fetch(`${apiBase}/icm?path=${encodeURIComponent(file.relativePath)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        alert(data.error || "Error eliminando");
      }
    } catch {
      alert("Error de red");
    }
  };

  const filteredInsights = useMemo(() => {
    let filtered = insights;
    if (insightFilter !== "all") {
      filtered = filtered.filter((i) => i.status === insightFilter);
    }
    if (insightConfidenceFilter !== "all") {
      filtered = filtered.filter((i) => i.confidence === insightConfidenceFilter);
    }
    if (insightQuery.trim()) {
      const q = insightQuery.toLowerCase();
      filtered = filtered.filter((i) => i.title.toLowerCase().includes(q) || i.body.toLowerCase().includes(q));
    }
    return filtered;
  }, [insights, insightFilter, insightConfidenceFilter, insightQuery]);

  const entityRelations = useMemo(() => {
    if (!selectedEntity) return [];
    return relationships.filter(
      (r) => r.from_entity === selectedEntity.name || r.to_entity === selectedEntity.name
    );
  }, [selectedEntity, relationships]);

  const renderRightPanel = () => {
    switch (rightPanel) {
      case "sources":
        return (
          <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="[font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.18em] text-[#8B92B5]">// _config/source-registry.md</p>
                <h3 className="mt-1 [font-family:var(--font-figtree)] text-[18px] font-semibold text-white">Registro de Fuentes</h3>
              </div>
              <span className="shrink-0 rounded-full border border-[#5BE9FF]/30 bg-[#5BE9FF]/8 px-2.5 py-1 [font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.08em] text-[#5BE9FF]">
                {memory.sources.length} fuentes
              </span>
            </div>
            <LabTerminalFrame title="source-registry" className="flex-1">
              <div className="h-full overflow-auto p-4">
                <div className="mb-4 grid grid-cols-3 gap-2 [font-family:var(--font-fira-mono)] text-[10px] text-white/40">
                  <span>Alcance: {memory.sources.filter(s => s.scope === "global").length} global · {memory.sources.filter(s => s.scope === "latam").length} latam</span>
                  <span className="text-center">Última actualización: {formatDate(memory.lastUpdated)}</span>
                </div>
                <div className="space-y-3">
                  {memory.sources.map((s) => (
                    <div key={s.url} className="rounded-lg border border-white/[0.06] bg-[#0A0E27]/60 p-3">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 [font-family:var(--font-fira-mono)] text-[9px] uppercase tracking-[0.08em] ${
                          s.scope === "latam" ? "border-[#F540FF]/30 text-[#F540FF] bg-[#F540FF]/8" : "border-[#5BE9FF]/30 text-[#5BE9FF] bg-[#5BE9FF]/8"
                        }`}>
                          {s.scope}
                        </span>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="[font-family:var(--font-figtree)] text-[13px] font-semibold text-white hover:text-[#F540FF]">
                          {s.name}
                        </a>
                      </div>
                      {s.description && <p className="mt-1 [font-family:var(--font-fira-mono)] text-[11px] text-white/50">{s.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </LabTerminalFrame>
          </div>
        );

      case "insights":
        return (
          <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="[font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.18em] text-[#8B92B5]">// memory/insights</p>
                <h3 className="mt-1 [font-family:var(--font-figtree)] text-[18px] font-semibold text-white">Learning Loop</h3>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={insightQuery}
                  onChange={(e) => setInsightQuery(e.target.value)}
                  placeholder="Buscar insight..."
                  className="w-32 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 [font-family:var(--font-fira-mono)] text-[11px] text-white placeholder-white/30 focus:border-[#F540FF]/40 focus:outline-none"
                />
                <select
                  value={insightFilter}
                  onChange={(e) => setInsightFilter(e.target.value as any)}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 [font-family:var(--font-fira-mono)] text-[11px] text-white focus:border-[#F540FF]/40 focus:outline-none"
                >
                  <option value="all">Todos</option>
                  <option value="emerging">Emerging</option>
                  <option value="validated">Validados</option>
                  <option value="deprecated">Deprecados</option>
                </select>
                <select
                  value={insightConfidenceFilter}
                  onChange={(e) => setInsightConfidenceFilter(e.target.value as any)}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 [font-family:var(--font-fira-mono)] text-[11px] text-white focus:border-[#F540FF]/40 focus:outline-none"
                >
                  <option value="all">Confianza</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button
                  onClick={() => setRefreshTick((t) => t + 1)}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-1.5 text-white/60 hover:text-white"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {loadingMemory ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#F540FF]" />
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
                <div className="w-1/2 overflow-y-auto pr-2">
                  <div className="space-y-2">
                    {filteredInsights.map((insight) => (
                      <button
                        key={insight.id}
                        onClick={() => setSelectedInsight(insight)}
                        className={`w-full rounded-lg border p-3 text-left transition-colors ${
                          selectedInsight?.id === insight.id
                            ? "border-[#F540FF]/40 bg-[#F540FF]/10"
                            : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="[font-family:var(--font-figtree)] text-[13px] font-medium text-white/90 line-clamp-2">
                            {insight.title}
                          </p>
                          <span className={`shrink-0 rounded-full border px-1.5 py-0.5 [font-family:var(--font-fira-mono)] text-[9px] uppercase ${
                            insight.confidence === "high"
                              ? "border-[#00FF88]/30 text-[#00FF88] bg-[#00FF88]/8"
                              : insight.confidence === "medium"
                              ? "border-[#F540FF]/30 text-[#F540FF] bg-[#F540FF]/8"
                              : "border-white/20 text-white/50"
                          }`}>
                            {insight.confidence}
                          </span>
                        </div>
                        <p className="mt-1 [font-family:var(--font-fira-mono)] text-[10px] text-white/40">
                          {formatDate(insight.last_updated)} · {insight.status}
                        </p>
                      </button>
                    ))}
                    {filteredInsights.length === 0 && (
                      <p className="py-8 text-center [font-family:var(--font-fira-mono)] text-[12px] text-white/40">
                        No hay insights en este filtro.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex min-h-0 w-1/2 flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-[#0A0E27]/60">
                  {selectedInsight ? (
                    <>
                      <div className="border-b border-white/[0.06] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="[font-family:var(--font-figtree)] text-[15px] font-semibold text-white">
                            {selectedInsight.title}
                          </h4>
                          <div className="flex gap-1">
                            {selectedInsight.status !== "validated" && (
                              <button
                                onClick={() => updateInsight(selectedInsight.id, { status: "validated" })}
                                className="rounded p-1 text-white/40 hover:bg-[#00FF88]/10 hover:text-[#00FF88]"
                                title="Validar"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}
                            {selectedInsight.status !== "deprecated" && (
                              <button
                                onClick={() => updateInsight(selectedInsight.id, { status: "deprecated" })}
                                className="rounded p-1 text-white/40 hover:bg-white/[0.06] hover:text-white"
                                title="Deprecar"
                              >
                                <XCircle size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <span className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 [font-family:var(--font-fira-mono)] text-[9px] text-white/50">
                            {selectedInsight.status}
                          </span>
                          <span className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 [font-family:var(--font-fira-mono)] text-[9px] text-white/50">
                            {selectedInsight.confidence}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4">
                        <ChatMarkdown text={selectedInsight.body} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-1 items-center justify-center">
                      <p className="[font-family:var(--font-fira-mono)] text-[12px] text-white/40">Seleccioná un insight.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case "trends":
        return (
          <div className="flex h-full flex-col">
            <div className="mb-4">
              <p className="[font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.18em] text-[#8B92B5]">// trends</p>
              <h3 className="mt-1 [font-family:var(--font-figtree)] text-[18px] font-semibold text-white">Tendencias detectadas</h3>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0E27]/60">
              <div className="border-b border-white/[0.06] px-4 py-2 [font-family:var(--font-fira-mono)] text-[10px] text-white/40">trends</div>
              <pre className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap p-4 [font-family:var(--font-fira-mono)] text-[12px] leading-[1.7] text-white/80">
                {memory.entityGraph || "Sin tendencias estructuradas todavía."}
              </pre>
            </div>
          </div>
        );

      case "entities":
        return (
          <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="[font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.18em] text-[#8B92B5]">// memory/entities</p>
                <h3 className="mt-1 [font-family:var(--font-figtree)] text-[18px] font-semibold text-white">Entity Graph</h3>
              </div>
              <button
                onClick={() => setRefreshTick((t) => t + 1)}
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-1.5 text-white/60 hover:text-white"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {loadingMemory ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#5BE9FF]" />
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
                <div className="w-1/3 overflow-y-auto pr-2">
                  <div className="space-y-1.5">
                    {entities.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setSelectedEntity(e)}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                          selectedEntity?.id === e.id
                            ? "border-[#5BE9FF]/40 bg-[#5BE9FF]/10"
                            : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                        }`}
                      >
                        <span className="[font-family:var(--font-figtree)] text-[12px] text-white/90">{e.name}</span>
                        <span className="[font-family:var(--font-fira-mono)] text-[9px] text-white/40 uppercase">{e.type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex min-h-0 w-2/3 flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-[#0A0E27]/60 p-4">
                  {selectedEntity ? (
                    <>
                      <h4 className="[font-family:var(--font-figtree)] text-[16px] font-semibold text-white">{selectedEntity.name}</h4>
                      <p className="mt-1 [font-family:var(--font-fira-mono)] text-[11px] text-white/50">
                        {selectedEntity.type} · relevancia {selectedEntity.relevance}
                      </p>
                      <div className="mt-4 flex-1 overflow-y-auto">
                        <p className="mb-2 [font-family:var(--font-figtree)] text-[12px] font-semibold text-white/70">Relaciones</p>
                        {entityRelations.length > 0 ? (
                          <div className="space-y-2">
                            {entityRelations.map((r) => (
                              <div key={r.id} className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-2.5">
                                <p className="[font-family:var(--font-figtree)] text-[12px] text-white/80">
                                  <span className="text-[#5BE9FF]">{r.from_entity}</span>
                                  <span className="mx-1.5 text-white/30">—{r.relation}→</span>
                                  <span className="text-[#F540FF]">{r.to_entity}</span>
                                </p>
                                {r.context && <p className="mt-1 [font-family:var(--font-fira-mono)] text-[10px] text-white/40">{r.context}</p>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="[font-family:var(--font-fira-mono)] text-[11px] text-white/40">Sin relaciones registradas.</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-1 items-center justify-center">
                      <p className="[font-family:var(--font-fira-mono)] text-[12px] text-white/40">Seleccioná una entidad.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case "columns":
        return (
          <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="[font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.18em] text-[#8B92B5]">// memory/columns</p>
                <h3 className="mt-1 [font-family:var(--font-figtree)] text-[18px] font-semibold text-white">Column Candidates</h3>
              </div>
              <button
                onClick={() => setRefreshTick((t) => t + 1)}
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-1.5 text-white/60 hover:text-white"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {loadingMemory ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#FFD700]" />
              </div>
            ) : (
              <div className="min-h-0 flex-1 grid grid-cols-2 gap-3 overflow-y-auto pr-2">
                {columns.map((c) => (
                  <div key={c.id} className="rounded-xl border border-white/[0.06] bg-[#0A0E27]/60 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="[font-family:var(--font-figtree)] text-[14px] font-semibold text-white/90">{c.title}</h4>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 [font-family:var(--font-fira-mono)] text-[9px] uppercase ${
                        c.status === "ready"
                          ? "border-[#FFD700]/30 text-[#FFD700] bg-[#FFD700]/8"
                          : c.status === "writing"
                          ? "border-[#5BE9FF]/30 text-[#5BE9FF] bg-[#5BE9FF]/8"
                          : "border-white/20 text-white/50"
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    {c.tension && (
                      <p className="mt-2 [font-family:var(--font-figtree)] text-[12px] text-white/60">
                        <span className="text-white/30">Tensión:</span> {c.tension}
                      </p>
                    )}
                    {c.thesis && (
                      <p className="mt-2 [font-family:var(--font-figtree)] text-[12px] text-white/60">
                        <span className="text-white/30">Tesis:</span> {c.thesis}
                      </p>
                    )}
                    {c.lede && (
                      <p className="mt-2 [font-family:var(--font-fira-mono)] text-[11px] italic text-white/40">
                        “{c.lede}”
                      </p>
                    )}
                    <p className="mt-3 [font-family:var(--font-fira-mono)] text-[9px] text-white/30">{formatDate(c.last_updated)}</p>
                  </div>
                ))}
                {columns.length === 0 && (
                  <div className="col-span-2 py-8 text-center">
                    <p className="[font-family:var(--font-fira-mono)] text-[12px] text-white/40">No hay columnas incubando.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "graph": {
        const graphData = useMemo(() => {
          const nodes: { id: string; label: string; group: string; val: number; title?: string }[] = [];
          const links: { source: string; target: string; label?: string }[] = [];

          insights.forEach((i) =>
            nodes.push({
              id: `insight-${i.id}`,
              label: i.title,
              title: i.body.slice(0, 140) + (i.body.length > 140 ? "…" : ""),
              group: "insight",
              val: i.confidence === "high" ? 8 : i.confidence === "medium" ? 6 : 4,
            })
          );
          entities.forEach((e) =>
            nodes.push({
              id: `entity-${e.id}`,
              label: e.name,
              title: `${e.type} · relevancia ${e.relevance}`,
              group: "entity",
              val: e.relevance === "high" ? 10 : e.relevance === "medium" ? 7 : 5,
            })
          );
          columns.forEach((c) =>
            nodes.push({
              id: `column-${c.id}`,
              label: c.title,
              title: c.tension || c.thesis,
              group: "column",
              val: 6,
            })
          );

          relationships.forEach((r) => {
            const fromId = entities.find((e) => e.name.toLowerCase() === r.from_entity.toLowerCase())?.id;
            const toId = entities.find((e) => e.name.toLowerCase() === r.to_entity.toLowerCase())?.id;
            if (fromId && toId) {
              links.push({ source: `entity-${fromId}`, target: `entity-${toId}`, label: r.relation });
            }
          });

          // Weak links: columns → insights that share significant words
          const wordSet = (text: string) =>
            new Set(
              text
                .toLowerCase()
                .split(/\W+/)
                .filter((w) => w.length > 4)
            );
          columns.forEach((c) => {
            const cWords = wordSet(c.title + " " + (c.tension || ""));
            insights.forEach((i) => {
              const iWords = wordSet(i.title + " " + i.body);
              const shared = [...cWords].filter((w) => iWords.has(w));
              if (shared.length >= 2) {
                links.push({ source: `column-${c.id}`, target: `insight-${i.id}` });
              }
            });
          });

          return { nodes, links };
        }, [insights, entities, columns, relationships]);

        return (
          <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="[font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.18em] text-[#8B92B5]">// memory/graph</p>
                <h3 className="mt-1 [font-family:var(--font-figtree)] text-[18px] font-semibold text-white">Knowledge Graph</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 [font-family:var(--font-fira-mono)] text-[10px]">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#F540FF]" /> insights
                  <span className="inline-block h-2 w-2 rounded-full bg-[#5BE9FF]" /> entities
                  <span className="inline-block h-2 w-2 rounded-full bg-[#FFD700]" /> columns
                </div>
                <button
                  onClick={() => setRefreshTick((t) => t + 1)}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-1.5 text-white/60 hover:text-white"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
            {loadingMemory ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#F540FF]" />
              </div>
            ) : graphData.nodes.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="[font-family:var(--font-fira-mono)] text-[12px] text-white/40">No hay nodos en el grafo todavía.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0A0E27]/60">
                <ForceGraph2D
                  graphData={graphData}
                  nodeAutoColorBy="group"
                  nodeLabel="label"
                  linkLabel="label"
                  backgroundColor="rgba(10, 14, 39, 0)"
                  width={800}
                  height={500}
                  nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                    const label = node.label as string;
                    const fontSize = 10 / globalScale;
                    ctx.font = `${fontSize}px sans-serif`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions: [number, number] = [textWidth + fontSize * 1.5, fontSize * 2.2];
                    ctx.fillStyle = "rgba(10, 14, 39, 0.8)";
                    ctx.beginPath();
                    ctx.roundRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions, fontSize / 2);
                    ctx.fill();
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = node.color as string;
                    ctx.fillText(label, node.x, node.y);
                    node.__bckgDimensions = bckgDimensions;
                  }}
                  nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
                    const dims = node.__bckgDimensions as [number, number];
                    if (!dims) return;
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.roundRect(node.x - dims[0] / 2, node.y - dims[1] / 2, ...dims, dims[1] / 4);
                    ctx.fill();
                  }}
                />
              </div>
            )}
          </div>
        );
      }

      default:
        // preview
        return selectedFile ? (
          <div className="flex h-full flex-col">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="[font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.18em] text-[#8B92B5]">
                  // {selectedFile.relativePath}
                </p>
                <h3 className="mt-1 [font-family:var(--font-figtree)] text-[18px] font-semibold text-white truncate">
                  {selectedFile.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`shrink-0 rounded-full border px-2.5 py-1 [font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.08em] ${fileBadge(selectedFile.extension).color}`}>
                  {fileBadge(selectedFile.extension).label}
                </span>
                <button
                  onClick={() => openEdit(selectedFile)}
                  className="flex h-8 items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-white/70 hover:border-[#F540FF]/40 hover:text-[#F540FF]"
                >
                  <Pencil size={14} />
                  <span className="[font-family:var(--font-figtree)] text-[12px] font-semibold">Editar</span>
                </button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0E27]/60">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2 [font-family:var(--font-fira-mono)] text-[10px] text-white/40">
                <span>memory://{selectedFile.relativePath}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 px-4 py-2">
                <span className="inline-flex items-center gap-1 [font-family:var(--font-fira-mono)] text-[11px] text-white/40">
                  <Clock size={12} />
                  {formatDate(selectedFile.modifiedAt)}
                </span>
                <span className="inline-flex items-center gap-1 [font-family:var(--font-fira-mono)] text-[11px] text-white/40">
                  <Tag size={12} />
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <pre className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap p-4 [font-family:var(--font-fira-mono)] text-[12px] leading-[1.7] text-white/80">
                {selectedFile.content}
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Folder size={40} className="text-white/10" />
            <p className="mt-4 [font-family:var(--font-fira-mono)] text-[13px] text-white/40">Seleccioná un archivo para previsualizar.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full w-full min-h-0 overflow-hidden bg-[#050714]">
      {/* Folder list */}
      <div className="hidden h-full min-h-0 w-60 flex-col border-r border-white/[0.08] bg-[#0A0E27]/60 md:flex">
        <div className="p-4">
          <LabSectionLabel index="03" name="Archives" />
          <p className="mt-2 [font-family:var(--font-fira-mono)] text-[10px] text-white/40">
            {memory.totalFiles} archivos · {(memory.totalBytes / 1024).toFixed(1)} KB
          </p>
        </div>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-4">
          <FolderTreeItem
            node={folderTree}
            depth={0}
            selectedFolderId={selectedFolderId}
            expandedFolders={expandedFolders}
            onToggle={(id) => {
              setExpandedFolders((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              });
            }}
            onSelect={(id) => {
              setSelectedFolderId(id);
              setSelectedFileId(null);
              setQuery("");
            }}
          />
        </div>
      </div>

      {/* File list */}
      <div className="flex h-full min-h-0 w-full min-w-0 flex-col border-r border-white/[0.08] bg-[#0A0E27]/40 md:w-72">
        <div className="border-b border-white/[0.08] p-3">
          <div className="mb-2 flex items-center gap-1 overflow-hidden [font-family:var(--font-fira-mono)] text-[10px] text-white/40">
            {selectedFolder?.relativePath
              ? selectedFolder.relativePath.split("/").map((part, i, arr) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className={i === arr.length - 1 ? "text-white/70" : ""}>{part}</span>
                    {i < arr.length - 1 && <span className="text-white/20">/</span>}
                  </span>
                ))
              : <span className="text-white/70">Archivo raíz</span>}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar archivo o contenido..."
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-2 pl-8 pr-3 [font-family:var(--font-fira-mono)] text-[12px] text-white placeholder-white/30 focus:border-[#F540FF]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F540FF]/30"
              />
            </div>
            <button
              onClick={openCreate}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#F540FF]/30 bg-[#F540FF]/10 text-[#F540FF] hover:bg-[#F540FF]/20"
              title="Nuevo documento"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value as any)}
              className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 [font-family:var(--font-fira-mono)] text-[10px] text-white focus:border-[#F540FF]/40 focus:outline-none"
            >
              <option value="all">Todos los tipos</option>
              <option value="md">Markdown</option>
              <option value="json">JSON</option>
              <option value="code">Código</option>
              <option value="other">Otros</option>
            </select>
            <select
              value={fileDateFilter}
              onChange={(e) => setFileDateFilter(e.target.value as any)}
              className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 [font-family:var(--font-fira-mono)] text-[10px] text-white focus:border-[#F540FF]/40 focus:outline-none"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
            </select>
            <span className="ml-auto [font-family:var(--font-fira-mono)] text-[10px] text-white/40">
              {visibleFiles.length} resultado{visibleFiles.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
          <AnimatePresence mode="popLayout">
            {visibleFiles.map((file) => {
              const badge = fileBadge(file.extension);
              return (
                <motion.button
                  key={`${file.id}-${refreshTick}`}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  onClick={() => {
                    setSelectedFileId(file.id);
                    setRightPanel("preview");
                  }}
                  className={`group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F540FF]/60 ${
                    selectedFile?.id === file.id
                      ? "bg-[#141A36] text-white"
                      : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <FileText size={16} className="mt-0.5 shrink-0 text-white/40" />
                  <div className="min-w-0 flex-1">
                    <p className="[font-family:var(--font-fira-mono)] text-[12px] truncate">{file.name}</p>
                    <p className="[font-family:var(--font-fira-mono)] text-[10px] text-white/40">{formatDate(file.modifiedAt)} · {(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <div className="hidden items-center gap-1 group-hover:flex">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(file); }}
                      className="rounded p-1 text-white/50 hover:bg-white/[0.06] hover:text-[#F540FF]"
                      title="Editar"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                      className="rounded p-1 text-white/50 hover:bg-white/[0.06] hover:text-[#ef4444]"
                      title="Eliminar"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <ChevronRight size={14} className="mt-0.5 shrink-0 text-white/20 group-hover:hidden" />
                </motion.button>
              );
            })}
          </AnimatePresence>
          {visibleFiles.length === 0 && (
            <div className="px-3 py-8 text-center">
              <p className="[font-family:var(--font-fira-mono)] text-[12px] text-white/40">Sin archivos.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right panel with tabs */}
      <div className="hidden flex-1 flex-col bg-[#0A0E27]/20 lg:flex">
        {/* Tabs */}
        <div className="flex items-center border-b border-white/[0.08] px-4 pt-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setRightPanel(tab.id)}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-2 [font-family:var(--font-figtree)] text-[12px] font-semibold transition-colors ${
                  rightPanel === tab.id
                    ? "border-[#F540FF] text-white"
                    : "border-transparent text-white/40 hover:text-white/70"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-5">
          {renderRightPanel()}
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {editorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setEditorOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.98, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0E27] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="[font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.18em] text-[#8B92B5]">
                    {editingFile ? "Editar documento" : "Nuevo documento"}
                  </p>
                  <input
                    value={editorFilename}
                    onChange={(e) => setEditorFilename(e.target.value)}
                    disabled={!!editingFile}
                    className="mt-1 w-full bg-transparent [font-family:var(--font-figtree)] text-[16px] font-semibold text-white focus:outline-none disabled:opacity-60"
                  />
                </div>
                <button onClick={() => setEditorOpen(false)} className="rounded-lg p-2 text-white/50 hover:bg-white/[0.06] hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-white p-4">
                <RichTextEditor value={editorValue} onChange={setEditorValue} placeholder="Escribí el contenido en Markdown..." />
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-3">
                <p className="[font-family:var(--font-fira-mono)] text-[10px] text-white/40">
                  Se guarda como Markdown en el ICM de Shifter.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditorOpen(false)}
                    className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2 [font-family:var(--font-figtree)] text-[12px] font-semibold text-white hover:bg-white/[0.06]"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !editorFilename.trim()}
                    className="flex items-center gap-2 rounded-lg bg-[#F540FF] px-4 py-2 [font-family:var(--font-figtree)] text-[12px] font-semibold text-white hover:bg-[#ff5fff] disabled:opacity-50"
                  >
                    <Save size={14} />
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
