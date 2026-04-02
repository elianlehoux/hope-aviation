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
  Image as ImageIcon,
  LayoutList,
} from "lucide-react";

import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/shared/table";
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

import type { Course, TranslatedText, CourseStatus } from "@/types/database";

type CourseWithCount = Course & {
  subjects?: { count: number }[];
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

async function fetchCourses(status?: string): Promise<CourseWithCount[]> {
  const url = status && status !== "all" ? `/api/courses?status=${status}` : "/api/courses";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error loading courses");
  const json = await res.json();
  return json.data.courses;
}

async function createCourse(payload: {
  title: TranslatedText;
  description: TranslatedText | null;
  thumbnail_url: string | null;
  status: CourseStatus;
}): Promise<Course> {
  const res = await fetch("/api/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Error creating course");
  }
  const json = await res.json();
  return json.data.course;
}

async function updateCourse(
  courseId: string,
  payload: {
    title?: TranslatedText;
    description?: TranslatedText | null;
    thumbnail_url?: string | null;
    status?: CourseStatus;
  },
): Promise<Course> {
  const res = await fetch(`/api/courses/${courseId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Error updating course");
  }
  const json = await res.json();
  return json.data.course;
}

async function deleteCourse(courseId: string): Promise<void> {
  const res = await fetch(`/api/courses/${courseId}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Error deleting course");
  }
}

// ─── Course Form Modal ───────────────────────────────────────────────────────

interface CourseFormProps {
  course?: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function CourseFormModal({ course, open, onOpenChange, onSaved }: CourseFormProps) {
  const isEdit = !!course;

  const [titleEs, setTitleEs] = React.useState("");
  const [titleEn, setTitleEn] = React.useState("");
  const [descEs, setDescEs] = React.useState("");
  const [descEn, setDescEn] = React.useState("");
  const [thumbnailUrl, setThumbnailUrl] = React.useState("");
  const [status, setStatus] = React.useState<CourseStatus>("draft");
  const [saving, setSaving] = React.useState(false);

  // Sync form state when course changes
  React.useEffect(() => {
    if (open) {
      setTitleEs(course?.title?.es ?? "");
      setTitleEn(course?.title?.en ?? "");
      setDescEs(course?.description?.es ?? "");
      setDescEn(course?.description?.en ?? "");
      setThumbnailUrl(course?.thumbnail_url ?? "");
      setStatus(course?.status ?? "draft");
    }
  }, [course, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titleEs.trim() && !titleEn.trim()) {
      toast.error("El curso debe tener un título (ES o EN).");
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
        thumbnail_url: thumbnailUrl.trim() || null,
        status,
      };

      if (isEdit && course) {
        await updateCourse(course.id, payload);
        toast.success("Curso actualizado correctamente.");
      } else {
        await createCourse(payload);
        toast.success("Curso creado correctamente.");
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
          <DialogTitle>{isEdit ? "Editar Curso" : "Nuevo Curso"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualiza los detalles del curso."
              : "Completa la información para crear un nuevo curso."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-title-es">Título (ES) <span className="text-red-500">*</span></Label>
              <Input
                id="course-title-es"
                placeholder="Ej. Introducción a la Aviación"
                value={titleEs}
                onChange={(e) => setTitleEs(e.target.value)}
                required={!titleEn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-title-en">Título (EN)</Label>
              <Input
                id="course-title-en"
                placeholder="e.g. Introduction to Aviation"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                required={!titleEs}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-desc-es">Descripción (ES)</Label>
              <Textarea
                id="course-desc-es"
                placeholder="Descripción en español..."
                value={descEs}
                onChange={(e) => setDescEs(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-desc-en">Descripción (EN)</Label>
              <Textarea
                id="course-desc-en"
                placeholder="Description in English..."
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-thumbnail">URL de Portada</Label>
            <Input
              id="course-thumbnail"
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
            />
            {thumbnailUrl && (
              <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                 <ImageIcon className="size-4" />
                 Vista previa disponible
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-status">Estado</Label>
            <Select value={status} onValueChange={(val) => setStatus(val as CourseStatus)}>
              <SelectTrigger id="course-status">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="archived">Archivado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Guardar Cambios" : "Crear Curso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

interface DeleteConfirmProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

function DeleteCourseModal({
  course,
  open,
  onOpenChange,
  onDeleted,
}: DeleteConfirmProps) {
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    if (!course) return;
    setDeleting(true);
    try {
      await deleteCourse(course.id);
      toast.success(`Curso eliminado.`);
      onDeleted();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar el curso.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Curso</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar el curso{" "}
            <strong className="text-primary">{getLocalizedText(course?.title ?? null)}</strong>? Esta acción
            no se puede deshacer.
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
            Eliminar Curso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function CoursesTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function CoursesEmpty({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-accent/10 mb-5">
        <BookOpen className="size-8 text-accent" />
      </div>
      <p className="text-lg font-semibold text-primary tracking-tight">
        No se encontraron cursos
      </p>
      <p className="mt-1 text-sm text-slate-500 max-w-xs">
        Crea tu primer curso para empezar a construir el catálogo de Hope Aviation.
      </p>
      <Button className="mt-6" onClick={onCreateClick}>
        <Plus className="size-4" />
        Crear Curso
      </Button>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function CoursesPanel() {
  const [courses, setCourses] = React.useState<CourseWithCount[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterStatus, setFilterStatus] = React.useState("all");

  // Modal states
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingCourse, setEditingCourse] = React.useState<Course | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingCourse, setDeletingCourse] = React.useState<Course | null>(null);

  const loadCourses = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCourses(filterStatus);
      setCourses(data);
    } catch {
      toast.error("No se pudieron cargar los cursos.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  React.useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  function handleCreate() {
    setEditingCourse(null);
    setFormOpen(true);
  }

  function handleEdit(course: Course) {
    setEditingCourse(course);
    setFormOpen(true);
  }

  function handleDeleteClick(course: Course) {
    setDeletingCourse(course);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level="h3" as="h1">
            Cursos
          </Title>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Gestiona el catálogo de cursos, estados de publicación y traducciones.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-[180px]">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="draft">Borradores</SelectItem>
                <SelectItem value="archived">Archivados</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreate} className="shrink-0 self-start sm:self-auto">
            <Plus className="size-4" />
            Nuevo Curso
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <CoursesTableSkeleton />
      ) : courses.length === 0 ? (
        <CoursesEmpty onCreateClick={handleCreate} />
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Módulos</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Descripción
                </TableHead>
                <TableHead className="hidden md:table-cell">Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => {
                return (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {course.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={course.thumbnail_url} 
                            alt={getLocalizedText(course.title)}
                            className="size-10 rounded-md object-cover border border-slate-100" 
                          />
                        ) : (
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent/10 border border-slate-100">
                            <ImageIcon className="size-4 text-accent/50" />
                          </div>
                        )}
                        <Link 
                          href={`/campus/admin/courses/${course.id}`}
                          className="font-semibold text-primary tracking-tight hover:text-accent transition-colors"
                        >
                          {getLocalizedText(course.title)}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={course.status} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="px-2 font-mono">
                        {(course as any).subjects?.[0]?.count ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-slate-500 text-sm line-clamp-1 max-w-xs">
                        {getLocalizedText(course.description) || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                        <Calendar className="size-3.5" />
                        {formatDate(course.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              asChild
                              className="mr-1"
                            >
                              <Link href={`/campus/admin/courses/${course.id}`} aria-label={`Administrar Módulos de ${getLocalizedText(course.title)}`}>
                                <LayoutList className="size-3.5 text-accent" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Administrar Módulos</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleEdit(course)}
                              aria-label={`Editar ${getLocalizedText(course.title)}`}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDeleteClick(course)}
                              aria-label={`Eliminar ${getLocalizedText(course.title)}`}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Eliminar</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modals */}
      <CourseFormModal
        course={editingCourse}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={loadCourses}
      />
      <DeleteCourseModal
        course={deletingCourse}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={loadCourses}
      />
    </div>
  );
}
