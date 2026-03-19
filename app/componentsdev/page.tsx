"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Title } from "@/components/ui/title";
import { IconButton } from "@/components/ui/icon-button";
import { Navbar } from "@/components/shared/navbar";
import { Modal } from "@/components/shared/modal";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Mail, Settings, User, Plus, Trash, Edit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ComponentsDevPage() {
  const [mounted, setMounted] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    setMounted(true);
    setDate(new Date());
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="container mx-auto py-10 space-y-16">
        <section className="space-y-4">
          <Title level="h1">Guía de Componentes</Title>
          <p className="text-muted-foreground">
            Visualización de todos los componentes de la interfaz de Hope Aviation.
          </p>
        </section>

        <Separator />

        {/* Buttons */}
        <section className="space-y-6">
          <Title level="h2" as="h2">Botones</Title>
          <div className="flex flex-wrap gap-4 items-center">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <IconButton icon={<Bell className="h-4 w-4" />} variant="outline" />
            <IconButton icon={<Settings className="h-4 w-4" />} variant="ghost" />
          </div>
        </section>

        {/* Typography & Badges */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <Title level="h2" as="h2">Tipografía</Title>
            <div className="space-y-2">
              <Title level="h1">Encabezado H1</Title>
              <Title level="h2">Encabezado H2</Title>
              <Title level="h3">Encabezado H3</Title>
              <Title level="h4">Encabezado H4</Title>
            </div>
          </div>
          <div className="space-y-6">
            <Title level="h2" as="h2">Badges</Title>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>
        </section>

        {/* Forms */}
        <section className="space-y-6">
          <Title level="h2" as="h2">Formularios</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="correo@ejemplo.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="student">Estudiante</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    {date ? date.toLocaleDateString() : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="Cuéntanos sobre ti..." />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms">Acepto los términos y condiciones</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="notify" />
              <Label htmlFor="notify">Recibir notificaciones</Label>
            </div>
          </div>
        </section>

        {/* Feedback & Interaction */}
        <section className="space-y-6">
          <Title level="h2" as="h2">Feedback e Interacción</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div className="space-y-6">
              <Title level="h3">Toast Notification</Title>
              <Button 
                variant="outline" 
                onClick={() => toast.success("Datos guardados con éxito")}
              >
                Simular Éxito
              </Button>
              <Button 
                variant="outline" 
                onClick={() => toast.error("Error al guardar los datos")}
              >
                Simular Error
              </Button>
            </div>
            <div className="space-y-6">
              <Title level="h3">Progress Bar</Title>
              <Progress value={progress} className="w-full" />
            </div>
          </div>
        </section>

        {/* Cards & Advanced */}
        <section className="space-y-6">
          <Title level="h2" as="h2">Cards & Modals</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Perfil del Usuario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">User Name</p>
                    <p className="text-sm text-muted-foreground">user@hope-aviation.com</p>
                  </div>
                </div>
                <Modal 
                  title="Editar Perfil" 
                  description="Realiza cambios en tu información de perfil aquí."
                  trigger={<Button variant="outline" size="sm">Editar</Button>}
                >
                  <p>Aquí iría el formulario de edición.</p>
                </Modal>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>¿Cómo accedo a mis cursos?</AccordionTrigger>
                  <AccordionContent>
                    Puedes acceder desde el Panel de Control en la sección Campus.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">General</TabsTrigger>
                  <TabsTrigger value="settings">Ajustes</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  <div className="p-4 border rounded-md">Contenido general.</div>
                </TabsContent>
                <TabsContent value="settings">
                  <div className="p-4 border rounded-md">Ajustes de la cuenta.</div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Data Table */}
        <section className="space-y-6">
          <Title level="h2" as="h2">Tablas de Datos</Title>
          <div className="rounded-md border">
            <Table>
              <TableCaption>Lista de cursos recientes.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Progreso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Navegación Aérea</TableCell>
                  <TableCell><Badge>Activo</Badge></TableCell>
                  <TableCell>2026-03-19</TableCell>
                  <TableCell className="text-right">45%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Meteorología</TableCell>
                  <TableCell><Badge variant="secondary">Pendiente</Badge></TableCell>
                  <TableCell>2026-03-18</TableCell>
                  <TableCell className="text-right">0%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Miscellaneous */}
        <section className="space-y-6">
          <Title level="h2" as="h2">Otros</Title>
          <div className="flex gap-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>¡Este es un tooltip!</p>
              </TooltipContent>
            </Tooltip>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Skeleton Loading</p>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
