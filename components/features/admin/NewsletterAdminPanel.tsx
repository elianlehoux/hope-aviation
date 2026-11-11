"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Paperclip, Send, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { CampusPageHeader } from "@/components/features/campus/ui/page-header";
import { CampusSurface } from "@/components/features/campus/ui/surface";
import { Field, fieldControl } from "@/components/features/campus/ui/field";
import { ConfirmDialog } from "@/components/features/campus/ui/confirm-dialog";

interface Stats {
  subscribers: number;
  totalUsers: number;
  subscriptionRate: number;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function StatTile({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <CampusSurface className="px-5 py-4">
      <p className="text-sm font-medium text-primary/65">{label}</p>
      {loading ? (
        <div className="mt-2 h-8 w-16 animate-pulse rounded-md bg-primary/10" aria-hidden />
      ) : (
        <p className="mt-1 font-display text-3xl font-semibold tabular-nums tracking-tight text-primary">{value}</p>
      )}
    </CampusSurface>
  );
}

/** Admin newsletter: subscriber stats and a compose form that emails every active subscriber. */
export function NewsletterAdminPanel() {
  const { lang } = useTranslation();
  const es = lang === "es";

  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const tooBig = es ? "El archivo supera los 10 MB." : "The file is larger than 10 MB.";

  const fetchStats = React.useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch("/api/admin/newsletter");
      if (!res.ok) throw new Error(es ? "No pudimos cargar las métricas." : "Could not load newsletter stats.");
      const json = await res.json();
      setStats(json.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoadingStats(false);
    }
  }, [es]);

  React.useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > MAX_FILE_BYTES) {
      toast.error(tooBig);
      return;
    }
    setFile(f);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTriggerSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error(es ? "Completá el asunto y el mensaje." : "Fill in the subject and message.");
      return;
    }
    if (!stats || stats.subscribers === 0) {
      toast.error(es ? "No hay suscriptores activos para enviar." : "There are no active subscribers to send to.");
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmSend = async () => {
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("message", message);
      if (file) formData.append("file", file);

      const res = await fetch("/api/admin/newsletter/send", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || (es ? "No pudimos enviar el boletín." : "Failed to send newsletter."));
      }

      const count = String(json.data.recipientCount);
      toast.success(es ? `Boletín enviado a ${count} suscriptores.` : `Newsletter sent to ${count} subscribers.`);
      setSubject("");
      setMessage("");
      removeFile();
      void fetchStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : es ? "No pudimos enviar el boletín." : "Failed to send newsletter.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      <CampusPageHeader
        title={es ? "Boletín" : "Newsletter"}
        description={
          es
            ? "Mirá cuántas personas lo reciben y mandales novedades por email."
            : "See who receives it and send them updates by email."
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label={es ? "Suscriptores" : "Subscribers"} value={String(stats?.subscribers ?? 0)} loading={loadingStats} />
        <StatTile label={es ? "Usuarios del campus" : "Campus users"} value={String(stats?.totalUsers ?? 0)} loading={loadingStats} />
        <StatTile label={es ? "Tasa de suscripción" : "Subscription rate"} value={`${stats?.subscriptionRate ?? 0}%`} loading={loadingStats} />
      </div>

      <CampusSurface className="p-5 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-primary">{es ? "Nuevo envío" : "New send-out"}</h2>
        <p className="mt-1 text-sm text-primary/65">
          {es ? "Llega a todas las personas suscriptas al boletín." : "Goes to everyone subscribed to the newsletter."}
        </p>

        <form onSubmit={handleTriggerSend} className="mt-6 space-y-5">
          <Field label={es ? "Asunto" : "Subject"} htmlFor="nl-subject">
            <input
              id="nl-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={es ? "Ej.: Novedades de noviembre" : "E.g. November updates"}
              className={fieldControl}
              required
            />
          </Field>

          <Field label={es ? "Mensaje" : "Message"} htmlFor="nl-message">
            <textarea
              id="nl-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={es ? "Escribí el mensaje acá…" : "Write your message here…"}
              className={cn(fieldControl, "min-h-[220px] resize-y leading-relaxed")}
              required
            />
          </Field>

          <Field
            label={es ? "Adjunto (opcional)" : "Attachment (optional)"}
            htmlFor="nl-file"
            hint={es ? "PDF, ZIP o imagen, hasta 10 MB." : "PDF, ZIP or image, up to 10 MB."}
          >
            <input
              ref={fileInputRef}
              id="nl-file"
              type="file"
              className="sr-only"
              onChange={(e) => pickFile(e.target.files?.[0])}
              accept=".pdf,.zip,.png,.jpg,.jpeg"
            />
            {!file ? (
              <label
                htmlFor="nl-file"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
                  dragActive ? "border-accent bg-accent/5" : "border-primary/15 bg-paper/50 hover:border-primary/25 hover:bg-paper",
                )}
              >
                <Upload className="size-5 text-primary/65" aria-hidden />
                <span className="text-sm font-semibold text-primary/80">
                  {es ? "Arrastrá un archivo o hacé clic para elegirlo" : "Drag a file here or click to choose one"}
                </span>
              </label>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/10 bg-paper/60 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Paperclip className="size-4 shrink-0 text-primary/65" aria-hidden />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-primary">{file.name}</p>
                    <p className="text-xs text-primary/65">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon-sm" onClick={removeFile} aria-label={es ? "Quitar adjunto" : "Remove attachment"}>
                  <X aria-hidden />
                </Button>
              </div>
            )}
          </Field>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="lg" disabled={sending}>
              {sending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send aria-hidden />}
              {sending ? (es ? "Enviando…" : "Sending…") : es ? "Enviar boletín" : "Send newsletter"}
            </Button>
          </div>
        </form>
      </CampusSurface>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={es ? "¿Enviar el boletín?" : "Send the newsletter?"}
        description={
          es
            ? `Le llega a ${stats?.subscribers ?? 0} suscriptores. Una vez enviado no se puede deshacer.`
            : `It goes to ${stats?.subscribers ?? 0} subscribers. Once sent, it can't be undone.`
        }
        confirmLabel={es ? "Enviar" : "Send"}
        onConfirm={handleConfirmSend}
      />
    </div>
  );
}
