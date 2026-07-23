# Handoff — Landings Movik

Última actualización: 2026-07-21

Este documento es para quien va a continuar el trabajo. Explica qué está montado,
cómo se genera, qué falta y qué decisiones **no** hay que deshacer.

---

## ⚠️ LO PRIMERO: nada de esto está en git

Todo el trabajo descrito aquí está **sin commitear**. Si alguien clona el repo, no
existe. Antes de cualquier otra cosa:

```
Sin trackear:  escape-guide-landing/   i18n/   tools/
               carriers-landing/dist/  broker-landing/dist/
Modificados:   carriers-landing/index.html   broker-landing/index.html
               site-root/robots.txt          site-root/sitemap.xml
```

Además hay **16 commits en la rama `calculator-savings-swap` sin mergear a
`master`**. `master` sigue en `d0273cd`, que es anterior a toda la calculadora
nueva.

**Acción:** commitear lo pendiente y decidir el merge de esa rama antes de seguir.

---

## 1. Qué está en vivo

`https://movik-landing.vercel.app` — **es staging, no producción.** El destino
final es `movik.us`.

| Ruta | Idioma | Estado |
|---|---|---|
| `/` y `/es/` (home hub) | EN + ES | al día |
| `/carriers/` · `/es/carriers/` | EN + ES | al día |
| `/brokers/` · `/es/brokers/` | EN + ES | al día |
| `/escape-guide/` · `/es/escape-guide/` | EN + ES | al día |
| `/factoring-calculator/` · `/es/factoring-calculator/` | EN + ES | al día |

Las 10 páginas pasan `tools/audit.js` con **0 errores y 0 advertencias**:
title/description dentro de límite, hreflang recíproco, un H1 por página,
sin títulos ni descripciones duplicadas, JSON-LD válido.

Redirects permanentes (308) de `/broker` → `/brokers/` y `/calculator` →
`/factoring-calculator/`, para no romper links viejos.

---

## 2. Cómo está armado

Tres capas. **No se editan las dos últimas a mano.**

```
FUENTE (se edita)                    BUILD (generado)              DEPLOY (generado)
─────────────────────────────────────────────────────────────────────────────────
carriers-landing/index.html   ─┐
i18n/carriers.es.json          ├─►  carriers-landing/dist/    ─►  deploy/…/carriers/index.html
                               │      carriers-ENG.html           deploy/…/es/carriers/index.html
                               │      carriers-ESP.html
broker-landing/index.html     ─┤
i18n/brokers.es.json           ├─►  broker-landing/dist/      ─►  deploy/…/brokers/index.html
                               │      brokers-ENG.html             deploy/…/es/brokers/index.html
                               │      brokers-ESP.html
escape-guide-landing/index.html┘
  (trae su diccionario adentro) ─►  escape-guide-landing/dist/─►  deploy/…/escape-guide/index.html
                                      escape-guide-ENG.html        deploy/…/es/escape-guide/index.html
                                      escape-guide-ESP.html

home-landing/index.html       ─┐
i18n/home.es.json              ├─►  home-landing/dist/        ─►  deploy/…/index.html   (raíz, EN)
                               │      home-ENG.html               deploy/…/es/index.html (ES)
                               │      home-ESP.html
calculator-landing/index.html ─┐
i18n/calculator.es.json + calc.js ─► calculator-landing/dist/ ─► deploy/…/factoring-calculator/…
```

**La fuente en inglés es el `index.html` de cada carpeta.** El español sale de su
JSON de traducción. Dos casos especiales: la escape guide trae su diccionario ES/EN
dentro del propio archivo (build dedicado), y la home usa las URLs raíz `/` y `/es/`
(build dedicado, `tools/build-home.js`).

### Comandos

```bash
node tools/i18n.js check                     # ¿falta alguna frase por traducir?
node tools/i18n.js extract <archivo.html>    # lista las frases traducibles
node tools/i18n.js build [pagina]            # genera ENG + ESP en dist/ (carriers, brokers, calculator)
node tools/build-escape-guide.js             # genera las dos guías
node tools/build-home.js                     # genera la home hub (EN + ES)
node tools/deploy-staging.js                 # arma deploy/movik-landing/
node tools/audit.js                          # auditoría SEO/estructura (0 errores = listo)
cd deploy/movik-landing && vercel deploy --prod --yes
```

**Orden de un rebuild completo:** los tres `build*` → `deploy-staging` → `audit`.

`check` es la red de seguridad: falla si quedó texto sin traducir. Correrlo antes
de cada build. Hoy: carriers 89/89, brokers 79/79, calculator 60/60, y `audit.js`
pasa con 0 errores / 0 advertencias.

### Por qué los archivos se despliegan como `index.html`

Los `dist/` tienen nombres identificables (`carriers-ESP.html`) para trabajar,
pero se copian como `index.html` dentro de su carpeta. Si se subieran con su
nombre, la URL sería `movik.us/carriers/carriers-ENG.html` — fea de compartir y
peor para SEO.

---

## 3. Pendientes, por prioridad

### 1. Los leads de la escape guide no se guardan

En `escape-guide-landing/index.html`, la constante `LEAD_WEBHOOK` está vacía. El
formulario valida, abre WhatsApp y entrega el PDF, pero **el nombre y el teléfono
solo salen por `console.log`**. Si alguien llena el form hoy, esa data se pierde;
solo queda el contacto si la persona efectivamente escribe por WhatsApp.

Pegar una URL de Zapier/Make/n8n en esa constante y volver a construir. El payload
ya va armado con `source: 'magnet_escape_guide'`, idioma, y la fecha de fin de
contrato (que es la que sirve para reactivar a 60 días).

### 2. Nadie ha visto las páginas renderizadas en un navegador

Todo se verificó por HTTP, estructura y auditoría automática, pero **no
visualmente**. Revisar sobre todo: la línea punteada que conecta los 3 pasos de la
escape guide (`calc()` sobre el grid, puede necesitar ajuste), y la nueva home hub
en móvil.

### 3. El PDF en inglés choca con la regla de compliance

Los dos PDFs de la guía **no son traducciones, son documentos distintos**:

| | Español | Inglés |
|---|---|---|
| Título | Cómo salir de tu factoring sin quedarte sin caja | How to Escape Your Factoring Contract |
| Secciones | 8 | 5 |
| Menciona Movik | sí | no |
| Menciona UCC | no | **sí, 4 veces** |

El brief de copy pedía explícitamente cero menciones de UCC y ningún porcentaje de
fee. El PDF español cumple; el inglés trae UCC (5 veces) y porcentajes de ejemplo
(`3%`, `2.5%`, `4.5%`). La landing ya describe correctamente a cada uno por
separado, pero **el documento inglés necesita una revisión de compliance** antes
de mandarle tráfico.

**Nota (2026-07-22):** el cliente reexportó `carriers-landing/Escape Guide.pdf`,
pero el texto es **idéntico** al desplegado — las menciones de UCC y los
porcentajes siguen ahí. Cambió a nivel binario (imágenes), no el contenido. Si la
intención era quitar el UCC, ese cambio no quedó en el archivo. El PDF que sirve la
web sigue siendo el mismo; no lo reemplacé porque no aportaba nada nuevo y mantenía
el problema de compliance.

---

## 4. Decisiones deliberadas — no deshacer

### El staging está en `noindex` a propósito

Dos capas: `robots.txt` con `Disallow: /` y un header `X-Robots-Tag: noindex,
nofollow, noarchive` en `deploy/movik-landing/vercel.json`.

**Por qué:** si estas URLs de Vercel se indexan, compiten con `movik.us` cuando
las páginas se muden, y las de staging llevan ventaja por antigüedad. El peor
escenario es que Google decida que la buena es la de staging.

Dos capas porque `robots.txt` solo pide que no te rastreen — no impide que la URL
aparezca listada si alguien la enlaza desde fuera. El header es el que fuerza la
exclusión, y vive en `vercel.json`, no en un archivo que se pueda sobrescribir al
sincronizar carpetas.

Las versiones de producción de `robots.txt`, `sitemap.xml` y `llms.txt` están en
`site-root/`, **sin desplegar, a propósito.**

### Los canonical ya apuntan a `movik.us`

Aunque ese dominio todavía no sirve estas páginas. Es el modo seguro de fallar: si
el día de la mudanza alguien olvida actualizarlos y quedaron apuntando a Vercel,
se le estaría diciendo a Google que la página buena es la de staging. Apuntando a
`movik.us` desde ya, olvidarlo no cuesta nada. Y con `noindex` activo hoy no
tienen efecto.

### Las páginas ES referencian los assets del EN

`/es/escape-guide/` apunta a `/escape-guide/uploads/…` en vez de tener su propia
copia. Evita duplicar 3 MB de PDFs. Si se mueve o renombra la carpeta inglesa, se
rompen los assets del español.

### La escape guide se prerenderiza

Su índice, los 3 pasos y el ticker los generaba JavaScript dentro de contenedores
vacíos. `tools/build-escape-guide.js` los escribe ya resueltos en el HTML,
**llamando a las propias funciones de render de la página** dentro de un DOM
simulado — así el HTML estático no puede desviarse de lo que hace el navegador.

Resultado: de ~440 a ~2.700 palabras visibles para un crawler que no ejecute JS.

El toggle ES/EN también dejó de ser un intercambio en memoria: son enlaces reales
entre las dos URLs, con `hreflang` cruzado y `x-default`.

---

## 5. Checklist de migración a movik.us

Está también en `deploy/movik-landing/STAGING-README.txt`.

1. Borrar el bloque `headers` de `vercel.json` (o retirar el deployment de Vercel).
2. Copiar `site-root/robots.txt` sobre el `robots.txt` del deploy.
3. Copiar `site-root/sitemap.xml` y `site-root/llms.txt` a la raíz del deploy.
4. Verificar que los canonical, `og:url` y los `url` del JSON-LD apunten a
   `movik.us` (ya deberían).
5. Correr `node tools/audit.js` — debe dar 0 errores.
6. Dar de alta el sitemap en Google Search Console.

**Orden importa:** no quitar el `noindex` antes de que las páginas existan en
`movik.us`, o Google indexa staging.

---

## 6. Estructura de URLs acordada

Subdirectorios, no subdominios. Los subdirectorios consolidan la autoridad del
dominio: cada enlace que gane la guía de escape fortalece también a carriers. Con
subdominios cada página arrancaría de cero, porque Google los trata casi como
sitios separados.

```
movik.us/
movik.us/carriers/              movik.us/es/carriers/
movik.us/brokers/               movik.us/es/brokers/
movik.us/escape-guide/          movik.us/es/escape-guide/
movik.us/factoring-calculator/  movik.us/es/factoring-calculator/  (pendiente)
```
