# ForMeta — Auditoría de Encaje de Marca para la Landing

## Objetivo

Detectar qué partes de la landing no encajan del todo con el estilo de marca de ForMeta, con foco en:

- composición y retícula
- simetría y alineaciones
- espaciado y ritmo vertical
- cajas, bordes y contención
- jerarquía tipográfica
- limpieza visual y ornamento

Esta auditoría se apoya en `design.md` y en la implementación actual de la landing pública.

## Matriz de evaluación

### 1. Composición y retícula

Preguntas de control:

- ¿La sección se percibe editorial o simplemente centrada?
- ¿Existe una relación clara entre columna principal y columna secundaria?
- ¿La asimetría se siente intencional o accidental?

Criterio de marca:

- composición asimétrica con equilibrio
- mucho aire y retícula clara
- el contenido debe respirar más en horizontal que en vertical

### 2. Simetría y alineaciones

Preguntas de control:

- ¿Los bloques izquierdos y derechos comparten una lógica de arranque visual?
- ¿Los bordes y gutters repiten una regla o cambian sin motivo?
- ¿Las cajas parecen ordenadas entre sí?

Criterio de marca:

- jerarquía visible, no agresiva
- pocas formas, bien colocadas
- estructura antes que efecto

### 3. Espaciado y ritmo vertical

Preguntas de control:

- ¿El paso entre secciones marca avance o solo separación?
- ¿El hero entrega una entrada clara sin huecos extraños?
- ¿El ritmo general es sereno o irregular?

Criterio de marca:

- bloques muy espaciados
- ritmo lento y limpio
- control, no urgencia

### 4. Cajas, bordes y contención

Preguntas de control:

- ¿Las cajas aportan estructura o solo añaden capas?
- ¿Hay consistencia entre tarjetas, paneles y bloques técnicos?
- ¿Los bordes, radios y fondos están unificados?

Criterio de marca:

- tarjetas con borde o divisiones finas, no sombras pesadas
- ornamentación mínima
- no añadir cajas si no mejoran estructura

### 5. Jerarquía tipográfica

Preguntas de control:

- ¿Los titulares dominan con calma o compiten entre sí?
- ¿El tamaño y ancho del texto ayudan a leer rápido?
- ¿La mezcla display/mono sostiene el sistema con claridad?

Criterio de marca:

- grandes titulares con serif expresiva
- etiquetas técnicas en monoespaciada
- jerarquía clara por tamaño, interlineado y color

### 6. Limpieza visual y ornamento

Preguntas de control:

- ¿Los fondos y acentos construyen atmósfera o distraen?
- ¿Hay efectos que se acercan demasiado a un look de landing promocional?
- ¿La geometría y las texturas están bien medidas?

Criterio de marca:

- geometría orbital o meridiana como recurso principal
- grano muy sutil
- animaciones lentas y discretas
- evitar glassmorphism dominante y exceso de decoración

## Checklist priorizada

### P1

#### 1. La lógica de contención no está completamente unificada

- Sección afectada: sistema completo de landing
- Observación: la página ya no está ni full-bleed ni boxed estrecha, pero todavía mezcla varias lógicas de contenedor: `main` con `max-width`, secciones con `--section-inset`, header y footer con su propio marco, e interiores como `stack` con una segunda caja fuerte.
- Principio vulnerado: retícula clara, composición equilibrada, orden visual.
- Qué no encaja: la marca pide estructura serena; ahora la sensación de contención cambia según el bloque y eso debilita la limpieza global.
- Corrección recomendada: definir una sola gramática de ancho con tres niveles fijos:
  - ancho exterior de página
  - inset interior de sección
  - ancho de lectura para texto
  y hacer que hero, statement, servicios, stack, IApps y contacto la respeten con mínimas excepciones.

#### 2. Infraestructura introduce una caja demasiado protagonista respecto al resto del sistema

- Sección afectada: infraestructura
- Observación: `stack-section` combina una caja exterior fuerte, fondo degradado, overlay adicional y luego otra malla interior con paneles.
- Principio vulnerado: ornamentación mínima, pocas formas bien colocadas, control antes que efecto.
- Qué no encaja: el bloque se acerca más a una pieza “especial” que a una continuación natural de la landing editorial.
- Corrección recomendada: reducir una capa de contención visual:
  - o suavizar mucho la caja exterior
  - o mantener la caja exterior y simplificar la malla interior
  para que el bloque siga siendo técnico sin parecer una subsección encapsulada aparte.

#### 3. El sistema de cajas no mantiene la misma sobriedad entre servicios, infraestructura e IApps

- Sección afectada: servicios, infraestructura, IApps
- Observación: servicios usa grid plano y limpio; infraestructura usa panel técnico denso; IApps usa tarjetas flotantes con blur y sombra.
- Principio vulnerado: consistencia editorial y estructura precisa.
- Qué no encaja: cada bloque resuelve “caja” de una manera distinta y la landing pierde continuidad formal.
- Corrección recomendada: unificar el vocabulario de paneles:
  - mismo grosor óptico de borde
  - misma familia de fondos translúcidos o mate
  - misma agresividad de sombra
  - misma lógica de radios

### P2

#### 4. El hero y el statement aún no cierran una alineación editorial del todo limpia

- Sección afectada: hero + statement
- Observación: el hero trabaja en dos columnas, pero el statement entra con otra estructura y otra tensión visual. La transición funciona, aunque todavía se percibe más como cambio de layout que como continuidad narrativa.
- Principio vulnerado: ritmo limpio, jerarquía serena, progresión controlada.
- Qué no encaja: el primer tramo de la landing debería dar una sensación más continua entre manifiesto, explicación y primera decisión.
- Corrección recomendada: alinear mejor los arranques horizontales entre hero y statement:
  - revisar ancho de columna textual
  - revisar distancia entre el final del hero y el statement
  - decidir si el statement debe “caer” bajo la columna izquierda o equilibrar claramente ambas columnas

#### 5. Hay asimetrías intencionales, pero algunas siguen pareciendo accidentales

- Sección afectada: hero, identidad, contacto
- Observación: varios bloques usan dos columnas con pesos distintos, pero no siempre comparten una línea maestra clara entre label, titular y cuerpo.
- Principio vulnerado: composición asimétrica con equilibrio.
- Qué no encaja: la asimetría editorial debe sentirse deliberada; si cambia demasiado de una sección a otra, parece falta de sistema.
- Corrección recomendada: fijar una regla repetible de alineación:
  - labels siempre en columna secundaria o siempre en columna de arranque
  - títulos con un mismo punto de inicio visual
  - cuerpos largos con un ancho consistente

#### 6. La relación entre header y hero ya está corregida, pero conviene consolidarla como regla de sistema

- Sección afectada: header + hero
- Observación: el hueco superior se ha reducido, pero el primer bloque sigue dependiendo de ajustes finos de padding más que de una regla documentada de convivencia entre sticky header y primer viewport.
- Principio vulnerado: estructura antes que parche.
- Qué no encaja: si este equilibrio no queda fijado como sistema, tenderá a romperse en futuras iteraciones.
- Corrección recomendada: documentar y mantener una regla única para:
  - altura visual del header
  - `scroll-margin-top`
  - padding superior del primer bloque
  para no volver a introducir doble offset.

#### 7. El bloque IApps está visualmente bien encaminado, pero aún es el más cercano a un lenguaje de “cards decorativas”

- Sección afectada: IApps
- Observación: los bloques absolutos funcionan, pero el blur, la sombra y el apilado aún pueden sentirse más UI ambientada que sistema editorial técnico.
- Principio vulnerado: bloques técnicos con transparencias suaves y bordes finos, sin glassmorphism dominante.
- Qué no encaja: la marca pide una técnica sobria; el bloque está cerca, pero todavía algo cargado.
- Corrección recomendada: bajar peso de sombra y blur, y reforzar más la lógica de capas por posición y línea que por efecto visual.

#### 8. El contacto final es claro, pero la caja tipográfica no remata la landing con tanta precisión como podría

- Sección afectada: contacto
- Observación: el cierre tiene buen tono, pero la relación entre gran titular y panel derecho aún se ve más funcional que compositivamente memorable.
- Principio vulnerado: gran cierre editorial, una sola acción clara, calma visual.
- Qué no encaja: el final debería sentirse inevitable y limpio, no solo correcto.
- Corrección recomendada: ajustar el peso relativo entre h2 y panel:
  - o ampliar un poco la escala del cierre
  - o compactar ligeramente el panel derecho
  - o dar más aire al enlace de contacto para que funcione como último gesto tipográfico

### P3

#### 9. Los divisores funcionan, pero todavía no cosen del todo el ritmo general

- Sección afectada: sistema de separación entre bloques
- Observación: los divisores son correctos, pero no siempre ayudan a que una sección “descanse” antes de la siguiente.
- Principio vulnerado: ritmo lento y limpio.
- Qué no encaja: separan, pero no siempre estructuran.
- Corrección recomendada: revisar espaciado encima y debajo de cada divisor para convertirlos en pausas reales, no solo líneas.

#### 10. Algunos títulos de sección comparten escala, pero no siempre comparten densidad visual

- Sección afectada: identidad, servicios, infraestructura, IApps, contacto
- Observación: la escala base es buena, pero según ancho de línea y longitud del texto unos títulos pesan mucho más que otros.
- Principio vulnerado: jerarquía visible, no agresiva.
- Qué no encaja: el sistema tipográfico es correcto, pero aún no está del todo calibrado en masa visual.
- Corrección recomendada: revisar no solo `font-size`, también:
  - longitud de línea
  - salto manual de líneas
  - ancho máximo del titular

#### 11. El hero visual respira bien, pero su caja todavía puede integrarse mejor con la columna tipográfica

- Sección afectada: hero
- Observación: la marca orbital funciona, pero su frame y el peso del visual pueden sentirse algo independientes del bloque izquierdo.
- Principio vulnerado: equilibrio entre texto y geometría.
- Qué no encaja: más que una sola composición, por momentos parece texto a un lado y símbolo al otro.
- Corrección recomendada: ajustar tamaño, alineación vertical o distancia entre columnas para que el símbolo se lea como contraparte del titular y no como módulo autónomo.

## Hallazgos por sección

### Hero

Sí encaja:

- uso claro de serif expresiva
- gesto itálico contenido
- geometría orbital coherente con marca
- CTA integrada como texto

No encaja del todo:

- relación entre columna de copy y columna visual todavía algo suelta
- composición fuerte, pero no completamente cosida en una sola masa editorial

### Statement

Sí encaja:

- actúa como bloque aclaratorio
- mejora comprensión rápida
- mantiene tono sobrio

No encaja del todo:

- introduce una nueva lógica de composición que no termina de heredar la del hero
- la simetría entre sus dos columnas podría estar más afinada

### Identidad

Sí encaja:

- buena presencia mono + numeral + titular editorial
- ritmo sereno

No encaja del todo:

- la relación entre columna de intro y cuerpo puede verse un poco mecánica frente a otras secciones

### Servicios

Sí encaja:

- grid sobrio
- numeración clara
- contención limpia

No encaja del todo:

- el grid es el bloque más resuelto del sistema y deja en evidencia que otras secciones aún no tienen igual disciplina

### Infraestructura

Sí encaja:

- tono técnico contenido
- microcopy sobrio

No encaja del todo:

- demasiadas capas de caja
- protagonismo visual algo superior al necesario

### IApps

Sí encaja:

- estructura conceptual clara
- visual tipo sistema

No encaja del todo:

- aún ligeramente cerca de un lenguaje de tarjetas ambientadas
- efecto visual más presente de lo ideal

### Contacto

Sí encaja:

- contacto directo
- cero ruido comercial
- buen gesto tipográfico final

No encaja del todo:

- el remate compositivo puede ser más elegante y más definitivo

## Issues sistémicos

### Sistema 1. Gramática de contenedor

Problema:

- la landing aún no tiene una sola ley de contención suficientemente clara

Impacto:

- genera pequeñas tensiones de orden y simetría entre bloques

Acción:

- fijar un sistema único de ancho exterior, inset interior y ancho de lectura

### Sistema 2. Vocabulario de cajas

Problema:

- servicios, infraestructura e IApps hablan dialectos distintos de panel

Impacto:

- se debilita la coherencia de marca

Acción:

- reducir el número de variantes y unificar bordes, fondos, radios y sombras

### Sistema 3. Regla de alineación editorial

Problema:

- no todas las secciones parecen construidas sobre la misma línea maestra

Impacto:

- la asimetría se siente a veces accidental

Acción:

- definir una regla de arranque para labels, titulares y cuerpos

## Reglas de control para futuras iteraciones

- No añadir una caja nueva si no resuelve una necesidad estructural clara.
- No introducir una nueva lógica de panel para una sola sección.
- No usar asimetría si no se puede explicar con una regla de composición.
- No compensar desorden de layout con color, blur o textura.
- No tocar anchos, gutters o padding de una sección sin revisar el sistema completo.
- No hacer que un bloque técnico tenga más protagonismo visual que el hero.
- No romper la relación entre header, primer viewport y primer bloque.

## Siguiente paso recomendado

Traducir esta auditoría a una segunda checklist de correcciones de diseño, separada en dos tandas:

1. correcciones sistémicas de contenedor, alineación y cajas
2. refinamientos locales en hero, IApps y contacto
