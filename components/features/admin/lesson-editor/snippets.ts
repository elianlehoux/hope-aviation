/** Insertable lesson blocks for the editor toolbar (see lib/campus/lesson-blocks.ts). */
export const LESSON_SNIPPETS = [
  { id: "h2", es: "Título", en: "Heading", text: "\n## Título de sección\n" },
  { id: "note", es: "Nota", en: "Note", text: "\n> [!NOTE] Idea clave\n> Texto de la nota.\n" },
  { id: "tip", es: "Consejo", en: "Tip", text: "\n> [!TIP] Consejo\n> Texto del consejo.\n" },
  { id: "warning", es: "Advertencia", en: "Warning", text: "\n> [!WARNING] Atención\n> Texto de la advertencia.\n" },
  { id: "verse", es: "Versículo", en: "Verse", text: "\n> [!VERSE] Colosenses 3:23\n> Hagan lo que hagan, trabajen de buena gana...\n" },
  { id: "stats", es: "Cifras", en: "Stats", text: "\n```stats\n18 | regiones naturales\n120+ | comunidades aisladas\n```\n" },
  { id: "steps", es: "Pasos", en: "Steps", text: "\n```steps\nPrimer paso: descripción breve\nSegundo paso: descripción breve\n```\n" },
  { id: "bar", es: "Gráfico de barras", en: "Bar chart", text: "\n```chart\ntitle: Título del gráfico\nunit: h\nCategoría A: 4\nCategoría B: 12\n```\n" },
  { id: "line", es: "Gráfico de líneas", en: "Line chart", text: "\n```chart\ntype: line\ntitle: Título del gráfico\nunit: m\n800 kg: 210\n1000 kg: 300\n1200 kg: 440\n```\n" },
  { id: "table", es: "Tabla", en: "Table", text: "\n| Columna 1 | Columna 2 |\n|---|---|\n| Dato | Dato |\n" },
  { id: "image", es: "Imagen", en: "Image", text: "\n![Descripción de la imagen](https://… \"Epígrafe opcional\")\n" },
  { id: "check", es: "Repaso", en: "Quick check", text: "\n```check\n? Pregunta de repaso\n- Opción incorrecta\n+ Opción correcta\n> Explicación que se muestra al responder.\n```\n" },
] as const;
