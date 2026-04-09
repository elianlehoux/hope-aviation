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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100 mb-4">
            <AlertTriangle className="size-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-xl">No se puede publicar el curso</DialogTitle>
          <DialogDescription className="text-center">
            El curso <span className="font-semibold text-primary">"{courseTitle}"</span> no cumple con los requisitos mínimos de contenido para el examen final.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-50 rounded-2xl p-6 my-4 border border-slate-100 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Configurado</span>
              <span className="text-2xl font-bold text-primary">{configuredQuestions}</span>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-slate-200">
               <ArrowRight className="size-4 text-slate-400" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Disponible</span>
              <span className="text-2xl font-bold text-amber-600">{availableQuestions}</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Faltan <span className="text-amber-600 font-bold">{configuredQuestions - availableQuestions}</span> preguntas para que el examen final pueda generarse correctamente.
            </p>
            <p className="text-xs text-slate-400">
              Debes añadir más preguntas a los módulos del curso o reducir la cantidad de preguntas del examen final antes de publicar.
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <DialogClose asChild>
            <Button className="w-full sm:w-auto px-8" variant="default">
              Entendido
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
