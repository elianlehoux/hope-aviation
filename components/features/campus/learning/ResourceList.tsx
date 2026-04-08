"use client";

import { FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResourceListProps {
  resourceUrl?: string | null;
}

export function ResourceList({ resourceUrl }: ResourceListProps) {
  if (!resourceUrl) {
    return (
      <div className="p-8 text-center rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50">
        <p className="text-slate-400 font-medium italic text-sm">No additional resources for this class.</p>
      </div>
    );
  }

  // Extract filename or use default
  const filename = resourceUrl.split("/").pop() || "class-resource";
  const isPdf = filename.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold text-primary tracking-tight">Class Files</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">1 Item</span>
      </div>

      <div 
        className="group flex items-center justify-between p-4 rounded-[1.5rem] bg-white border border-slate-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
            <FileText className="size-6" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-700 truncate group-hover:text-primary transition-colors">
              {filename}
            </h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {isPdf ? "PDF Document" : "Downloadable Resource"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Button 
            variant="ghost" 
            size="icon" 
            asChild
            className="size-10 rounded-xl hover:bg-slate-50 hover:text-primary transition-all active:scale-95"
           >
             <a href={resourceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
             </a>
           </Button>
           
           <Button 
            variant="ghost" 
            size="icon" 
            asChild
            className="size-10 rounded-xl bg-slate-50 hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
           >
             <a href={resourceUrl} download={filename}>
                <Download className="size-4" />
             </a>
           </Button>
        </div>
      </div>
    </div>
  );
}
