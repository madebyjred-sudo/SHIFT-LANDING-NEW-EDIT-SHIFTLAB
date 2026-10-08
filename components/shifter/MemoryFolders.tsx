"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, FileText, ChevronRight, ChevronDown, X, Loader2 } from "lucide-react";

type FileEntry = { name: string; relPath: string; size: number; mtime: string };
type FolderEntry = { id: string; label: string; files: FileEntry[] };

export default function MemoryFolders() {
  const [folders, setFolders] = useState<FolderEntry[]>([]);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  // Viewer de archivo
  const [viewing, setViewing] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [loadingFile, setLoadingFile] = useState(false);

  useEffect(() => {
    fetch("/api/shifter/archives", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { live: boolean; folders: FolderEntry[] }) => {
        setFolders(j.folders ?? []);
        setLive(j.live);
        // abrir las 2 primeras con contenido
        const open: Record<string, boolean> = {};
        (j.folders ?? []).slice(0, 2).forEach((f) => {
          if (f.files.length) open[f.id] = true;
        });
        setOpenFolders(open);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleFolder = (id: string) =>
    setOpenFolders((p) => ({ ...p, [id]: !p[id] }));

  const openFile = async (relPath: string) => {
    setViewing(relPath);
    setLoadingFile(true);
    setContent("");
    try {
      const r = await fetch(`/api/shifter/archives?file=${encodeURIComponent(relPath)}`, {
        cache: "no-store",
      });
      const j = (await r.json()) as { ok: boolean; content?: string };
      setContent(j.ok ? j.content ?? "" : "No se pudo leer el archivo.");
    } catch {
      setContent("Error de red.");
    } finally {
      setLoadingFile(false);
    }
  };

  return (
    <div className="h-full w-full bg-[#050814] p-8 md:p-16 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-glitz text-4xl text-white/90 mb-2">ARCHIVES</h2>
        <p className="font-mono text-sm text-white/50 mb-12 flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${live ? "bg-green-500" : "bg-yellow-500"}`}
          />
          {loading
            ? "Cargando memoria del agente…"
            : live
              ? "File-based memory · git-versionado"
              : "Sin datos en vivo (dev / agente dormido)"}
        </p>

        <div className="space-y-4">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]"
            >
              <button
                onClick={() => toggleFolder(folder.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
              >
                {openFolders[folder.id] ? (
                  <ChevronDown className="w-5 h-5 text-white/40" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-white/40" />
                )}
                <Folder className="w-5 h-5 text-blue-400" />
                <span className="font-mono font-medium text-white/90">{folder.label}</span>
                <span className="ml-auto font-mono text-xs text-white/30">
                  {folder.files.length} items
                </span>
              </button>

              <AnimatePresence>
                {openFolders[folder.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-12 pb-4 space-y-1">
                      {folder.files.length === 0 ? (
                        <p className="text-white/30 text-sm font-mono py-2">Carpeta vacía</p>
                      ) : (
                        folder.files.map((file) => (
                          <button
                            key={file.relPath}
                            onClick={() => openFile(file.relPath)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors text-left"
                          >
                            <FileText className="w-4 h-4 text-green-400/70 shrink-0" />
                            <span className="font-mono text-sm text-white/70 group-hover:text-green-400 transition-colors truncate">
                              {file.name}
                            </span>
                            <span className="ml-auto font-mono text-[10px] text-white/30 shrink-0">
                              {new Date(file.mtime).toLocaleDateString("es", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Viewer modal */}
      <AnimatePresence>
        {viewing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 md:p-12"
            onClick={() => setViewing(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-full w-full max-w-3xl flex-col rounded-2xl border border-white/15 bg-[#0A0E27] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <span className="font-mono text-sm text-green-400 truncate">{viewing}</span>
                <button
                  onClick={() => setViewing(null)}
                  className="rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="overflow-y-auto p-5">
                {loadingFile ? (
                  <div className="flex items-center gap-2 text-white/50 font-mono text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" /> Leyendo…
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap break-words font-mono text-[12.5px] leading-relaxed text-white/80">
                    {content}
                  </pre>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
