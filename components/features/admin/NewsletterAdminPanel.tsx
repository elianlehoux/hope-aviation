"use client";

import * as React from "react";
import { useTranslation } from "@/lib/i18n/context";
import { toast } from "sonner";
import { 
  Loader2, 
  Mail, 
  Users, 
  Percent, 
  Send, 
  Paperclip, 
  X, 
  Upload,
  AlertCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/modal";

interface Stats {
  subscribers: number;
  totalUsers: number;
  subscriptionRate: number;
}

export function NewsletterAdminPanel() {
  const { t } = useTranslation();
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

  // Form states
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchStats = React.useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch("/api/admin/newsletter");
      if (!res.ok) throw new Error("Failed to load newsletter stats");
      const json = await res.json();
      setStats(json.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error loading stats");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast.error(t("newsletter.attachmentHint"));
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error(t("newsletter.attachmentHint"));
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTriggerSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error(t("newsletter.validationError"));
      return;
    }
    if (!stats || stats.subscribers === 0) {
      toast.error(t("newsletter.noSubscribers"));
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmSend = async () => {
    setIsConfirmOpen(false);
    setSending(true);

    try {
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("message", message);
      if (file) {
        formData.append("file", file);
      }

      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || t("newsletter.sendError"));
      }

      toast.success(t("newsletter.sendSuccess").replace("{count}", String(json.data.recipientCount)));
      
      // Reset form
      setSubject("");
      setMessage("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Refresh stats
      fetchStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("newsletter.sendError"));
    } finally {
      setSending(false);
    }
  };

  // Helper to format file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = 2;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="space-y-10 max-w-5xl pb-20">
      {/* Header */}
      <div>
        <Title level="h1" className="tracking-tight font-extrabold text-primary">
          {t("newsletter.title")}
        </Title>
        <p className="text-slate-500 mt-2 text-base font-medium">
          {t("newsletter.subtitle")}
        </p>
      </div>

      {/* Metrics Dashboard */}
      {loadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-8 border-slate-100/80 bg-white/50 backdrop-blur-md animate-pulse h-32 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-8 border-slate-100/80 bg-white/70 backdrop-blur-xl shadow-xs hover:shadow-md transition-all duration-300 rounded-3xl flex items-center justify-between group">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t("newsletter.totalSubscribers")}</p>
              <h3 className="text-3xl font-extrabold text-primary tracking-tight transition-transform duration-300 group-hover:translate-x-1">
                {stats?.subscribers ?? 0}
              </h3>
            </div>
            <div className="p-4 bg-accent/5 rounded-2xl text-accent border border-accent/10">
              <Mail className="size-6" />
            </div>
          </Card>

          <Card className="p-8 border-slate-100/80 bg-white/70 backdrop-blur-xl shadow-xs hover:shadow-md transition-all duration-300 rounded-3xl flex items-center justify-between group">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t("newsletter.totalUsers")}</p>
              <h3 className="text-3xl font-extrabold text-primary tracking-tight transition-transform duration-300 group-hover:translate-x-1">
                {stats?.totalUsers ?? 0}
              </h3>
            </div>
            <div className="p-4 bg-slate-100/80 rounded-2xl text-slate-500 border border-slate-200/50">
              <Users className="size-6" />
            </div>
          </Card>

          <Card className="p-8 border-slate-100/80 bg-white/70 backdrop-blur-xl shadow-xs hover:shadow-md transition-all duration-300 rounded-3xl flex items-center justify-between group">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t("newsletter.subRate")}</p>
              <h3 className="text-3xl font-extrabold text-primary tracking-tight transition-transform duration-300 group-hover:translate-x-1">
                {stats?.subscriptionRate ?? 0}%
              </h3>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl text-amber-500 border border-amber-100">
              <Percent className="size-6" />
            </div>
          </Card>
        </div>
      )}

      {/* Compose Newsletter Form */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pl-1">
          <Mail className="size-5 text-primary opacity-70" />
          <h3 className="text-base font-bold uppercase tracking-wider text-slate-500">{t("newsletter.composeTitle")}</h3>
        </div>

        <Card className="p-8 md:p-12 bg-white border-slate-100/80 shadow-xs rounded-3xl">
          <form onSubmit={handleTriggerSend} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-semibold text-slate-600 pl-1">
                {t("newsletter.subjectLabel")}
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("newsletter.subjectPlaceholder")}
                className="rounded-xl border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all h-12 text-base font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-semibold text-slate-600 pl-1">
                {t("newsletter.messageLabel")}
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("newsletter.messagePlaceholder")}
                className="min-h-[250px] rounded-2xl border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all p-6 text-base leading-relaxed font-medium"
                required
              />
            </div>

            {/* File Upload Zone */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-600 pl-1">
                {t("newsletter.attachmentLabel")}
              </Label>
              
              {!file ? (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3
                    ${dragActive 
                      ? "border-primary bg-primary/5 scale-[0.99]" 
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
                    }
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.zip,.png,.jpg,.jpeg"
                  />
                  <div className="p-4 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-400 group-hover:scale-110 transition-transform">
                    <Upload className="size-6 text-slate-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-700">
                      {t("newsletter.dragDropText")}
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      {t("newsletter.attachmentHint")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-xl text-primary">
                      <Paperclip className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
                      <p className="text-xs text-slate-400 font-semibold">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={sending}
                className="rounded-2xl px-10 py-7 h-auto text-base font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary text-white"
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2.5 h-5 w-5 animate-spin" />
                    {t("newsletter.sending")}
                  </>
                ) : (
                  <>
                    <Send className="mr-2.5 h-5 w-5" />
                    {t("newsletter.sendButton")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </section>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-primary font-extrabold text-2xl tracking-tight">
              <AlertCircle className="size-6 text-amber-500 shrink-0" />
              {t("newsletter.confirmTitle")}
            </DialogTitle>
            <DialogDescription className="text-base text-slate-500 font-semibold leading-relaxed pt-2">
              {t("newsletter.confirmMessage").replace("{count}", String(stats?.subscribers ?? 0))}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              className="rounded-xl px-5 h-12 text-sm font-semibold border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              onClick={handleConfirmSend}
              className="rounded-xl px-6 h-12 text-sm font-bold bg-primary text-white hover:scale-102 active:scale-98"
            >
              {t("common.confirm") || "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
