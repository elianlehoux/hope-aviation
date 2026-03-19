"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
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
import { Bell, Mail, Settings, User, Plus, Trash, Edit, Check } from "lucide-react";
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

  const Section = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
    <div className="space-y-6 py-12 border-b last:border-0 border-slate-200">
      <div className="space-y-2">
        <Title level="h2" as="h2" className="text-primary">{title}</Title>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="p-6 rounded-xl border bg-slate-50/50">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto py-10 px-4 md:px-8 max-w-5xl">
        <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Hope Aviation - Component Library</h1>
        <p className="mt-2 text-lg text-slate-600">Development environment for UI components and brand identity.</p>
      </header>

      <Section title="Actualized Brand Colors">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <div className="h-24 w-full rounded-lg bg-[#00263e] shadow-sm border border-slate-200 text-white flex items-end p-2 text-xs">HEX #00263e</div>
            <div>
              <p className="font-semibold text-[#00263e]">Primary (Deep Blue)</p>
              <p className="text-sm text-slate-500">bg-[#00263e] / #00263e</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-24 w-full rounded-lg bg-[#ffffff] shadow-sm border border-slate-200 flex items-end p-2 text-xs text-[#00263e] italic">HEX #ffffff</div>
            <div>
              <p className="font-semibold text-[#00263e]">Secondary (White)</p>
              <p className="text-sm text-slate-500">bg-[#ffffff] / #ffffff</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-24 w-full rounded-lg bg-[#1749ff] shadow-sm border border-slate-200 text-white flex items-end p-2 text-xs">HEX #1749ff</div>
            <div>
              <p className="font-semibold text-[#1749ff]">Accent (Vibrant Blue)</p>
              <p className="text-sm text-slate-500">bg-[#1749ff] / #1749ff</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-24 w-full rounded-lg bg-[#ffaa00] shadow-sm border border-slate-200 text-white flex items-end p-2 text-xs">HEX #ffaa00</div>
            <div>
              <p className="font-semibold text-[#ffaa00]">Aviation Orange</p>
              <p className="text-sm text-slate-500">bg-[#ffaa00] / #ffaa00</p>
            </div>
          </div>
          <div className="space-y-2 text-[#00263e]">
            <div className="h-24 w-full rounded-lg bg-[#00263e] shadow-sm border border-slate-200"></div>
            <div>
              <p className="font-semibold">Current Text Color</p>
              <p className="text-sm text-slate-500">Should be Deep Blue</p>
            </div>
          </div>
        </div>
      </Section>
        {/* UI COMPONENTS SECTION */}
        <div className="space-y-4 mb-8">
          <Title level="h3" className="uppercase tracking-widest text-slate-400 text-xs font-bold">Base UI Components</Title>
        </div>

        <Section title="Button" description="Botón estándar con múltiples variantes y estados.">
          <div className="flex flex-wrap gap-4 items-center">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
          </div>
        </Section>

        <Section title="IconButton" description="Botón optimizado para iconos, manteniendo la consistencia de Shadcn.">
          <div className="flex flex-wrap gap-4 items-center">
            <IconButton icon={<Bell className="size-4" />} />
            <IconButton icon={<Settings className="size-4" />} variant="secondary" />
            <IconButton icon={<Trash className="size-4" />} variant="destructive" />
            <IconButton icon={<Plus className="size-4" />} variant="outline" className="rounded-full" />
            <IconButton icon={<Edit className="size-4" />} variant="ghost" />
          </div>
        </Section>

        <Section title="Badge" description="Indicadores visuales de estado o etiquetas.">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </Section>

        <Section title="Title (Typography)" description="Sistema de encabezados cohesivo para títulos y subtítulos.">
          <div className="space-y-4">
            <Title level="h1">Encabezado H1</Title>
            <Title level="h2">Encabezado H2</Title>
            <Title level="h3">Encabezado H3</Title>
            <Title level="h4">Encabezado H4</Title>
            <Title level="h5">Encabezado H5</Title>
            <Title level="h6">Encabezado H6</Title>
          </div>
        </Section>

        <Section title="Input" description="Entrada de texto estándar para formularios.">
          <div className="max-w-sm space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input-demo">Correo Electrónico</Label>
              <Input id="input-demo" type="email" placeholder="ejemplo@hope.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="input-disabled">Editable Deshabilitado</Label>
              <Input id="input-disabled" disabled placeholder="No editable" />
            </div>
          </div>
        </Section>

        <Section title="Select" description="Menú desplegable para selección simple.">
          <div className="max-w-sm space-y-2">
            <Label>Selecciona un rol</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Elegir opción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="student">Estudiante</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Section>

        <Section title="Date Picker" description="Calendario interactivo dentro de un Popover.">
          <div className="max-w-sm space-y-2">
            <Label>Fecha de Inscripción</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Mail className="mr-2 size-4" />
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
        </Section>

        <Section title="Textarea" description="Área de texto para múltiples líneas.">
          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea id="bio" placeholder="Escribe algo sobre ti..." />
          </div>
        </Section>

        <Section title="Checkbox" description="Control de selección binaria simple.">
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
              Acepto los términos y condiciones de Hope Aviation
            </Label>
          </div>
        </Section>

        <Section title="Switch" description="Interruptor deslizante para preferencias o toggles.">
          <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" />
            <Label htmlFor="airplane-mode">Modo Entrenamiento Activo</Label>
          </div>
        </Section>

        <Section title="Toast (Sonner)" description="Mensajes de retroalimentación flotantes.">
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => toast.success("Operación exitosa", { description: "Tus datos han sido guardados." })}>
              Show Success
            </Button>
            <Button variant="outline" onClick={() => toast.error("Error crítico", { description: "No se pudo conectar con el servidor." })}>
              Show Error
            </Button>
          </div>
        </Section>

        <Section title="Progress" description="Barra de progreso para estados de carga o avance.">
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground">Progreso actual: {progress}%</p>
          </div>
        </Section>

        <Section title="Card" description="Contenedor versátil para agrupar contenido relacionado.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Navegación Aérea I</CardTitle>
                <CardDescription>Módulo inicial de fundamentos.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Este curso incluye 12 lecciones dinámicas y evaluaciones prácticas.</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">Detalles</Button>
                <Button size="sm">Inscribirse</Button>
              </CardFooter>
            </Card>
          </div>
        </Section>

        <Section title="Avatar" description="Representación circular del usuario con fallback.">
          <div className="flex items-center gap-6">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar className="size-16">
              <AvatarFallback className="bg-primary text-primary-foreground">HA</AvatarFallback>
            </Avatar>
          </div>
        </Section>

        <Section title="Accordion" description="Carga de contenido colapsable por secciones.">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>¿Qué requisitos necesito?</AccordionTrigger>
              <AccordionContent>
                Solo necesitas una conexión a internet estable y muchas ganas de aprender.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>¿Recibo certificación?</AccordionTrigger>
              <AccordionContent>
                Sí, al finalizar cada curso recibirás un certificado digital oficial.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Section>

        <Section title="Tabs" description="Organización de contenido en pestañas paralelas.">
          <Tabs defaultValue="account" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Cuenta</TabsTrigger>
              <TabsTrigger value="password">Seguridad</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <Card>
                <CardContent className="space-y-2 pt-4">
                  <p className="text-sm">Configuración de tu cuenta aquí.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="password">
              <Card>
                <CardContent className="space-y-2 pt-4">
                  <p className="text-sm">Configuración de contraseña aquí.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="Tooltip" description="Pequeña ventana de información al pasar el mouse.">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Posa el mouse aquí</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Información adicional útil para el usuario</p>
            </TooltipContent>
          </Tooltip>
        </Section>

        <Section title="Skeleton" description="Efecto de carga para simular contenido pendiente.">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </Section>

        <Separator className="my-16" />

        {/* SHARED COMPONENTS SECTION */}
        <div className="space-y-4 mb-8">
          <Title level="h3" className="uppercase tracking-widest text-slate-400 text-xs font-bold">Shared Components</Title>
        </div>

        <Section title="Navbar (Shared)" description="Navegación principal de la plataforma.">
          <div className="border rounded-lg overflow-hidden border-slate-200">
            <Navbar />
          </div>
        </Section>

        <Section title="Modal (Shared wrapper)" description="Componente reutilizable para diálogos y ventanas emergentes.">
          <Modal 
            title="Suscripción Premium" 
            description="Obtén acceso ilimitado a todos los simuladores de vuelo."
            trigger={<Button>Abrir Suscripción</Button>}
          >
            <div className="bg-slate-100 p-4 rounded-md flex items-center gap-3">
              <Check className="text-green-600 size-5" />
              <p className="text-sm font-medium">Contenido exclusivo desbloqueado.</p>
            </div>
          </Modal>
        </Section>

        <Section title="Table (Shared)" description="Presentación estructurada de datos tabulares.">
          <div className="rounded-md border">
            <Table>
              <TableCaption>Historial de Calificaciones</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Materia</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Nota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Aerodinámica</TableCell>
                  <TableCell>Capt. Smith</TableCell>
                  <TableCell>12/03/26</TableCell>
                  <TableCell className="text-right font-bold text-green-600">9.5</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Comunicaciones</TableCell>
                  <TableCell>Instr. Doe</TableCell>
                  <TableCell>08/03/26</TableCell>
                  <TableCell className="text-right font-bold text-green-600">8.0</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Section>

      </main>

      <footer className="bg-slate-50 border-t py-12 mt-12">
        <div className="container mx-auto px-6 text-center text-slate-400 text-sm">
          <p>© 2026 Hope Aviation Design System</p>
        </div>
      </footer>
    </div>
  );
}
