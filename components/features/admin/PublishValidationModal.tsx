"use client";

import * as React from "react";
import { AlertCircle, ArrowRight, BookOpen, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/shared/modal";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";

interface PublishValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configuredQuestions: number;
  availableQuestions: number;
  courseTitle: string;
}

export function PublishValidationModal({
  open,
  onOpenChange,
  configuredQuestions,
  availableQuestions,
  courseTitle,
}: PublishValidationModalProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100 mb-4">
            <AlertTriangle className="size-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-xl">{t("adminDetail.cannotPublish")}</DialogTitle>
          <DialogDescription className="text-center">
            {t("adminDetail.publishErrorDesc").replace("{name}", courseTitle)}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-50 rounded-2xl p-6 my-4 border border-slate-100 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("adminDetail.configured")}</span>
              <span className="text-2xl font-bold text-primary">{configuredQuestions}</span>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-slate-200">
               <ArrowRight className="size-4 text-slate-400" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("adminDetail.available")}</span>
              <span className="text-2xl font-bold text-amber-600">{availableQuestions}</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {t("adminDetail.missingQuestionsNote").replace("{count}", (configuredQuestions - availableQuestions).toString())}
            </p>
            <p className="text-xs text-slate-400">
              {t("adminDetail.publishFixNote")}
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <DialogClose asChild>
            <Button className="w-full sm:w-auto px-8" variant="default">
              {t("common.understand")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
