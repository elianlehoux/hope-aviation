"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  Search, 
  ChevronLeft, 
  GraduationCap, 
  RefreshCcw, 
  CheckCircle2, 
  XCircle, 
  MoreHorizontal,
  Clock,
  BookOpen,
  Filter,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/shared/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/shared/modal";

interface UserAcademicDetailProps {
  userId: string;
}

export default function UserAcademicDetail({ userId }: UserAcademicDetailProps) {
  const { t, lang } = useTranslation();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [examSearch, setExamSearch] = React.useState("");
  const [courseFilter, setCourseFilter] = React.useState("all");

  // Modal for reset confirmation
  const [resetModal, setResetModal] = React.useState<{ open: boolean; examId: string; examTitle: string }>({
    open: false,
    examId: "",
    examTitle: ""
  });
  const [isResetting, setIsResetting] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/user-management/${userId}/academic`);
      if (!res.ok) throw new Error(t("profile.errorLoading"));
      const json = await res.json();
      setData(json.data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResetAttempts = async () => {
    if (!resetModal.examId) return;
    setIsResetting(true);
    try {
      const res = await fetch(`/api/admin/user-management/${userId}/reset-attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: resetModal.examId })
      });
      if (!res.ok) throw new Error(t("adminDetail.attemptsResetError"));
      toast.success(t("adminDetail.attemptsResetSuccess")); 
      setResetModal(prev => ({ ...prev, open: false }));
      loadData(); // Refresh data
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsResetting(false);
    }
  };

  if (loading) return <div className="p-8 space-y-8 animate-pulse"><div className="h-32 bg-slate-100 rounded-3xl" /><div className="h-64 bg-slate-50 rounded-3xl" /></div>;
  if (!data) return <div className="p-8 text-center text-slate-500">{t("adminDetail.studentNotFound")}</div>;

  const { user, enrollments, attempts } = data;

  // Filter exams logic
  const filteredExams = attempts.filter((att: any) => {
    const exam = att.exams;
    const matchesSearch = exam.title?.en?.toLowerCase().includes(examSearch.toLowerCase()) || 
                          exam.title?.es?.toLowerCase().includes(examSearch.toLowerCase());
    const matchesCourse = courseFilter === "all" || exam.subjects?.courses?.id === courseFilter;
    return matchesSearch && matchesCourse;
  });

  // Group attempts by exam for a cleaner table
  const groupedExams = attempts.reduce((acc: any, att: any) => {
    const eid = att.exam_id;
    if (!acc[eid]) {
      acc[eid] = {
        exam: att.exams,
        bestScore: att.score,
        attemptsCount: 0,
        passed: att.passed,
        lastAttempt: att.finished_at
      };
    }
    acc[eid].attemptsCount++;
    if (att.score > acc[eid].bestScore) acc[eid].bestScore = att.score;
    if (att.passed) acc[eid].passed = true;
    return acc;
  }, {});

  const examDisplayList = Object.values(groupedExams).filter((item: any) => {
    const matchesSearch = item.exam.title?.en?.toLowerCase().includes(examSearch.toLowerCase()) || 
                          item.exam.title?.es?.toLowerCase().includes(examSearch.toLowerCase());
    const matchesCourse = courseFilter === "all" || item.exam.subjects?.courses?.id === courseFilter;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-black">
      {/* Back & Title */}
      <div className="flex items-center gap-4">
        <Link href="/campus/admin/user-management">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-primary">
            {t("adminDetail.studentProfile")}
          </h1>
          <p className="text-sm text-slate-500 font-medium">{t("adminDetail.studentProfileSubtitle")}</p>
        </div>
      </div>

      {/* User Header Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <Avatar size="xl" className="ring-8 ring-slate-50">
          {user.avatar_url && <AvatarImage src={user.avatar_url} />}
          <AvatarFallback className="text-2xl">{user.first_name[0]}{user.last_name[0]}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl font-black text-primary tracking-tight">
                {user.first_name} {user.last_name}
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> {t("adminDetail.joined")} {new Date(user.created_at).toLocaleDateString(lang === "es" ? "es-ES" : "en-US")}</span>
                <span className="flex items-center gap-1.5"><BookOpen className="size-3.5" /> {t("adminDetail.enrolledIn").replace("{count}", enrollments.length.toString())}</span>
            </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="space-y-4">
          <div className="px-2 text-black">
            <h3 className="text-lg font-bold tracking-tight">{t("adminDetail.courseEnrollments")}</h3>
          </div>
          <div className="flex flex-col gap-3">
            {enrollments.map((enr: any) => (
                <div key={enr.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0">
                                {enr.courses.thumbnail_url && <img src={enr.courses.thumbnail_url} className="size-full object-cover" />}
                            </div>
                            <h4 className="font-bold text-sm text-primary">{getLocalizedText(enr.courses.title, lang)}</h4>
                        </div>
                        <Badge variant={enr.status === 'active' ? 'secondary' : 'default'} className="text-[10px] bg-emerald-50 text-emerald-600 border-none">
                            {enr.status === 'active' ? t("adminDetail.statusActive") : enr.status.toUpperCase()}
                        </Badge>
                    </div>
                </div>
            ))}
          </div>
      </div>

      {/* Exams History Section */}
      <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-primary">{t("adminDetail.examPerformance")}</h3>
              </div>

              <div className="flex items-center gap-3">
                  <div className="relative w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <Input 
                      placeholder={t("adminDetail.searchPlaceholder")} 
                      className="pl-9 h-9 text-xs" 
                      value={examSearch}
                      onChange={e => setExamSearch(e.target.value)}
                    />
                  </div>
                  <Select value={courseFilter} onValueChange={setCourseFilter}>
                      <SelectTrigger className="w-40 h-9 text-xs">
                          <SelectValue placeholder={t("adminDetail.allCourses")} />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">{t("adminDetail.allCourses")}</SelectItem>
                          {enrollments.map((e: any) => (
                              <SelectItem key={e.courses.id} value={e.courses.id}>{getLocalizedText(e.courses.title, lang)}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden text-black">
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>{t("adminDetail.columnExam")}</TableHead>
                          <TableHead>{t("adminDetail.score")}</TableHead>
                          <TableHead>{t("adminDetail.columnAttempts")}</TableHead>
                          <TableHead>{t("adminDetail.columnStatus")}</TableHead>
                          <TableHead className="text-right">{t("common.actions")}</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {examDisplayList.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400">{t("adminDetail.noExamRecords")}</TableCell></TableRow>
                      ) : examDisplayList.map((item: any) => (
                        <TableRow key={item.exam.id}>
                            <TableCell>
                                <div className="space-y-0.5">
                                    <div className="font-bold text-sm text-primary">{getLocalizedText(item.exam.title, lang)}</div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-widest">{getLocalizedText(item.exam.subjects?.title, lang)}</div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className={cn("font-bold", item.passed ? "text-emerald-600" : "text-rose-600")}>
                                        {Math.round(item.bestScore)}%
                                    </span>
                                    <span className="text-[10px] text-slate-400">/ {item.exam.passing_score}%</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm font-medium">
                                    {item.attemptsCount} <span className="text-slate-400">/ {item.exam.max_attempts}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {item.passed ? (
                                    <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px]"><CheckCircle2 className="size-3 mr-1" /> {t("adminDetail.statusPassed")}</Badge>
                                ) : (
                                    <Badge className="bg-rose-50 text-rose-600 border-none text-[10px]"><XCircle className="size-3 mr-1" /> {t("adminDetail.statusFailed")}</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setResetModal({ open: true, examId: item.exam.id, examTitle: getLocalizedText(item.exam.title, lang) || "Exam" })}
                                  className="h-8 group hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                                >
                                    <RefreshCcw className="size-3.5 mr-1.5 group-hover:rotate-180 duration-500" />
                                    {t("adminDetail.reset")}
                                </Button>
                            </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={resetModal.open} onOpenChange={(o) => setResetModal(p => ({ ...p, open: o }))}>
          <DialogContent>
              <DialogHeader>
                  <div className="size-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                      <AlertCircle className="size-6 text-rose-500" />
                  </div>
                  <DialogTitle>{t("adminDetail.resetAttemptsTitle")}</DialogTitle>
                  <DialogDescription>
                      {t("adminDetail.resetAttemptsConfirm").replace("{name}", resetModal.examTitle)} 
                  </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-6">
                  <DialogClose asChild><Button variant="ghost">{t("common.cancel")}</Button></DialogClose>
                  <Button 
                    variant="destructive" 
                    onClick={handleResetAttempts}
                    disabled={isResetting}
                  >
                      {isResetting && <Loader2 className="size-4 animate-spin" />}
                      {t("adminDetail.resetAttempts")}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}

function Loader2(props: any) {
    return <RefreshCcw {...props} />;
}
