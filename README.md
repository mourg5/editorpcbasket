# Editor PC Basket - Mou

Herramienta completa para editar bases de datos, equipos, jugadores, medias y ejecutables de **PC Basket** (Dinamic Multimedia).

Migrado a React + Vite + TypeScript para AI Studio Build, preservando la lógica original de decodificación y estructura binaria.

## Características

- **Gestión de Equipos (`Equipos`)**:
  - Vista general de equipos con medias de Quinteto y Plantilla.
  - Edición completa de datos del club (pabellón, aforo, presupuesto, entrenador, país).
  - Gestión de plantillas con demarcaciones fijas de quinteto inicial (Base, Escolta, Alero, Ala-Pívot, Pívot) y suplentes.
  - Exportación de archivos `.DBC` compatibles con el formato binario exacto de PC Basket (51.200 bytes).
  - Exportación masiva de todos los equipos en archivo `.ZIP`.

- **Editor de Jugadores (`Jugadores`)**:
  - Edición de los 11 atributos de juego (Velocidad, Salto, Resistencia, Agresividad, Defensa, Tiro 2, Tiro 3, Tiro Libre, Rebotes, Asistencias, Oculto).
  - Cálculo automático y en tiempo real de Media Quinteto y Media Plantilla según las fórmulas inversas del juego original.
  - Generador de medias por especialidad (Veloz, Atlético, Intimidador, Tirador, Creador de juego, Defensor).
  - Control de nacionalidad, color de piel, altura, peso y dorsal.

- **Herramientas de Ejecutable (`MANAGER.EXE`)**:
  - Cambio de temporada de inicio (parcheo binario de 18 offsets de año actual y 41 offsets de año siguiente).
  - Eliminación del Efecto 2000 (anulación del límite de edad de jugadores).
  - Consulta y edición de plazas de competiciones europeas (Euroliga y Eurocup).

- **Importador Proballers.com**:
  - Plantillas preconfiguradas y extracción con generación automatizada de estadísticas y atributos de juego.

- **Codificación Dinamic Multimedia**:
  - Implementación en TypeScript de la tabla de codificación por sustitución de caracteres propia de Dinamic Multimedia (`DinamicEncoding`).
