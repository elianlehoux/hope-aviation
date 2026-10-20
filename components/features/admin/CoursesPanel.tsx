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
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";

import { CampusPageHeader } from "@/components/features/campus/ui/page-header";
import { CampusEmpty, CampusSurface } from "@/components/features/campus/ui/surface";
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
import { PublishValidationModal } from "./PublishValidationModal";

import type { Course, TranslatedText, CourseStatus } from "@/types/database";

type CourseWithCount = Course & {
  subjects?: { count: number }[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string, locale: string = "es-ES") {
  return new Date(iso).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: CourseStatus }) {
  const { t } = useTranslation();
  switch (status) {
    case "published":
      return <Badge variant="default">{t("adminDetail.published")}</Badge>;
    case "draft":
      return <Badge variant="secondary">{t("adminDetail.draft")}</Badge>;
    case "archived":
      return <Badge variant="outline" className="text-slate-500 border-slate-200">{t("adminDetail.archived")}</Badge>;
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

  const [validationOpen, setValidationOpen] = React.useState(false);
  const [availableQuestions, setAvailableQuestions] = React.useState(0);
  const { t, lang } = useTranslation();

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
      toast.error(t("adminDetail.courseTitleRequired"));
      return;
    }

    // Validation: if publishing, check final exam question availability
    if (status === "published" && course?.final_exam_question_count) {
      const configCount = course.final_exam_question_count;
      
      try {
        // Fetch current tree to get question count (backend is already updated to return it)
        const treeRes = await fetch(`/api/courses/${course.id}/tree`);
        if (treeRes.ok) {
          const treeData = await treeRes.json();
          const totalAvailable = treeData.data.course.total_questions_count || 0;
          
          if (configCount > totalAvailable) {
            setAvailableQuestions(totalAvailable);
            setValidationOpen(true);
            return;
          }
        }
      } catch (err) {
        console.error("Error validating course before publish:", err);
      }
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
        toast.success(t("adminDetail.courseUpdated")); 
      } else {
        await createCourse(payload);
        toast.success(t("adminDetail.courseCreated"));
      }
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("profile.errorUpdating"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("adminDetail.editCourse") : t("adminDetail.newCourse")}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("adminDetail.courseUpdateNote")
              : t("adminDetail.courseDetailsNote")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-title-es">{t("adminDetail.titleEs")} <span className="text-red-500">*</span></Label>
              <Input
                id="course-title-es"
                placeholder={lang === "es" ? "Ej. Introducción a la Aviación" : "e.g. Introduction to Aviation"}
                value={titleEs}
                onChange={(e) => setTitleEs(e.target.value)}
                required={!titleEn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-title-en">{t("adminDetail.titleEn")}</Label>
              <Input
                id="course-title-en"
                placeholder={lang === "en" ? "e.g. Introduction to Aviation" : "Ej. Introducción a la Aviación"}
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                required={!titleEs}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-desc-es">{t("adminDetail.descEs")}</Label>
              <Textarea
                id="course-desc-es"
                placeholder={lang === "es" ? "Descripción en español..." : "Description in Spanish..."}
                value={descEs}
                onChange={(e) => setDescEs(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-desc-en">{t("adminDetail.descEn")}</Label>
              <Textarea
                id="course-desc-en"
                placeholder={lang === "en" ? "Description in English..." : "Descripción..."}
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-thumbnail">{t("adminDetail.thumbnailUrl")}</Label>
            <Input
              id="course-thumbnail"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
            />
            {thumbnailUrl && (
              <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                 <ImageIcon className="size-4" />
                 {t("adminDetail.previewAvailable")}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-status">{t("adminDetail.columnStatus")}</Label>
            <Select value={status} onValueChange={(val) => setStatus(val as CourseStatus)}>
              <SelectTrigger id="course-status">
                <SelectValue placeholder={t("adminDetail.filterStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">{t("adminDetail.draft")}</SelectItem>
                <SelectItem value="published">{t("adminDetail.published")}</SelectItem>
                <SelectItem value="archived">{t("adminDetail.archived")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? t("adminDetail.saveChanges") : t("adminDetail.newCourse")}
            </Button>
          </DialogFooter>
        </form>

        <PublishValidationModal 
            open={validationOpen}
            onOpenChange={setValidationOpen}
            courseTitle={getLocalizedText(course?.title ?? null, lang)}
            configuredQuestions={course?.final_exam_question_count || 0}
            availableQuestions={availableQuestions}
        />
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
  const { t, lang } = useTranslation();

  async function handleDelete() {
    if (!course) return;
    setDeleting(true);
    try {
      await deleteCourse(course.id);
      toast.success(t("adminDetail.courseDeleted")); // I'll add this key if not present
      onDeleted();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("profile.errorUpdating"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("adminDetail.deleteWithName").replace("{name}", t("adminDetail.courseTitle"))}</DialogTitle>
          <DialogDescription>
            {t("adminDetail.courseDeleteConfirm").replace("{name}", getLocalizedText(course?.title ?? null, lang))}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">{t("common.cancel")}</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting && <Loader2 className="size-4 animate-spin" />}
            {t("adminDetail.deleteWithName").replace("{name}", t("adminDetail.courseTitle"))}
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
  const { t } = useTranslation();
  return (
    <CampusEmpty
      title={t("adminDetail.noUsersFound").replace(t("adminDetail.usersTitle"), t("adminDetail.coursesTitle"))}
      description={t("adminDetail.createRoleNote").replace(t("adminDetail.rolesTitle"), t("adminDetail.coursesTitle"))}
      action={
        <Button onClick={onCreateClick}>
          <Plus className="size-4" />
          {t("adminDetail.newCourse")}
        </Button>
      }
    />
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function CoursesPanel() {
  const { t, lang } = useTranslation();
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
      toast.error(t("profile.errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [filterStatus, t]);

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
    <div className="mx-auto max-w-6xl space-y-8">
      <CampusPageHeader
        title={t("adminDetail.coursesTitle")}
        description={t("adminDetail.coursesSubtitle")}
        actions={
          <>
            <div className="w-[180px]">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t("adminDetail.filterStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("adminDetail.allStates")}</SelectItem>
                  <SelectItem value="published">{t("adminDetail.publishedPlural")}</SelectItem>
                  <SelectItem value="draft">{t("adminDetail.draftPlural")}</SelectItem>
                  <SelectItem value="archived">{t("adminDetail.archivedPlural")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="size-4" />
              {t("adminDetail.newCourse")}
            </Button>
          </>
        }
      />

      {/* Content */}
      {loading ? (
        <CoursesTableSkeleton />
      ) : courses.length === 0 ? (
        <CoursesEmpty onCreateClick={handleCreate} />
      ) : (
        <CampusSurface className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("adminDetail.courseTitle")}</TableHead>
                <TableHead>{t("adminDetail.columnStatus")}</TableHead>
                <TableHead>{t("adminDetail.columnModules")}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t("adminDetail.columnDescription")}
                </TableHead>
                <TableHead className="hidden md:table-cell">{t("adminDetail.columnJoined")}</TableHead>
                <TableHead className="text-right">{t("adminDetail.columnActions")}</TableHead>
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
                            alt={getLocalizedText(course.title, lang)}
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
                          {getLocalizedText(course.title, lang)}
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
                        {getLocalizedText(course.description, lang) || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                        <Calendar className="size-3.5" />
                        {formatDate(course.created_at, lang === "es" ? "es-ES" : "en-US")}
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
                               <Link href={`/campus/admin/courses/${course.id}`} aria-label={t("adminDetail.adminModules").replace("{name}", getLocalizedText(course.title, lang))}>
                                <LayoutList className="size-3.5 text-accent" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t("adminDetail.manageModules")}</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon-xs" 
                                onClick={() => handleEdit(course)}
                                aria-label={t("adminDetail.editWithName").replace("{name}", getLocalizedText(course.title, lang))}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t("common.edit")}</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon-xs" 
                                onClick={() => handleDeleteClick(course)}
                                aria-label={t("adminDetail.deleteWithName").replace("{name}", getLocalizedText(course.title, lang))}
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t("common.delete")}</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CampusSurface>
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
