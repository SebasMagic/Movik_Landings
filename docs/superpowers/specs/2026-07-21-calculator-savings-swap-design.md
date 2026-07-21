# Swap: Savings Calculator into calculator-landing

**Fecha:** 2026-07-21
**Archivo objetivo:** `calculator-landing/index.html`
**Fuente:** `calculator-landing/Movik Savings Calculator (standalone).html`

## Problema

`calculator-landing/index.html` tiene hoy una calculadora de *exposición a comisiones*: el
carrier mete facturación semanal, número de facturas, días de espera, tarifa del factor y
fee de ACH, aprieta un botón y ve cuánto se lleva su factor por semana, mes y año.

El standalone es una calculadora distinta: de *ahorro comparativo*. Misma tarifa del 2%,
pero el carrier elige qué porcentaje de sus facturas financia — el argumento es que un
factor tradicional lo obliga al 100% y Movik no.

Queremos la segunda en la página, sin perder el hero, las secciones de abajo ni el SEO.

## Restricción técnica

El standalone no es HTML plano. Es un componente React del design system Movik empaquetado
como auto-extractor: React 18 UMD (143 KB) + `dc-runtime` (66 KB) + bundle `MovikDS` (78 KB)
+ 4 subsets de Plus Jakarta Sans (59 KB) + template `<x-dc>` (55 KB), todo en base64 y
descomprimido a blobs en runtime. ~400 KB.

`index.html` es vanilla, self-contained, sin build. Traer el bundle rompería ese patrón,
haría el contenido invisible para los crawlers y duplicaría las fuentes.

**Decisión:** portar la calculadora a HTML + JS plano dentro de `index.html`, replicando
lógica y efectos, vestida con el lenguaje visual del hero.

## Decisiones tomadas

| Decisión | Elegido | Razón |
|---|---|---|
| Gate por email | **Se mantiene** | Es el mecanismo de captura del componente |
| Destino de los leads | **localStorage** | No hay backend; se conecta después |
| Enfoque técnico | **Port a vanilla** | Coherencia con la página, 10 KB vs 400 KB |
| Tarifa | **Fija en 2%** | Respeta el copy y el argumento original del standalone |

## Alcance

### Se reemplaza

- El contenido de `.calc-card` (líneas ~151-199): los cinco inputs actuales y el botón
  `calcRun()`.
- El bloque `#results-section` completo (líneas ~202-246): totales semana/mes/año,
  tarjetas de ACH anual y total anual, y el panel "That's the down payment on your next truck".
- La función `calcRun()` y sus helpers en el `<script>` del final.

### Se conserva

- Toda la sección hero salvo la card: video de fondo, gradientes, glow animado, badge
  "QuickPay Calculator · Carriers", H1.
- El contenedor `.calc-card` en sí (glassmorphism, 900px, blur 20px, sombra) — cambia lo
  de adentro, no el envase.
- Las secciones "Why free", FAQ y CTA de cierre.
- El link de WhatsApp `https://wa.me/13392121905`, reubicado como CTA post-unlock.
- La nav, el favicon, los `@keyframes` (`fadeUp`, `glow`), el observer de `[data-reveal]`.

### Fuera de alcance

- `broker-landing/` y `carriers-landing/`.
- Cualquier backend o integración de CRM.
- `site-root/sitemap.xml` (la URL no cambia).

## Diseño

### Layout

Dentro de la card de 900px, en este orden:

1. **Eyebrow** — punto de 6px con `box-shadow:0 0 8px` púrpura + "Live calculator", mono,
   uppercase, tracking amplio.
2. **Fila de toggles** en `grid-2`: `Monthly | Annual` y `Yes, with someone else | No, not yet`.
   Cada uno es un par de botones dentro de un contenedor con fondo `rgba(255,255,255,.05)`,
   borde hairline y padding de 4px.
3. **Fila de inputs** en `grid-2`: volumen de facturas (prefijo `$`, default `100,000`) y
   número de camiones (sufijo `trucks`, placeholder `e.g. 12`, vacío por default).
4. **Slider**: label a la izquierda, porcentaje en púrpura a la derecha; `range` de 70 a 100
   paso 10; cuatro ticks clicables debajo; nota "Movik lets you choose — traditional factors
   force 100%."

Debajo de la card, el bloque de resultados: dos barras comparativas, badge "You'd keep",
línea por-camión condicional. Debajo, el CTA.

En viewport < 900px las dos grids colapsan a una columna, siguiendo las media queries que
ya existen en la página.

### Cálculo

Tarifa constante `RATE = 0.02`.

```
mensual     = periodo === 'annual' ? monto / 12 : monto
tradicional = mensual × RATE
movik       = mensual × (pct / 100) × RATE
ahorro      = tradicional − movik
ahorroPct   = tradicional > 0 ? (ahorro / tradicional) × 100 : 0
```

`hasFactor` no entra en la cuenta — solo cambia la etiqueta de la barra superior entre
"What you pay today (100% financed)" y "Market-standard factor (100% financed)".

Todo se formatea con `'$' + Math.round(n).toLocaleString('en-US')`.

### Efectos a replicar

| Efecto | Implementación |
|---|---|
| Glow radial | `div` absoluto, `radial-gradient(closest-side,...)`, `pointer-events:none` |
| Punto vivo | 6px, `border-radius:50%`, `box-shadow:0 0 8px rgba(130,54,252,.55)` |
| Toggle activo | fondo `#8236FC`, texto blanco, `transition` de color 150ms |
| Miles en vivo | port de `liveFormatDigits`: cuenta dígitos antes del cursor, reformatea, restaura la posición con `setSelectionRange` |
| Ticks | `<span>` clicable; el activo en púrpura y semibold |
| Barras | gris al 100% fijo; púrpura con `width: pct%`, con transición |
| Por camión | se muestra solo si `trucks > 0` |
| Gate | `filter:blur(9px)` + `pointer-events:none` + `user-select:none` |
| Error de validación | borde `#E33D3D` en el campo inválido |

Recálculo en vivo con cada `input` / `click`. No hay botón "calcular".

### Gate y leads

Estado inicial: resultados borrosos, botón "See my exact savings →".
Al click: se oculta el botón y aparece el formulario (nombre, email de trabajo, teléfono
opcional) con "Unlock my results" y "Back to calculator".

Validación: nombre no vacío y email contra `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Si falla, borde
rojo en el campo culpable y el mensaje "Enter your name and a valid email."

Si pasa, se arma el objeto lead con `name`, `email`, `phone`, `trucks`, `billingPeriod`,
`invoiceVolume`, `pctFunded`, `estimatedMonthlySavings`, `estimatedSavingsPerTruck`,
`source: 'movik-savings-calculator'` y un `timestamp`. Se hace push a un array en
`localStorage` bajo la clave `movik_calc_leads`, se loguea en consola y se quita el blur.

El CTA post-unlock es el link de WhatsApp existente, con el label del standalone: "Talk to
our team about switching →", manteniendo el ícono y los estilos de hover que ya usa la
página.

La persistencia vive en una función `saveLead(lead)` aislada, para que conectar un backend
más adelante sea cambiar solo esa función.

El desbloqueo es en memoria, no persistente: mover el slider o cambiar inputs recalcula sin
volver a pedir el email, pero recargar la página vuelve al estado borroso. Los leads en
`localStorage` son solo un buzón de captura, no una sesión.

### Copy y SEO

El gate contradice lo publicado. Cambios:

| Ubicación | Actual | Nuevo |
|---|---|---|
| Subtítulo del H1 | "...Free, and no sign-up." | Sin la promesa de no-registro |
| `<meta name="description">` | "...No sign-up required." | Reescrito al ángulo de ahorro |
| `og:description` | "...Free, no sign-up." | Idem |
| `twitter:description` | "...Free, no sign-up." | Idem |
| JSON-LD, `description` del WebApplication | "...No sign-up required." | Reescrito |
| JSON-LD, FAQ "Do I have to sign up...?" | "No." | Reescrita: los resultados detallados requieren email |
| FAQ #1 en la página (`toggleFaq(0)`) | mismo texto | Idem |

El H1 ("You make $10K and you don't keep $10K. Know where it goes?") se mantiene — sigue
funcionando con el nuevo ángulo.

Las FAQ #2 y #3 hablan de ACH y de los dos totales anuales, que dejan de existir. Se
reescriben hacia el nuevo modelo: qué significa el % financiado y de dónde sale el 2%.

## Verificación

Al terminar, comprobar en el navegador:

1. Escribir en el campo de volumen mantiene el cursor donde corresponde y agrega comas.
2. Mover el slider encoge la barra púrpura y actualiza los tres números en vivo.
3. Click en un tick salta a ese porcentaje y lo pinta de púrpura.
4. Con camiones en 0 la línea por-camión no aparece; con 12 sí.
5. Los resultados arrancan borrosos y no se pueden seleccionar ni copiar.
6. Email inválido pinta el borde de rojo y no desbloquea.
7. Email válido desbloquea, y `localStorage.getItem('movik_calc_leads')` tiene el registro.
8. Annual divide el monto por 12 antes de calcular.
9. A 375px de ancho las grids colapsan y nada desborda.
10. Ninguna cadena "no sign-up" queda en el archivo.
