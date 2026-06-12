"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, FileText, ChevronRight, ChevronDown } from "lucide-react";

const mockFolders = [
  {
    id: "f1",
    name: "01_Core_Identity",
    files: [
      { id: "doc1", name: "base-persona.md", date: "2026-06-09" },
      { id: "doc2", name: "awakening-log.json", date: "2026-06-09" }
    ]
  },
  {
    id: "f2",
    name: "02_Industry_Insights",
    files: [
      { id: "doc3", name: "eu-ai-act-analysis.md", date: "2026-06-09" },
      { id: "doc4", name: "traditional-agencies-decline.md", date: "2026-06-09" }
    ]
  },
  {
    id: "f3",
    name: "03_Drafts",
    files: []
  }
];

export default function MemoryFolders() {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ f1: true, f2: true });

  const toggleFolder = (id: string) => {
    setOpenFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="h-full w-full bg-[#050814] p-8 md:p-16 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-glitz text-4xl text-white/90 mb-2">ARCHIVES</h2>
        <p className="font-mono text-sm text-white/50 mb-12">
          Structured Episedic & Semantic Memory
        </p>

        <div className="space-y-4">
          {mockFolders.map(folder => (
            <div key={folder.id} className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]">
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
                <span className="font-sans font-medium text-white/90">{folder.name}</span>
                <span className="ml-auto font-mono text-xs text-white/30">{folder.files.length} items</span>
              </button>

              <AnimatePresence>
                {openFolders[folder.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-12 pb-4 space-y-2">
                      {folder.files.length === 0 ? (
                        <p className="text-white/30 text-sm font-mono py-2">Empty folder</p>
                      ) : (
                        folder.files.map(file => (
                          <div key={file.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors">
                            <FileText className="w-4 h-4 text-green-400/70" />
                            <span className="font-mono text-sm text-white/70 group-hover:text-green-400 transition-colors">
                              {file.name}
                            </span>
                            <span className="ml-auto font-mono text-xs text-white/30">{file.date}</span>
                          </div>
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
    </div>
  );
}
