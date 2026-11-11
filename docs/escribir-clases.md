# Cómo escribir una clase

Cada clase del campus puede tener **video**, **texto** o las dos cosas. El texto se escribe en el editor de la clase:

**Gestión → Cursos → (curso) → botón "Escribir clase" en cada clase.**

El editor tiene dos columnas: a la izquierda escribís, a la derecha ves exactamente lo que va a ver el alumno. Hay una pestaña por idioma (ES / EN). Guardá con el botón o con `Cmd/Ctrl + S`.

## Texto básico (Markdown)

```
## Título de sección
Texto normal con **negrita**, *cursiva* y [un enlace](https://hopeaviation.org).

- Un punto
- Otro punto

1. Paso uno
2. Paso dos

![Descripción de la foto](https://url-de-la-imagen.jpg "Epígrafe")
```

Las tablas también funcionan:

```
| Región | Aeronave ideal |
|---|---|
| Misiones | Helicóptero o STOL |
```

## Bloques especiales

Todos se insertan con los botones de arriba del editor. Este es el formato por si querés escribirlos a mano.

**Notas** (`NOTE`, `TIP`, `WARNING` o `VERSE`):

```
> [!TIP] Para pilotos
> Hacé tu licencia en la escuela que prefieras.
```

**Cifras destacadas** (valor | texto):

````
```stats
18 | regiones naturales
120+ | comunidades aisladas
```
````

**Pasos de un proceso** (título: descripción):

````
```steps
Planificar: revisar peso y balance
Cargar: pacientes primero
```
````

**Gráficos** de barras (por defecto) o de líneas (`type: line`):

````
```chart
type: line
title: Distancia de despegue según peso
unit: m
800 kg: 210
1000 kg: 300
1200 kg: 440
```
````

**Pregunta de repaso** (no cuenta para la nota; `+` es la correcta):

````
```check
? ¿Cuál es el rol del avión en una misión?
- Reemplazar al médico
+ Llevar personas y recursos donde no hay caminos
> El avión conecta; no reemplaza.
```
````

## Consejos

- Párrafos cortos, una idea por sección.
- Un gráfico o una cifra vale más que un párrafo de números.
- Cerrá cada clase con una pregunta de repaso.
- Si los datos son ilustrativos, aclaralo con una nota `WARNING`.
