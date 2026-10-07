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

## Versión Descargable Offline & Releases en GitHub

El repositorio cuenta con un flujo automatizado de integración continua con GitHub Actions (`.github/workflows/release.yml`):

1. **Generación Automática en Release / Tags**:
   - Cada vez que se crea un tag (ej. `v1.0.0`) o se publica una **Release** en GitHub, se compila la versión autónoma.
   - Se empaqueta en un archivo descargable: `Editor-PC-Basket-Offline-v*.zip`.

2. **Uso 100% Local y Sin Internet**:
   - Descomprime el archivo descargado.
   - Haz doble clic en `Abrir-Editor-PC-Basket.bat` (Windows), `Abrir-Editor-PC-Basket.sh` (Linux), o abre directamente `index.html` en cualquier navegador web moderno.
   - No requiere servidor web, conexión a internet ni dependencias instaladas en el sistema.
   - Soporta importación, edición y exportación de ficheros `.DBC` y `.ZIP` totalmente en local.

