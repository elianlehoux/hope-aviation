"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Calendar,
  LayoutList,
  Video,
  FileText,
  Clock,
  ArrowLeft,
  ChevronRight,
  GripVertical
} from "lucide-react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";

import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Modal,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/shared/modal";

import type { Course, Subject, Class, TranslatedText, CourseStatus } from "@/types/database";

// Define the shape that the `/tree` endpoint returns
type SubjectWithClasses = Subject & { classes: Class[] };
type CourseTree = {
  course: Course;
  subjects: SubjectWithClasses[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getLocalizedText(text: TranslatedText | null, primaryLocale: "es" | "en" = "es"): string {
  if (!text) return "—";
  const fallbackLocale = primaryLocale === "es" ? "en" : "es";
  return text[primaryLocale] || text[fallbackLocale] || "—";
}

function StatusBadge({ status }: { status: CourseStatus }) {
  switch (status) {
    case "published":
      return <Badge variant="default">Publicado</Badge>;
    case "draft":
      return <Badge variant="secondary">Borrador</Badge>;
    case "archived":
      return <Badge variant="outline" className="text-slate-500 border-slate-200">Archivado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchCourseTree(courseId: string): Promise<CourseTree> {
  const res = await fetch(`/api/courses/${courseId}/tree`);
  if (!res.ok) throw new Error("Error loading course tree");
  const json = await res.json();
  return {
    course: json.data.course,
    subjects: json.data.subjects,
  };
}

// Subjects API
async function createSubject(courseId: string, payload: any): Promise<Subject> {
  const res = await fetch(`/api/courses/${courseId}/subjects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error creating subject");
  return (await res.json()).data.subject;
}

async function updateSubject(courseId: string, subjectId: string, payload: any): Promise<Subject> {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error updating subject");
  return (await res.json()).data.subject;
}

async function deleteSubject(courseId: string, subjectId: string): Promise<void> {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) throw new Error("Error deleting subject");
}

// Classes API
async function createClass(courseId: string, subjectId: string, payload: any): Promise<Class> {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/classes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error creating class");
  return (await res.json()).data.class;
}

async function updateClass(courseId: string, subjectId: string, classId: string, payload: any): Promise<Class> {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/classes/${classId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error updating class");
  return (await res.json()).data.class;
}

async function deleteClass(courseId: string, subjectId: string, classId: string): Promise<void> {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/classes/${classId}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) throw new Error("Error deleting class");
}

// Reorder API
async function reorderSubjects(courseId: string, orderedSubjectIds: string[]): Promise<void> {
  const res = await fetch(`/api/courses/${courseId}/subjects/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderedSubjectIds }),
  });
  if (!res.ok) throw new Error("Error guardando el nuevo orden de módulos");
}

async function reorderClasses(courseId: string, subjectId: string, orderedClassIds: string[]): Promise<void> {
  const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/classes/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderedClassIds }),
  });
  if (!res.ok) throw new Error("Error guardando el nuevo orden de clases");
}


// ─── Subject Form Modal ───────────────────────────────────────────────────────

interface SubjectFormProps {
  courseId: string;
  subject?: Subject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function SubjectFormModal({ courseId, subject, open, onOpenChange, onSaved }: SubjectFormProps) {
  const isEdit = !!subject;

  const [titleEs, setTitleEs] = React.useState("");
  const [titleEn, setTitleEn] = React.useState("");
  const [descEs, setDescEs] = React.useState("");
  const [descEn, setDescEn] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTitleEs(subject?.title?.es ?? "");
      setTitleEn(subject?.title?.en ?? "");
      setDescEs(subject?.description?.es ?? "");
      setDescEn(subject?.description?.en ?? "");
    }
  }, [subject, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titleEs.trim() && !titleEn.trim()) {
      toast.error("El módulo debe tener un título (ES o EN).");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: {
          ...(titleEs.trim() ? { es: titleEs.trim() } : {}),
          ...(titleEn.trim() ? { en: titleEn.trim() } : {}),
        },
        description: {
          ...(descEs.trim() ? { es: descEs.trim() } : {}),
          ...(descEn.trim() ? { en: descEn.trim() } : {}),
        },
      };

      if (isEdit && subject) {
        await updateSubject(courseId, subject.id, payload);
        toast.success("Módulo actualizado correctamente.");
      } else {
        await createSubject(courseId, payload);
        toast.success("Módulo creado correctamente.");
      }
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Ha ocurrido un error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Módulo" : "Nuevo Módulo"}</DialogTitle>
          <DialogDescription>
             Este módulo agrupará un listado de clases.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sub-title-es">Título (ES) <span className="text-red-500">*</span></Label>
              <Input
                id="sub-title-es"
                placeholder="Ej. Introducción"
                value={titleEs}
                onChange={(e) => setTitleEs(e.target.value)}
                required={!titleEn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-title-en">Título (EN)</Label>
              <Input
                id="sub-title-en"
                placeholder="e.g. Introduction"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                required={!titleEs}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sub-desc-es">Descripción (ES)</Label>
              <Textarea
                id="sub-desc-es"
                placeholder="Descripción en español..."
                value={descEs}
                onChange={(e) => setDescEs(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-desc-en">Descripción (EN)</Label>
              <Textarea
                id="sub-desc-en"
                placeholder="Description in English..."
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Guardar Cambios" : "Crear Módulo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


// ─── Class Form Modal ─────────────────────────────────────────────────────────

interface ClassFormProps {
  courseId: string;
  subjectId: string | null;
  cls?: Class | null; // using cls since class is a reserved word
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function ClassFormModal({ courseId, subjectId, cls, open, onOpenChange, onSaved }: ClassFormProps) {
  const isEdit = !!cls;

  const [titleEs, setTitleEs] = React.useState("");
  const [titleEn, setTitleEn] = React.useState("");
  const [descEs, setDescEs] = React.useState("");
  const [descEn, setDescEn] = React.useState("");
  const [videoUrl, setVideoUrl] = React.useState("");
  const [resourceUrl, setResourceUrl] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTitleEs(cls?.title?.es ?? "");
      setTitleEn(cls?.title?.en ?? "");
      setDescEs(cls?.description?.es ?? "");
      setDescEn(cls?.description?.en ?? "");
      setVideoUrl(cls?.video_url ?? "");
      setResourceUrl(cls?.resource_url ?? "");
      setDuration(cls?.duration_minutes?.toString() ?? "");
    }
  }, [cls, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titleEs.trim() && !titleEn.trim()) {
      toast.error("La clase debe tener un título (ES o EN).");
      return;
    }
    
    // Fallback to ensuring subjectId is present (it shouldn't be null but typescript)
    if (!subjectId && !cls?.subject_id) {
       toast.error("Referencia al módulo perdida.");
       return;
    }

    const tSubjectId = subjectId || cls!.subject_id;

    setSaving(true);
    try {
      const payload = {
        title: {
          ...(titleEs.trim() ? { es: titleEs.trim() } : {}),
          ...(titleEn.trim() ? { en: titleEn.trim() } : {}),
        },
        description: {
          ...(descEs.trim() ? { es: descEs.trim() } : {}),
          ...(descEn.trim() ? { en: descEn.trim() } : {}),
        },
        video_url: videoUrl.trim() || null,
        resource_url: resourceUrl.trim() || null,
        duration_minutes: duration !== "" ? parseInt(duration, 10) : null,
      };

      if (isEdit && cls) {
        await updateClass(courseId, tSubjectId, cls.id, payload);
        toast.success("Clase actualizada correctamente.");
      } else {
        await createClass(courseId, tSubjectId, payload);
        toast.success("Clase creada correctamente.");
      }
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Ha ocurrido un error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Clase" : "Nueva Clase"}</DialogTitle>
          <DialogDescription>
             Define la lección, videos enlazados y archivos a descargar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cls-title-es">Título (ES) <span className="text-red-500">*</span></Label>
              <Input
                id="cls-title-es"
                placeholder="Ej. Conceptos Básicos"
                value={titleEs}
                onChange={(e) => setTitleEs(e.target.value)}
                required={!titleEn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cls-title-en">Título (EN)</Label>
              <Input
                id="cls-title-en"
                placeholder="e.g. Core Concepts"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                required={!titleEs}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cls-desc-es">Descripción (ES)</Label>
              <Textarea
                id="cls-desc-es"
                placeholder="Descripción en español..."
                value={descEs}
                onChange={(e) => setDescEs(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cls-desc-en">Descripción (EN)</Label>
              <Textarea
                id="cls-desc-en"
                placeholder="Description in English..."
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="cls-video">Video URL (Opcional)</Label>
               <Input
                 id="cls-video"
                 type="url"
                 placeholder="Enlace a Vimeo o YouTube"
                 value={videoUrl}
                 onChange={(e) => setVideoUrl(e.target.value)}
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="cls-resource">Recurso URL (Opcional)</Label>
               <Input
                 id="cls-resource"
                 type="url"
                 placeholder="PDF o Material de apoyo"
                 value={resourceUrl}
                 onChange={(e) => setResourceUrl(e.target.value)}
               />
             </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
             <div className="space-y-2">
               <Label htmlFor="cls-duration">Duración Minutos (Opcional)</Label>
               <Input
                 id="cls-duration"
                 type="number"
                 placeholder="e.g. 45"
                 value={duration}
                 onChange={(e) => setDuration(e.target.value)}
               />
             </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Guardar Cambios" : "Crear Clase"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


// ─── Universal Delete Confirmation ────────────────────────────────────────────

interface DeleteConfirmProps {
  courseId: string;
  item: { type: "subject" | "class"; id: string; parentId?: string; name: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

function DeleteConfirmationModal({ courseId, item, open, onOpenChange, onDeleted }: DeleteConfirmProps) {
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    if (!item) return;
    setDeleting(true);
    try {
      if (item.type === "subject") {
        await deleteSubject(courseId, item.id);
        toast.success(`Módulo eliminado.`);
      } else {
         if (!item.parentId) throw new Error("Referencia al módulo pérdida para poder eliminar.");
         await deleteClass(courseId, item.parentId, item.id);
         toast.success("Clase eliminada.");
      }
      onDeleted();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar {item?.type === "subject" ? "Módulo" : "Clase"}</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar <strong className="text-primary">{item?.name}</strong>? Esta acción
            no se puede deshacer. {item?.type === "subject" ? "Si el módulo contiene clases, no se podrá borrar." : ""}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting && <Loader2 className="size-4 animate-spin" />}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// ─── Main Panel Component ──────────────────────────────────────────────────────

export default function CourseDetailPanel({ courseId }: { courseId: string }) {
  const [tree, setTree] = React.useState<CourseTree | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Modals definitions
  const [subFormOpen, setSubFormOpen] = React.useState(false);
  const [editingSub, setEditingSub] = React.useState<Subject | null>(null);

  const [clsFormOpen, setClsFormOpen] = React.useState(false);
  const [targetSubId, setTargetSubId] = React.useState<string | null>(null);
  const [editingCls, setEditingCls] = React.useState<Class | null>(null);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingItem, setDeletingItem] = React.useState<{type: "subject" | "class", id: string, parentId?: string, name: string} | null>(null);

  
  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCourseTree(courseId);
      // Sort to ensure array ordering matches DB order_index
      data.subjects.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
      for (const sub of data.subjects) {
         sub.classes.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
      }
      setTree(data);
    } catch {
      toast.error("Error cargando el detalle del curso.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceId = result.source.droppableId;
    const destId = result.destination.droppableId;
    
    // Solo permitimos reordenar en la misma zona
    if (sourceId !== destId) return;

    if (sourceId === "subjects") {
      // Reordenar módulos
      if (!tree) return;
      const newSubjects = Array.from(tree.subjects);
      const [reorderedItem] = newSubjects.splice(result.source.index, 1);
      newSubjects.splice(result.destination.index, 0, reorderedItem);
      
      setTree({ ...tree, subjects: newSubjects });
      
      const newOrderIds = newSubjects.map(s => s.id);
      try {
        await reorderSubjects(courseId, newOrderIds);
      } catch {
        toast.error("Error al guardar el nuevo orden.");
        loadData(); // Revert
      }
    } else {
      // Reordenar clases dentro de un módulo
      if (!tree) return;
      const subjectIndex = tree.subjects.findIndex(s => s.id === sourceId);
      if (subjectIndex === -1) return;
      
      const subject = tree.subjects[subjectIndex];
      const newClasses = Array.from(subject.classes);
      const [reorderedItem] = newClasses.splice(result.source.index, 1);
      newClasses.splice(result.destination.index, 0, reorderedItem);
      
      const newTreeSubjects = [...tree.subjects];
      newTreeSubjects[subjectIndex] = { ...subject, classes: newClasses };
      setTree({ ...tree, subjects: newTreeSubjects });
      
      const newOrderIds = newClasses.map(c => c.id);
      try {
        await reorderClasses(courseId, subject.id, newOrderIds);
      } catch {
        toast.error("Error al guardar el nuevo orden.");
        loadData(); // Revert
      }
    }
  };


  // Action handlers
  const openNewSubject = () => {
     setEditingSub(null);
     setSubFormOpen(true);
  };
  const openEditSubject = (e: React.MouseEvent, subject: Subject) => {
     e.stopPropagation(); // Stop accordion from toggling
     setEditingSub(subject);
     setSubFormOpen(true);
  };
  const triggerDeleteSubject = (e: React.MouseEvent, subject: Subject) => {
     e.stopPropagation();
     setDeletingItem({ type: "subject", id: subject.id, name: getLocalizedText(subject.title) });
     setDeleteOpen(true);
  };

  const openNewClass = (e: React.MouseEvent, subjectId: string) => {
     e.stopPropagation();
     setTargetSubId(subjectId);
     setEditingCls(null);
     setClsFormOpen(true);
  };
  const openEditClass = (e: React.MouseEvent, subjectId: string, cls: Class) => {
     e.stopPropagation();
     setTargetSubId(subjectId);
     setEditingCls(cls);
     setClsFormOpen(true);
  };
  const triggerDeleteClass = (e: React.MouseEvent, subjectId: string, cls: Class) => {
     e.stopPropagation();
     setDeletingItem({ type: "class", id: cls.id, parentId: subjectId, name: getLocalizedText(cls.title) });
     setDeleteOpen(true);
  };


  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="rounded-lg border border-dashed text-center p-8 text-muted-foreground">
        No se pudo cargar la información del curso.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div>
         <Link 
            href="/campus/admin/courses" 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary mb-4 transition-colors"
         >
            <ArrowLeft className="size-4 mr-2" />
            Volver a Cursos
         </Link>
         
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
             <div>
                <Title level="h2">{getLocalizedText(tree.course.title)}</Title>
                <div className="flex items-center mt-2 text-sm text-slate-500 gap-3">
                   <StatusBadge status={tree.course.status} />
                   <span>Creado el {formatDate(tree.course.created_at)}</span>
                   <span className="bg-slate-100 rounded-md px-2 py-0.5 border border-slate-200 text-xs font-mono">{tree.subjects.length} módulos</span>
                </div>
             </div>
             
             <Button onClick={openNewSubject}>
                <Plus className="size-4" />
                Nuevo Módulo
             </Button>
         </div>
      </div>

      {tree.subjects.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
           <div className="flex size-16 items-center justify-center rounded-2xl bg-accent/10 mb-5">
             <LayoutList className="size-8 text-accent" />
           </div>
           <p className="text-lg font-semibold text-primary tracking-tight">
             El curso está vacío
           </p>
           <p className="mt-1 text-sm text-slate-500 max-w-xs">
             Añade tu primer módulo para comenzar a estructurar el contenido de las clases.
           </p>
           <Button className="mt-6 border border-primary/20" variant="secondary" onClick={openNewSubject}>
             <Plus className="size-4" />
             Crear Primer Módulo
           </Button>
         </div>
      ) : mounted ? (
         <DragDropContext onDragEnd={handleDragEnd}>
           <Droppable droppableId="subjects" type="SUBJECT">
             {(provided) => (
               <div 
                 {...provided.droppableProps} 
                 ref={provided.innerRef} 
                 className="bg-white rounded-2xl border border-slate-100 p-2 shadow-sm space-y-1"
               >
                 <Accordion type="multiple" className="w-full">
                   {tree.subjects.map((sub, index) => (
                      <Draggable key={sub.id} draggableId={sub.id} index={index}>
                         {(subjProvided, subjSnapshot) => (
                           <div 
                              ref={subjProvided.innerRef}
                              {...subjProvided.draggableProps}
                              className={subjSnapshot.isDragging ? "opacity-90 z-50 bg-white rounded-xl outline outline-1 outline-primary/20 shadow-xl" : ""}
                           >
                             <AccordionItem value={sub.id} className="border-slate-100 px-4 group/item">
                               <div className="relative group/trigger">
                                 <AccordionTrigger className="hover:no-underline py-5 lg:py-4">
                                    <div className="flex items-center gap-3 text-left pr-20">
                                       <div 
                                          {...subjProvided.dragHandleProps}
                                          className="cursor-move text-slate-300 hover:text-slate-500 -ml-2 mr-1 opacity-100 sm:opacity-0 sm:group-hover/trigger:opacity-100 transition-opacity p-2"
                                          onClick={(e) => e.stopPropagation()}
                                       >
                                          <GripVertical className="size-5" />
                                       </div>
                                       <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                                          <span className="font-bold text-[10px] text-accent tracking-widest leading-none">M{index + 1}</span>
                                       </div>
                                       <div className="flex flex-col gap-0.5">
                                         <span className="font-bold text-primary tracking-tight">{getLocalizedText(sub.title)}</span>
                                         {sub.description && (
                                            <span className="text-xs font-medium text-slate-500 line-clamp-1">{getLocalizedText(sub.description)}</span>
                                         )}
                                       </div>
                                    </div>
                                 </AccordionTrigger>

                                 {/* Subject Actions Wrapper */}
                                 <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10 opacity-100 sm:opacity-0 sm:group-hover/item:opacity-100 transition-opacity">
                                    <Tooltip>
                                     <TooltipTrigger asChild>
                                       <Button
                                         variant="ghost"
                                         size="icon-xs"
                                         onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditSubject(e, sub); }}
                                       >
                                         <Pencil className="size-3.5" />
                                       </Button>
                                     </TooltipTrigger>
                                     <TooltipContent>Editar Módulo</TooltipContent>
                                   </Tooltip>
                                   
                                   <Tooltip>
                                     <TooltipTrigger asChild>
                                       <Button
                                         variant="ghost"
                                         size="icon-xs"
                                         className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                         onClick={(e) => { e.preventDefault(); e.stopPropagation(); triggerDeleteSubject(e, sub); }}
                                       >
                                         <Trash2 className="size-3.5" />
                                       </Button>
                                     </TooltipTrigger>
                                     <TooltipContent>Eliminar Módulo</TooltipContent>
                                   </Tooltip>
                                 </div>
                               </div>
                              
                              <AccordionContent className="pb-5 pt-2">
                                 <div className="pl-11 space-y-3">
                                   {sub.classes.length === 0 ? (
                                     <div className="text-sm text-slate-400 font-medium py-3 px-4 border border-dashed rounded-xl flex items-center justify-between">
                                        <span>Este módulo no tiene clases aún.</span>
                                        <Button variant="secondary" size="xs" onClick={(e) => openNewClass(e, sub.id)}>
                                          <Plus className="size-3" /> Añadir Clase
                                        </Button>
                                     </div>
                                   ) : (
                                     <Droppable droppableId={sub.id} type="CLASS">
                                       {(clsDroppable) => (
                                         <div 
                                           className="space-y-2"
                                           ref={clsDroppable.innerRef}
                                           {...clsDroppable.droppableProps}
                                         >
                                           {sub.classes.map((cls, cIndex) => (
                                              <Draggable key={cls.id} draggableId={cls.id} index={cIndex}>
                                                 {(clsProvided, clsSnapshot) => (
                                                   <div 
                                                      ref={clsProvided.innerRef}
                                                      {...clsProvided.draggableProps}
                                                      className={`flex items-center justify-between group/cls bg-slate-50/50 hover:bg-slate-100 border border-slate-100 rounded-xl px-4 py-3 transition-colors ${clsSnapshot.isDragging ? "shadow-md bg-white border-primary/20 opacity-90 z-50" : ""}`}
                                                   >
                                                      <div className="flex items-center gap-3">
                                                         <div 
                                                            {...clsProvided.dragHandleProps} 
                                                            className="cursor-move text-slate-300 hover:text-slate-500 opacity-100 sm:opacity-0 sm:group-hover/cls:opacity-100 transition-opacity p-1 -ml-2"
                                                         >
                                                            <GripVertical className="size-4" />
                                                         </div>
                                                         {cls.video_url ? (
                                                           <div className="flex size-6 shrink-0 bg-brand-orange/20 text-brand-orange items-center justify-center rounded-md">
                                                              <Video className="size-3" />
                                                           </div>
                                                         ) : cls.resource_url ? (
                                                           <div className="flex size-6 shrink-0 bg-primary/10 text-primary items-center justify-center rounded-md">
                                                              <FileText className="size-3" />
                                                           </div>
                                                         ) : (
                                                           <div className="flex size-6 shrink-0 border border-slate-200 text-slate-400 items-center justify-center rounded-md">
                                                              <FileText className="size-3" />
                                                           </div>
                                                         )}
                                                         <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                              {cIndex + 1}. {getLocalizedText(cls.title)}
                                                              {cls.duration_minutes && (
                                                                <Badge variant="secondary" className="px-1.5 py-0 h-4 rounded text-[10px] gap-1 font-semibold">
                                                                  <Clock className="size-2.5" /> {cls.duration_minutes}m
                                                                </Badge>
                                                              )}
                                                            </span>
                                                         </div>
                                                      </div>
                                                      
                                                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover/cls:opacity-100 transition-opacity">
                                                         <Tooltip>
                                                          <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon-xs" className="h-6 w-6" onClick={(e) => openEditClass(e, sub.id, cls)}>
                                                              <Pencil className="size-3" />
                                                            </Button>
                                                          </TooltipTrigger>
                                                          <TooltipContent>Editar Clase</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                          <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon-xs" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={(e) => triggerDeleteClass(e, sub.id, cls)}>
                                                              <Trash2 className="size-3" />
                                                            </Button>
                                                          </TooltipTrigger>
                                                          <TooltipContent>Eliminar Clase</TooltipContent>
                                                        </Tooltip>
                                                      </div>
                                                   </div>
                                                 )}
                                              </Draggable>
                                           ))}
                                           {clsDroppable.placeholder}
                                           <div className="pt-2 flex justify-end">
                                              <Button variant="ghost" size="sm" className="text-slate-500 font-semibold text-xs py-1 h-8" onClick={(e) => openNewClass(e, sub.id)}>
                                                 <Plus className="size-3" /> Añadir siguiente clase
                                              </Button>
                                           </div>
                                         </div>
                                       )}
                                     </Droppable>
                                   )}
                                 </div>
                              </AccordionContent>
                            </AccordionItem>
                           </div>
                         )}
                      </Draggable>
                   ))}
                   {provided.placeholder}
                 </Accordion>
               </div>
             )}
           </Droppable>
         </DragDropContext>
      ) : null}

      {/* Cross-panel Modals */}
      <SubjectFormModal 
         courseId={courseId}
         subject={editingSub}
         open={subFormOpen}
         onOpenChange={setSubFormOpen}
         onSaved={loadData}
      />

      <ClassFormModal 
         courseId={courseId}
         subjectId={targetSubId}
         cls={editingCls}
         open={clsFormOpen}
         onOpenChange={setClsFormOpen}
         onSaved={loadData}
      />

      <DeleteConfirmationModal
         courseId={courseId}
         item={deletingItem}
         open={deleteOpen}
         onOpenChange={setDeleteOpen}
         onDeleted={loadData}
      />
    </div>
  );
}
