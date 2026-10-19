# deorta-sirem-ui

**Librería Angular de componentes SIREM** · 🇬🇧 [English version](./README.md)

Librería de componentes **Angular 21 standalone** con **Tailwind CSS v4**, iconos Flaticon UIcons, iconos duotone (Phosphor) y registro de iconos Streamline Ultimate Duotone. Incluye modo claro/oscuro por tokens y un catálogo de demo con una página en vivo por componente (`npm start`).

## Instalación

### Consumir en otro proyecto

La librería no empaqueta CSS: el consumidor define los tokens SIREM. Snippet mínimo en el `styles.css` de la app:

```bash
npm i deorta-sirem-ui @flaticon/flaticon-uicons echarts
```

```css
/* app consumidora: styles.css */
@import 'tailwindcss';
@import '@flaticon/flaticon-uicons/css/regular/all.css';
@import '@flaticon/flaticon-uicons/css/bold/all.css';
@import '@flaticon/flaticon-uicons/css/solid/all.css';
@import '@flaticon/flaticon-uicons/css/brands/all.css';
@import 'deorta-sirem-ui/src/lib/theme/sirem-theme.css';
```

```ts
// app.config.ts — solo si usas optionsEndpoint (opciones remotas)
import { provideHttpClient } from '@angular/common/http';
providers: [provideHttpClient()];
```

### Tokens semánticos

Los estilos de la librería usan **solo** tokens `--sirem-*`. La forma más corta de tenerlos todos (con su variante oscura) es importar el fichero de tema:

```css
@import 'deorta-sirem-ui/src/lib/theme/sirem-theme.css';
```

### Modo oscuro

Se activa con `document.documentElement.dataset.theme = 'dark'` (`light` por defecto). Cada `--sirem-*` tiene override en `:root[data-theme='dark']`; los radios no dependen del tema.

## Referencia de la API

Todas las propiedades documentadas de cada artefacto: tipo, valor por defecto, para qué sirve, valores admitidos y qué devuelve cada salida. Debajo aparecen los esquemas, tipos e interfaces que usa cada uno.

### Contenido

- **Componentes**
    - [`SiremAdminLayout`](#siremadminlayout)
    - [`SiremAgenda`](#siremagenda)
    - [`SiremAvatar`](#siremavatar)
    - [`SiremBadge`](#sirembadge)
    - [`SiremBreadcrumbs`](#sirembreadcrumbs)
    - [`SiremButton`](#sirembutton)
    - [`SiremCalendar`](#siremcalendar)
    - [`SiremCard`](#siremcard)
    - [`SiremCardList`](#siremcardlist)
    - [`SiremChart`](#siremchart)
    - [`SiremCheckbox`](#siremcheckbox)
    - [`SiremCodeEditor`](#siremcodeeditor)
    - [`SiremCollapsible`](#siremcollapsible)
    - [`SiremCollapsibleGroup`](#siremcollapsiblegroup)
    - [`SiremConfirmDialog`](#siremconfirmdialog)
    - [`SiremDataTable`](#siremdatatable)
    - [`SiremDate`](#siremdate)
    - [`SiremDateChip`](#siremdatechip)
    - [`SiremDatepicker`](#siremdatepicker)
    - [`SiremDrawer`](#siremdrawer)
    - [`SiremDuotoneIcon`](#siremduotoneicon)
    - [`SiremDynamicForm`](#siremdynamicform)
    - [`SiremEmptyState`](#sirememptystate)
    - [`SiremFiIcon`](#siremfiicon)
    - [`SiremFieldGroup`](#siremfieldgroup)
    - [`SiremImageUpload`](#siremimageupload)
    - [`SiremInput`](#sireminput)
    - [`SiremInvoiceEditor`](#sireminvoiceeditor)
    - [`SiremList`](#siremlist)
    - [`SiremModal`](#siremmodal)
    - [`SiremMultiSelect`](#siremmultiselect)
    - [`SiremNavbar`](#siremnavbar)
    - [`SiremOverlayViewport`](#siremoverlayviewport)
    - [`SiremPageHeader`](#sirempageheader)
    - [`SiremPopupCard`](#sirempopupcard)
    - [`SiremRadioGroup`](#siremradiogroup)
    - [`SiremRichText`](#siremrichtext)
    - [`SiremSearchField`](#siremsearchfield)
    - [`SiremSearchPalette`](#siremsearchpalette)
    - [`SiremSegmented`](#siremsegmented)
    - [`SiremSelect`](#siremselect)
    - [`SiremSheet`](#siremsheet)
    - [`SiremSidebar`](#siremsidebar)
    - [`SiremSparkline`](#siremsparkline)
    - [`SiremStatCard`](#siremstatcard)
    - [`SiremStreamlineIcon`](#siremstreamlineicon)
    - [`SiremSwitch`](#siremswitch)
    - [`SiremTextarea`](#siremtextarea)
    - [`SiremTimeline`](#siremtimeline)
    - [`SiremTopbar`](#siremtopbar)
    - [`SiremUserMenu`](#siremusermenu)
- **Directivas**
    - [`SiremAutofocusDirective`](#siremautofocusdirective)
    - [`SiremClickOutsideDirective`](#siremclickoutsidedirective)
    - [`SiremNumbersOnlyDirective`](#siremnumbersonlydirective)
    - [`SiremOverlayTrigger`](#siremoverlaytrigger)
    - [`SiremSticky`](#siremsticky)
    - [`SiremTooltipDirective`](#siremtooltipdirective)
- **Pipes**
    - [`SiremAgePipe`](#siremagepipe)
    - [`SiremMoneyPipe`](#siremmoneypipe)
    - [`SiremPhonePipe`](#siremphonepipe)

## Componentes

Componentes standalone con selector `sirem-*`.

### `SiremAdminLayout`

Selector: `sirem-admin-layout`

Contenedor maestro de la app autenticada (equivale a `lo-admin-layout`)…

#### Entradas

- **`fullscreen`** · `boolean` · _por defecto `false`_
    Oculta el chrome (sidebar, topbar, navbar) para llenar la ventana; doble vía.
- **`mainPadding`** · `'none' | 'sm' | 'md'` · _por defecto `'md'`_
    Relleno del área de contenido: `md` (defecto), `sm` o `none` para contenido a sangre (la fachada gestiona su propio padding).
    - **Valores:**
      - `none` — Sin relleno: el contenido va a sangre.
      - `sm` — Relleno corto.
      - `md` — Relleno base. Es el valor por defecto.
- **`mainInsetLeft`** · `string | null`
    Desplazamiento izquierdo del main cuando el sidebar está fuera del flujo (`pinned`/fijo, p. ej. `15.75rem` = margen + ancho del rail flotante o `4.75rem` colapsado). Así el header y el contenido empiezan donde termina el navbar. Solo aplica en desktop; en móvil el sidebar es un drawer off-canvas y el main no se desplaza.

### `SiremAgenda`

Selector: `sirem-agenda` · [Demo](projects/demo/src/app/pages/agenda-demo)

Agenda multi-vista tipo Google Calendar (`sirem-agenda`).

#### Entradas

- **`events`** · `SiremAgendaEvent[]` · _por defecto `[]`_
    Eventos de la agenda.
- **`mode`** · `SiremAgendaMode` · _por defecto `'week'`_
    Vista activa (doble vía).
    - **Valores:**
      - `day` — Un día, con las horas en columnas.
      - `week` — La semana completa, con los 7 días.
      - `month` — Rejilla del mes.
      - `list` — Lista cronológica sin rejilla.
- **`date`** · `Date` · _por defecto `new Date()`_
    Día enfocado (doble vía); gobierna la semana y el mes visibles.
- **`modes`** · `SiremAgendaMode[]` · _por defecto `['day', 'week', 'month', 'list']`_
    Vistas que se ofrecen; el orden es el del selector.
- **`locale`** · `string` · _por defecto `'es-ES'`_
    Idioma de los rótulos.
- **`weekStartsOn`** · `0 | 1` · _por defecto `1`_
    Primer día de la semana (`1` = lunes).
- **`startHour`** · `number` · _por defecto `7`_
    Primera hora visible de la rejilla.
- **`endHour`** · `number` · _por defecto `21`_
    Hora final de la rejilla (exclusiva).
- **`hourHeight`** · `number` · _por defecto `64`_
    Alto en px de cada celda de hora (1 h de rejilla).
- **`maxPerDay`** · `number` · _por defecto `2`_
    Eventos visibles por día en el mes antes de «+N más».
- **`listDays`** · `number` · _por defecto `30`_
    Días que abarca la vista de lista.
- **`now`** · `Date | null`
    Reloj fijo (pruebas y capturas); `null` usa la hora real.
- **`responsive`** · `boolean` · _por defecto `true`_
    Adapta vistas y densidad al ancho del contenedor.
- **`sticky`** · `SiremAgendaSticky` · _por defecto `'none'`_
    Qué cabeceras se pegan al hacer scroll de la página.
    - **Valores:**
      - `none` — Sin nada fijo al hacer scroll.
      - `toolbar` — La barra de herramientas queda fija.
      - `days` — La fila de días queda fija.
      - `both` — Barra y días quedan fijos.
- **`stickyOffset`** · `string` · _por defecto `'0px'`_
    Separación al borde superior, en cualquier unidad CSS (`'4rem'`).
- **`stickyGap`** · `number` · _por defecto `0`_
    Separación extra en px entre las dos cabeceras pegadas.
- **`toolbarBackground`** · `string` · _por defecto `''`_
    Fondo de la barra en reposo (cualquier color CSS).
- **`toolbarBackgroundStuck`** · `string` · _por defecto `''`_
    Fondo de la barra pegada; si falta, usa `toolbarBackground`.
- **`toolbarBlur`** · `number | null`
    Desenfoque del fondo de la barra en reposo, en px (`null` = ninguno).
- **`toolbarBlurStuck`** · `number | null`
    Desenfoque de la barra pegada; `null` hereda `toolbarBlur`.
- **`toolbarStickyHeight`** · `number` · _por defecto `0`_
    Alto de la barra mientras está pegada, en px (`0` = alto natural).
- **`daysBackground`** · `string` · _por defecto `''`_
    Fondo de la fila de días en reposo (cualquier color CSS).
- **`daysBackgroundStuck`** · `string` · _por defecto `''`_
    Fondo de la fila de días pegada; si falta, usa `daysBackground`.
- **`daysBlur`** · `number | null`
    Desenfoque del fondo de la fila de días en reposo, en px.
- **`daysBlurStuck`** · `number | null`
    Desenfoque de la fila de días pegada; `null` hereda `daysBlur`.
- **`daysStickyHeight`** · `number` · _por defecto `0`_
    Alto de la fila de días mientras está pegada, en px (`0` = natural).

#### Salidas

- **`eventPressed`** · `SiremAgendaEvent`
    Evento pulsado (original, sin normalizar).
    - **Devuelve:**
      - `id?` · `string | number` — Identificador estable; si falta se usa la posición en el array.
      - `title` · `string` — Título visible.
      - `start` · `Date | string` — Inicio (`Date` o texto ISO).
      - `end?` · `Date | string` — Fin (`Date` o texto ISO). Sin fin dura 30 minutos.
      - `allDay?` · `boolean` — Ocupa el día completo y va a la franja superior.
      - `tone?` · `SiremAgendaTone` — Color semántico; por defecto `brand`.
      - `location?` · `string` — Lugar o sala, en segunda línea.
      - `meta?` · `string` — Etiqueta corta a la derecha (profesional, estado…).
- **`slotPressed`** · `SiremAgendaSlot`
    Hueco de la rejilla pulsado.
    - **Devuelve:**
      - `date` · `Date` — Día del hueco.
      - `hour` · `number` — Hora (0–23).
      - `minute` · `number` — Minuto (0–59).
- **`dayPressed`** · `Date`
    Día elegido por el usuario.
    - **Devuelve:** Día pulsado, a medianoche local.

#### Tipos y esquemas

- **`SiremAgendaEvent`** · _interfaz_
    Evento de la agenda.
    - **Campos:**
        - `id?` · `string | number` — Identificador estable; si falta se usa la posición en el array.
        - `title` · `string` — Título visible.
        - `start` · `Date | string` — Inicio (`Date` o texto ISO).
        - `end?` · `Date | string` — Fin (`Date` o texto ISO). Sin fin dura 30 minutos.
        - `allDay?` · `boolean` — Ocupa el día completo y va a la franja superior.
        - `tone?` · `SiremAgendaTone` — Color semántico; por defecto `brand`.
        - `location?` · `string` — Lugar o sala, en segunda línea.
        - `meta?` · `string` — Etiqueta corta a la derecha (profesional, estado…).
- **`SiremAgendaMode`** · _unión_
    Vistas de la agenda.
    - **Definición:** `'day' | 'week' | 'month' | 'list'`
    - `day` — Un día, con las horas en columnas.
    - `week` — La semana completa, con los 7 días.
    - `month` — Rejilla del mes.
    - `list` — Lista cronológica sin rejilla.
- **`SiremAgendaSticky`** · _unión_
    Cabeceras que se quedan pegadas (`position: sticky`) al hacer scroll. - `toolbar`: la barra de navegación (título + selector de vista). - `days`: la fila de días/semana o el encabezado de grupo de la lista. - `both`: las dos, apiladas (la segunda bajo la primera).
    - **Definición:** `'none' | 'toolbar' | 'days' | 'both'`
    - `none` — Sin nada fijo al hacer scroll.
    - `toolbar` — La barra de herramientas queda fija.
    - `days` — La fila de días queda fija.
    - `both` — Barra y días quedan fijos.
- **`SiremAgendaTone`** · _unión_
    Semántica de color de un evento.
    - **Definición:** `'brand' | 'sage' | 'accent' | 'success' | 'warning' | 'danger' | 'muted'`
    - `brand`
    - `sage`
    - `accent`
    - `success`
    - `warning`
    - `danger`
    - `muted`
- **`SiremAgendaSlot`** · _interfaz_
    Hueco pulsado en la rejilla horaria.
    - **Campos:**
        - `date` · `Date` — Día del hueco.
        - `hour` · `number` — Hora (0–23).
        - `minute` · `number` — Minuto (0–59).

### `SiremAvatar`

Selector: `sirem-avatar` · [Demo](projects/demo/src/app/pages/avatar-demo)

Avatar con imagen o iniciales + punto de presencia/estado. (Listas de pacientes, terceros, usuarios.)

#### Entradas

- **`name`** · `string` · _por defecto `''`_
    Nombre de la persona; origen de las iniciales.
- **`src`** · `string | null`
    URL de la foto. Si falta o falla la carga, se muestran las iniciales.
- **`size`** · `SiremAvatarSize` · _por defecto `'md'`_
    Tamaño: `xs`, `sm`, `md` o `lg`.
    - **Valores:**
      - `xs` — Muy pequeño, 1.5 rem. Para listas densas.
      - `sm` — Pequeño, 2 rem. Para filas de tabla.
      - `md` — Base, 2.5 rem. Es el valor por defecto.
      - `lg` — Grande, 3.5 rem. Para fichas de perfil.
- **`presence`** · `SiremPresenceTone`
    Punto de estado (`success`, `warning`, `danger`, `neutral`); `null` lo oculta.
    - **Valores:**
      - `success` — En línea o disponible.
      - `warning` — Ocupado o con aviso.
      - `danger` — Ausente o no disponible.
      - `neutral` — Sin semántica (estado desconocido).
      - `null` — Sin punto de estado. Es el valor por defecto.
- **`label`** · `string | null`
    Nombre accesible cuando las iniciales no bastan.

#### Tipos y esquemas

- **`SiremAvatarSize`** · _unión_
    Tamaño del avatar.
    - **Definición:** `'xs' | 'sm' | 'md' | 'lg'`
    - `xs` — Muy pequeño, 1.5 rem. Para listas densas.
    - `sm` — Pequeño, 2 rem. Para filas de tabla.
    - `md` — Base, 2.5 rem. Es el valor por defecto.
    - `lg` — Grande, 3.5 rem. Para fichas de perfil.
- **`SiremPresenceTone`** · _unión_
    Color del punto de presencia (estado del usuario).
    - **Definición:** `'success' | 'warning' | 'danger' | 'neutral' | null`
    - `success` — En línea o disponible.
    - `warning` — Ocupado o con aviso.
    - `danger` — Ausente o no disponible.
    - `neutral` — Sin semántica (estado desconocido).
    - `null` — Sin punto de estado. Es el valor por defecto.

### `SiremBadge`

Selector: `sirem-badge` · [Demo](projects/demo/src/app/pages/badge-demo)

Pastilla de estado (última visita, estado CUFE/DIAN, estado de cita, sincronización Xubio…). Con o sin punto.

#### Entradas

- **`tone`** · `SiremBadgeTone` · _por defecto `'neutral'`_
    Semántica de color: `neutral`, `info`, `accent`, `success`, `warning` o `danger`.
    - **Valores:**
      - `neutral` — Sin semántica de color. Para etiquetas informativas.
      - `info` — Informativo, con tinte azul de marca.
      - `accent` — Acento de marca (lima). Destaca sin semántica de estado.
      - `success` — Correcto o confirmado.
      - `warning` — Pendiente o con atención.
      - `danger` — Error, vencido o bloqueado.
- **`dot`** · `boolean` · _por defecto `false`_
    Añade un punto de color a la izquierda del texto.
- **`label`** · `string | null`
    Nombre accesible cuando el propio texto del badge no basta.

#### Tipos y esquemas

- **`SiremBadgeTone`** · _unión_
    Semántica de color del badge.
    - **Definición:** `'neutral' | 'info' | 'accent' | 'success' | 'warning' | 'danger'`
    - `neutral` — Sin semántica de color. Para etiquetas informativas.
    - `info` — Informativo, con tinte azul de marca.
    - `accent` — Acento de marca (lima). Destaca sin semántica de estado.
    - `success` — Correcto o confirmado.
    - `warning` — Pendiente o con atención.
    - `danger` — Error, vencido o bloqueado.

### `SiremBreadcrumbs`

Selector: `sirem-breadcrumbs` · [Demo](projects/demo/src/app/pages/breadcrumbs-demo)

Ubicación jerárquica (p. ej. Inicio › Clínica › Pacientes).

#### Entradas

- **`items`** · `SiremCrumb[]` · _obligatorio_
    Migas a mostrar; la última se pinta como página actual.

#### Tipos y esquemas

- **`SiremCrumb`** · _interfaz_
    Nivel del breadcrumb. `link` ausente = nivel actual (no clicable).
    - **Campos:**
        - `label` · `string`
        - `link?` · `string | any[]`

### `SiremButton`

Selector: `sirem-button` · [Demo](projects/demo/src/app/pages/button-demo)

Botón base del design system SIREM (estética Bento: píldoras de esquinas completamente redondeadas, sombras difusas y semántica de color; escala compacta: el tamaño md mide h-10 (40px) como los campos)…

#### Entradas

- **`variant`** · `SiremButtonVariant` · _por defecto `'primary'`_
    Estilo visual: `primary`, `secondary`, `success`, `warning`, `ghost` o `danger`.
    - **Valores:**
      - `primary` — Acción principal. Fondo de marca con el texto de contraste del tema.
      - `accent` — Acento de marca (lima). Acción destacada sin ser la principal.
      - `secondary` — Acción secundaria. Fondo de superficie con borde.
      - `success` — Confirmación o resultado correcto.
      - `warning` — Aviso o estado que requiere atención.
      - `ghost` — Sin fondo ni borde; solo al pasar el cursor cobra fondo.
      - `danger` — Acción destructiva o error.
- **`size`** · `SiremButtonSize` · _por defecto `'md'`_
    Tamaño: `sm` (2 rem), `md` (2.5 rem, igual que los campos) o `lg` (3 rem).
    - **Valores:**
      - `sm` — Compacto, 2rem de alto. Para barras, cabeceras y tablas.
      - `md` — Base, 2.5rem. Igual de alto que los campos del formulario.
      - `lg` — Amplio, 3rem. Para acciones destacadas.
- **`disabled`** · `boolean` · _por defecto `false`_
    Bloquea el botón: no emite `pressed` ni ejecuta `action`.
- **`action`** · `SiremButtonAction | null`
    Acción a ejecutar al hacer clic (puede devolver Observable/Promise).
- **`iconOnly`** · `boolean` · _por defecto `false`_
    Solo icono (botón cuadrado sin etiqueta). Requiere `aria-label`.
- **`loading`** · `boolean` · _por defecto `false`_
    Estado de progreso; lo gestiona `action` o se controla desde fuera.
- **`bordered`** · `boolean` · _por defecto `true`_
    Dibuja el borde (defecto). `false` lo suprime sin cambiar el resto.

#### Salidas

- **`pressed`** · `void`
    Se emite al pulsar, antes de resolver `action`.
    - **Devuelve:** No emite datos: el evento no lleva carga útil.
- **`finished`** · `unknown`
    Último valor emitido al completar `action` con éxito.
    - **Devuelve:** Valor que devuelve `action` al completarse.
- **`failed`** · `unknown`
    Error emitido si `action` falla.
    - **Devuelve:** Error con el que falla `action`.

#### Tipos y esquemas

- **`SiremButtonVariant`** · _unión_
    Estilo visual del botón (semántica de color).
    - **Definición:** `'primary' | 'accent' | 'secondary' | 'success' | 'warning' | 'ghost' | 'danger'`
    - `primary` — Acción principal. Fondo de marca con el texto de contraste del tema.
    - `accent` — Acento de marca (lima). Acción destacada sin ser la principal.
    - `secondary` — Acción secundaria. Fondo de superficie con borde.
    - `success` — Confirmación o resultado correcto.
    - `warning` — Aviso o estado que requiere atención.
    - `ghost` — Sin fondo ni borde; solo al pasar el cursor cobra fondo.
    - `danger` — Acción destructiva o error.
- **`SiremButtonSize`** · _unión_
    Tamaño del botón; `md` iguala la altura de los campos.
    - **Definición:** `'sm' | 'md' | 'lg'`
    - `sm` — Compacto, 2rem de alto. Para barras, cabeceras y tablas.
    - `md` — Base, 2.5rem. Igual de alto que los campos del formulario.
    - `lg` — Amplio, 3rem. Para acciones destacadas.
- **`SiremButtonAction`** · _alias_
    Acción async del botón: se ejecuta al hacer clic y el botón muestra el estado de progreso hasta que termina.
    - **Definición:** `() => Observable<unknown> | Promise<unknown> | void`

### `SiremCalendar`

Selector: `sirem-calendar` · [Demo](projects/demo/src/app/pages/calendar-demo)

Calendario mensual único de agenda (`ScheduleListComponent`) con tres tamaños: - `small`: compacto para popups (p. ej. `sirem-date-field`) y vistas densas. - `medium`: vista normal con puntos de estado por día…

#### Entradas

- **`events`** · `SiremCalendarEvent[]` · _por defecto `[]`_
    Eventos a pintar (fecha ISO, etiqueta y color).
- **`legend`** · `unknown`
    Leyenda estado → color (p. ej. Confirmada, Pendiente, Cancelada).
- **`size`** · `SiremCalendarSize` · _por defecto `'medium'`_
    Tamaño: small (popups), medium (normal), large (tipo Google Calendar).
    - **Valores:**
      - `small` — Compacto, para popups y tarjetas.
      - `medium` — Base, como un calendario de escritorio.
      - `large` — Grande, tipo Google Calendar.
- **`variant`** · `SiremCalendarVariant` · _por defecto `'card'`_
    Variante visual: `card` (defecto, con marco y cabecera) o `plain` (sin marco ni fondo, días en círculo, para una tarjeta de color).
    - **Valores:**
      - `card` — Con marco, fondo y cabecera. Es el valor por defecto.
      - `plain` — Sin marco ni fondo y con los días en círculo.
- **`stripedDays`** · `string[]` · _por defecto `[]`_
    Días no disponibles (`yyyy-MM-dd`): se pintan con el patrón rayado (`--sirem-hatch`), como la referencia de dashboard Bento.
- **`selected`** · `string | null`
    Día seleccionado en ISO.

#### Salidas

- **`dayPressed`** · `string`
    Se emite con la fecha ISO del día pulsado.
    - **Devuelve:** Fecha ISO `yyyy-MM-dd` del día pulsado.

#### Tipos y esquemas

- **`SiremCalendarEvent`** · _interfaz_
    Evento de agenda. `color` acepta cualquier color CSS (p. ej. `#26272b`).
    - **Campos:**
        - `date` · `string` — Día en ISO `yyyy-MM-dd`.
        - `label` · `string`
        - `color?` · `string`
- **`SiremCalendarSize`** · _unión_
    Día en ISO `yyyy-MM-dd`.
    - **Definición:** `'small' | 'medium' | 'large'`
    - `small` — Compacto, para popups y tarjetas.
    - `medium` — Base, como un calendario de escritorio.
    - `large` — Grande, tipo Google Calendar.
- **`SiremCalendarVariant`** · _unión_
    Variante visual del calendario.
    - **Definición:** `'card' | 'plain'`
    - `card` — Con marco, fondo y cabecera. Es el valor por defecto.
    - `plain` — Sin marco ni fondo y con los días en círculo.

### `SiremCard`

Selector: `sirem-card` · [Demo](projects/demo/src/app/pages/card-demo)

Tarjeta contenedora genérica (fichas de paciente, tarjetas de inventario, paneles de configuración…). Encabezado opcional + contenido proyectado.

#### Entradas

- **`title`** · `string` · _por defecto `''`_
    Título del encabezado. Sin `title` ni `subtitle` el encabezado no se pinta.
- **`subtitle`** · `string` · _por defecto `''`_
    Línea secundaria bajo el título.
- **`surface`** · `SiremSurface` · _por defecto `'solid'`_
    Superficie sólida (defecto) o translúcida tipo dashboard.
    - **Valores:**
      - `solid` — Superficie opaca.
      - `glass` — Superficie translúcida con desenfoque.
- **`tone`** · `'default' | 'brand' | 'sage' | 'accent' | 'muted'` · _por defecto `'default'`_
    Tono de la tarjeta: - `brand`: color de marca con texto claro (banners destacados). - `sage`: tinte salvia, para bloques secundarios del dashboard. - `accent`: tinte lima suave, para el bloque protagonista. - `muted`: gris de panel, para datos neutros.
    - **Valores:**
      - `default` — Superficie normal. Es el valor por defecto.
      - `brand` — Color de marca con texto de contraste.
      - `sage` — Tinte salvia, para bloques secundarios.
      - `accent` — Tinte lima suave, para el bloque protagonista.
      - `muted` — Gris de panel, para datos neutros.
- **`padding`** · `SiremCardPadding` · _por defecto `'md'`_
    Atajo de relleno para `body` y `footer`. Usa `none` para contenido que toca los bordes (tablas, imágenes, mapas).
    - **Valores:**
      - `none` — Sin relleno. Para tablas, imágenes o mapas que tocan el borde.
      - `sm` — Relleno corto, 0.75rem / 1rem. Para cabeceras y pies.
      - `md` — Relleno base, 1rem / 1.25rem. Es el valor por defecto.
      - `lg` — Relleno amplio, 1.5rem / 2rem. Para poco contenido y mucho aire.
- **`headerPadding`** · `SiremCardPadding` · _por defecto `'sm'`_
    Relleno del encabezado. Defecto `sm`.
    - **Valores:**
      - `none` — Sin relleno. Para tablas, imágenes o mapas que tocan el borde.
      - `sm` — Relleno corto, 0.75rem / 1rem. Para cabeceras y pies.
      - `md` — Relleno base, 1rem / 1.25rem. Es el valor por defecto.
      - `lg` — Relleno amplio, 1.5rem / 2rem. Para poco contenido y mucho aire.
- **`bodyPadding`** · `SiremCardPadding | null`
    Relleno del cuerpo; si es `null` hereda `padding`.
- **`footerPadding`** · `SiremCardPadding | null`
    Relleno del pie; si es `null` hereda `padding`.
- **`showHeader`** · `boolean` · _por defecto `true`_
    Muestra el encabezado si hay título o subtítulo.
- **`showFooter`** · `boolean` · _por defecto `true`_
    Muestra el pie. Si no se proyecta nada en `slot="footer"`, el pie se oculta por CSS (`:empty`), de modo que no añade relleno fantasma.

#### Tipos y esquemas

- **`SiremCardPadding`** · _unión_
    Escala de relleno de cada zona de la tarjeta.
    - **Definición:** `'none' | 'sm' | 'md' | 'lg'`
    - `none` — Sin relleno. Para tablas, imágenes o mapas que tocan el borde.
    - `sm` — Relleno corto, 0.75rem / 1rem. Para cabeceras y pies.
    - `md` — Relleno base, 1rem / 1.25rem. Es el valor por defecto.
    - `lg` — Relleno amplio, 1.5rem / 2rem. Para poco contenido y mucho aire.

### `SiremCardList`

Selector: `sirem-card-list` · [Demo](projects/demo/src/app/pages/card-list-demo)

Lista de tarjetas: alternativa visual a la tabla para registros con varios datos (pacientes, facturas, equipos…). Uso:

#### Entradas

- **`items`** · `Record<string, unknown>[]` · _obligatorio_
    Filas a mostrar; cada objeto se pinta como una tarjeta.
- **`titleKey`** · `string` · _por defecto `'title'`_
    Clave del título de cada tarjeta.
- **`subtitleKey`** · `string | null`
    Clave cuyo valor se pinta como subtítulo de la tarjeta.
- **`badgeKey`** · `string | null`
    Clave cuyo valor se pinta como badge en la esquina.
- **`badgeTones`** · `Record<string, SiremBadgeTone>`
    Color del badge según su valor (p. ej. `{ Activo: 'success' }`).
- **`avatarKey`** · `string | null`
    Clave con el nombre (o `{ name, src }`) para el avatar.
- **`fields`** · `SiremCardListField[]` · _por defecto `[]`_
    Filas extra clave → valor.
- **`minWidth`** · `string` · _por defecto `'17rem'`_
    Ancho mínimo de cada tarjeta (define las columnas).
- **`rowClickable`** · `boolean` · _por defecto `true`_
    Hace las tarjetas clicables (cursor, foco y emisión de `itemPressed`).
- **`selectable`** · `boolean` · _por defecto `false`_
    Añade una casilla por tarjeta para selección múltiple.
- **`selection`** · `number[]` · _por defecto `[]`_
    Índices seleccionados.
- **`emptyText`** · `string` · _por defecto `'Sin registros.'`_
    Texto que se muestra cuando `items` está vacío.

#### Salidas

- **`itemPressed`** · `Record<string, unknown>`
    Se emite con la fila pulsada (con `rowClickable`).
    - **Devuelve:** Objeto de la fila pulsada, tal cual (sus claves).

#### Tipos y esquemas

- **`SiremBadgeTone`** · _unión_
    Semántica de color del badge.
    - **Definición:** `'neutral' | 'info' | 'accent' | 'success' | 'warning' | 'danger'`
    - `neutral` — Sin semántica de color. Para etiquetas informativas.
    - `info` — Informativo, con tinte azul de marca.
    - `accent` — Acento de marca (lima). Destaca sin semántica de estado.
    - `success` — Correcto o confirmado.
    - `warning` — Pendiente o con atención.
    - `danger` — Error, vencido o bloqueado.
- **`SiremCardListField`** · _interfaz_
    Campo extra de la tarjeta (filas clave → valor).
    - **Campos:**
        - `key` · `string`
        - `label?` · `string`
        - `icon?` · `string` — Clase CSS del icono (p. ej. `fi fi-rr-phone`).

### `SiremChart`

Selector: `sirem-chart` · [Demo](projects/demo/src/app/pages/chart-demo)

Gráfica estadística con Apache ECharts (barras simples, series múltiples, dona…). Recibe la opción ECharts tal cual, por lo que sirve para casos simples y compuestos sin cambiar de componente…

#### Entradas

- **`option`** · `EChartsCoreOption`
    Opción ECharts completa (título, ejes, series…).
- **`height`** · `number | string` · _por defecto `320`_
    Alto: número en px (320 por defecto) o longitud CSS (`'100%'`).
- **`loading`** · `boolean` · _por defecto `false`_
    Capa de carga sobre la gráfica.
- **`dark`** · `boolean` · _por defecto `false`_
    Tema oscuro integrado de ECharts.
- **`renderer`** · `'canvas' | 'svg'` · _por defecto `'svg'`_
    Renderizador: svg (nítido, apto tests) o canvas (miles de puntos).
    - **Valores:**
      - `svg` — Nítido a cualquier zoom y legible en tests. Es el valor por defecto.
      - `canvas` — Mejor con miles de puntos, a costa de nitidez.

#### Salidas

- **`ready`** · `ECharts`
    Emite la instancia de ECharts cuando la gráfica ya está inicializada.
    - **Devuelve:** Instancia de ECharts (`setOption`, `resize`, `dispose`…).

### `SiremCheckbox`

Selector: `sirem-checkbox-field` · [Demo](projects/demo/src/app/pages/checkbox-demo)

Casilla de verificación con etiqueta y descripción opcional.

#### Entradas

- **`checked`** · `boolean` · _por defecto `false`_
    Estado marcado, con enlace de dos vías.
- **`label`** · `string` · _por defecto `''`_
    Texto de la casilla.
- **`description`** · `string` · _por defecto `''`_
    Línea secundaria bajo la etiqueta.
- **`required`** · `boolean` · _por defecto `false`_
    Marca el campo como obligatorio (`aria-required` e indicador visual).
- **`disabled`** · `boolean` · _por defecto `false`_
    Deshabilita la casilla: no se puede marcar ni enfocar.

### `SiremCodeEditor`

Selector: `sirem-code-editor` · [Demo](projects/demo/src/app/pages/code-editor-demo)

Editor de código con CodeMirror 6. Sigue el tema con `dark` (igual que `sirem-chart`): claro por defecto, One Dark en oscuro. Uso:

#### Entradas

- **`code`** · `string` · _por defecto `''`_
    Código fuente (doble vía).
- **`language`** · `SiremCodeLanguage` · _por defecto `'typescript'`_
    Lenguaje resaltado: `html`, `typescript`, `javascript`, `json` o `css`.
    - **Valores:**
      - `html` — Marcado HTML (útil para ejemplos de componentes).
      - `typescript` — TypeScript. Es el valor por defecto.
      - `javascript` — JavaScript.
      - `json` — JSON, con plegado de claves.
      - `css` — Hojas de estilo.
- **`label`** · `string` · _por defecto `''`_
    Etiqueta visible sobre el editor.
- **`hint`** · `string` · _por defecto `''`_
    Nota de ayuda bajo el editor.
- **`dark`** · `boolean` · _por defecto `false`_
    Tema oscuro One Dark; en claro usa el tema base de CodeMirror.
- **`readonly`** · `boolean` · _por defecto `false`_
    Solo lectura: se puede seleccionar y copiar, pero no editar.
- **`height`** · `number` · _por defecto `240`_
    Alto del editor en px.

#### Tipos y esquemas

- **`SiremCodeLanguage`** · _unión_
    Lenguaje con el que se resalta el código.
    - **Definición:** `'html' | 'typescript' | 'javascript' | 'json' | 'css'`
    - `html` — Marcado HTML (útil para ejemplos de componentes).
    - `typescript` — TypeScript. Es el valor por defecto.
    - `javascript` — JavaScript.
    - `json` — JSON, con plegado de claves.
    - `css` — Hojas de estilo.

### `SiremCollapsible`

Selector: `sirem-collapsible` · [Demo](projects/demo/src/app/pages/collapsible-demo)

Sección plegable con cabecera pulsable y contenido proyectado. - `variant="card"` (defecto) dibuja el marco Bento: borde, radio y sombra. `variant="plain"` deja solo la cabecera y el contenido, sin marco…

#### Entradas

- **`title`** · `string` · _obligatorio_
    Texto de la cabecera.
- **`subtitle`** · `string | null`
    Línea secundaria bajo el título.
- **`icon`** · `string | null`
    Clase CSS de icono (p. ej. `fi fi-rr-user`).
- **`open`** · `boolean` · _por defecto `false`_
    Estado abierto (doble vía).
- **`variant`** · `SiremCollapsibleVariant` · _por defecto `'card'`_
    Con marco de tarjeta (`card`) o sin él (`plain`).
    - **Valores:**
      - `card` — Con marco, fondo de tarjeta y cabecera dividida.
      - `plain` — Sin marco: solo la cabecera y el cuerpo.
- **`background`** · `boolean` · _por defecto `true`_
    Superficie propia; `false` deja el cuerpo transparente.
- **`disabled`** · `boolean` · _por defecto `false`_
    Bloquea abrir y cerrar la sección.

#### Salidas

- **`opened`** · `void`
    Se emite al abrirse.
    - **Devuelve:** No emite datos: el evento no lleva carga útil.
- **`closed`** · `void`
    Se emite al cerrarse.
    - **Devuelve:** No emite datos: el evento no lleva carga útil.

#### Tipos y esquemas

- **`SiremCollapsibleVariant`** · _unión_
    Marco visual de la sección plegable.
    - **Definición:** `'card' | 'plain'`
    - `card` — Con marco, fondo de tarjeta y cabecera dividida.
    - `plain` — Sin marco: solo la cabecera y el cuerpo.

### `SiremCollapsibleGroup`

Selector: `sirem-collapsible-group`

Agrupador de secciones `sirem-collapsible`. - Con `[accordion]="true"` (defecto) solo queda **una sección abierta**: al abrir una, el grupo cierra las demás…

#### Entradas

- **`accordion`** · `boolean` · _por defecto `true`_
    Solo una sección abierta a la vez (comportamiento de acordeón).

### `SiremConfirmDialog`

Selector: `sirem-confirm-dialog` · [Demo](projects/demo/src/app/pages/confirm-dialog-demo)

Diálogo de confirmación sí/no (equivale a `BoolModalFormDynamicComponent`): eliminar paciente, anular factura, confirmar envío masivo… Uso:

#### Entradas

- **`open`** · `boolean` · _por defecto `false`_
    Controla la visibilidad del diálogo, con enlace de dos vías.
- **`title`** · `string` · _por defecto `'Confirmar acción'`_
    Título del diálogo.
- **`message`** · `string` · _por defecto `'¿Deseas continuar?'`_
    Pregunta principal.
- **`detail`** · `string` · _por defecto `''`_
    Aclaración o consecuencia bajo el mensaje; vacío la oculta.
- **`confirmLabel`** · `string` · _por defecto `'Confirmar'`_
    Texto del botón de confirmación.
- **`cancelLabel`** · `string` · _por defecto `'Cancelar'`_
    Texto del botón de cancelación.
- **`variant`** · `'primary' | 'danger'` · _por defecto `'primary'`_
    Estilo del botón principal: `primary` o `danger`.
    - **Valores:**
      - `primary` — Acción principal. Es el valor por defecto.
      - `danger` — Acción destructiva, en rojo.

#### Salidas

- **`confirmed`** · `void`
    Se emite al confirmar; el diálogo se cierra.
    - **Devuelve:** No emite datos: el evento no lleva carga útil.
- **`cancelled`** · `void`
    Se emite al cancelar o cerrar sin confirmar.
    - **Devuelve:** No emite datos: el evento no lleva carga útil.

### `SiremDataTable`

Selector: `sirem-data-table` · [Demo](projects/demo/src/app/pages/data-table-demo)

Tabla estandarizada de listados (pacientes, terceros, facturas, productos, amortizaciones…). Ordenable, con selección opcional, scroll horizontal en móvil y celdas tipadas (avatar, badge, moneda…). Uso:

#### Entradas

- **`columns`** · `SiremTableColumn[]` · _obligatorio_
    Definición de las columnas (clave, título, tipo, alineación…).
- **`rows`** · `Record<string, unknown>[]` · _obligatorio_
    Filas a mostrar; los valores se leen por la clave de cada columna.
- **`trackKey`** · `string` · _por defecto `'id'`_
    Clave que identifica cada fila (seguimiento y selección).
- **`selectable`** · `boolean` · _por defecto `false`_
    Añade una columna de casillas para selección múltiple.
- **`sortable`** · `boolean` · _por defecto `true`_
    Permite ordenar al pulsar la cabecera de una columna.
- **`rowClickable`** · `boolean` · _por defecto `true`_
    Resalta las filas y emite `rowClicked` al pulsarlas.
- **`emptyText`** · `string` · _por defecto `'Sin registros.'`_
    Texto que se muestra cuando `rows` está vacío.
- **`currencyCode`** · `string` · _por defecto `'COP'`_
    Divisa de las columnas de tipo `currency` (`COP`, `EUR`…).
- **`selection`** · `unknown[]` · _por defecto `[]`_
    Claves (`trackKey`) de las filas seleccionadas.

#### Salidas

- **`rowClicked`** · `Record<string, unknown>`
    Se emite con la fila pulsada (con `rowClickable`).
    - **Devuelve:** Objeto de la fila pulsada, tal cual (sus claves).

#### Tipos y esquemas

- **`SiremTableColumn`** · _interfaz_
    Cómo se pinta el valor de una columna de la tabla.
    - **Campos:**
        - `key` · `string`
        - `label` · `string`
        - `kind?` · `SiremColumnKind`
        - `align?` · `'left' | 'center' | 'right'`
        - `badgeTones?` · `Record<string, SiremBadgeTone>` — Mapa valor → tono (para kind 'badge').
        - `subKey?` · `string` — Clave opcional para una segunda línea tenue bajo el valor (text/number/date/currency).
- **`SiremColumnKind`** · _unión_
    Cómo se pinta el valor de una columna de la tabla.
    - **Definición:** `'text' | 'number' | 'badge' | 'avatar' | 'date' | 'currency'`
    - `text` — Texto tal cual. Es el valor por defecto.
    - `number` — Numérico, con separador de miles.
    - `badge` — Etiqueta con el tono de la columna.
    - `avatar` — Nombre con avatar.
    - `date` — Fecha formateada.
    - `currency` — Importe en la divisa indicada por la columna.
- **`SiremBadgeTone`** · _unión_
    Semántica de color del badge.
    - **Definición:** `'neutral' | 'info' | 'accent' | 'success' | 'warning' | 'danger'`
    - `neutral` — Sin semántica de color. Para etiquetas informativas.
    - `info` — Informativo, con tinte azul de marca.
    - `accent` — Acento de marca (lima). Destaca sin semántica de estado.
    - `success` — Correcto o confirmado.
    - `warning` — Pendiente o con atención.
    - `danger` — Error, vencido o bloqueado.

### `SiremDate`

Selector: `sirem-date-field` · [Demo](projects/demo/src/app/pages/date-demo)

Campo de fecha con calendario emergente (valor ISO `yyyy-MM-dd`). Muestra la fecha en formato local, admite escritura (`dd/mm/aaaa` o ISO) y abre `sirem-calendar` en tamaño `small` para elegir el día. Uso:

#### Entradas

- **`value`** · `string | null`
    Fecha en ISO `yyyy-MM-dd`.
- **`label`** · `string` · _por defecto `''`_
    Etiqueta visible sobre el control.
- **`placeholder`** · `string` · _por defecto `'dd/mm/aaaa'`_
    Texto de ayuda cuando no hay fecha (`dd/mm/aaaa`).
- **`hint`** · `string` · _por defecto `''`_
    Nota de ayuda bajo el campo; la sustituye `error` cuando lo hay.
- **`error`** · `string` · _por defecto `''`_
    Mensaje de error. Con texto, el campo se marca en rojo y se anuncia.
- **`min`** · `string | null`
    Fecha mínima seleccionable, en ISO `yyyy-MM-dd`.
- **`max`** · `string | null`
    Fecha máxima seleccionable, en ISO `yyyy-MM-dd`.
- **`required`** · `boolean` · _por defecto `false`_
    Marca el campo como obligatorio (`aria-required` e indicador visual).
- **`disabled`** · `boolean` · _por defecto `false`_
    Deshabilita el control: no se puede enfocar ni editar.

### `SiremDateChip`

Selector: `sirem-date-chip` · [Demo](projects/demo/src/app/pages/date-chip-demo)

Chip de fecha grande (referencia Bento): inicial del día de la semana arriba y el número destacado debajo. Se usa en fila, como selector rápido de días…

#### Entradas

- **`day`** · `string | number` · _obligatorio_
    Número del día (texto o número; admite sufijos como `12+`).
- **`weekday`** · `string | null`
    Inicial/abreviatura de la semana (`L`, `Ma`, `Mié`…).
- **`active`** · `boolean` · _por defecto `false`_
    Día seleccionado.
- **`dot`** · `boolean` · _por defecto `false`_
    Punto de estado (día con eventos o recordatorio).
- **`size`** · `SiremDateChipSize` · _por defecto `'md'`_
    Tamaño: `md` (defecto) o `lg`.
    - **Valores:**
      - `md` — Base. Es el valor por defecto.
      - `lg` — Destacado: más alto y con el día en cuerpo grande.
- **`ariaLabel`** · `string | null`
    Nombre accesible cuando `day` y `weekday` no bastan.

#### Salidas

- **`pressed`** · `void`
    Se emite al pulsar el chip.
    - **Devuelve:** No emite datos: el evento no lleva carga útil.

#### Tipos y esquemas

- **`SiremDateChipSize`** · _unión_
    Tamaño del chip de fecha.
    - **Definición:** `'md' | 'lg'`
    - `md` — Base. Es el valor por defecto.
    - `lg` — Destacado: más alto y con el día en cuerpo grande.

### `SiremDatepicker`

Selector: `sirem-datepicker-field` · [Demo](projects/demo/src/app/pages/datepicker-demo)

Selector de fecha (citas, nacimiento, vencimientos…). Valor ISO `yyyy-MM-dd`.

#### Entradas

- **`value`** · `string | null`
    Fecha elegida en ISO `yyyy-MM-dd`, con enlace de dos vías.
- **`label`** · `string` · _por defecto `''`_
    Etiqueta visible sobre el control.
- **`hint`** · `string` · _por defecto `''`_
    Nota de ayuda bajo el campo; la sustituye `error` cuando lo hay.
- **`error`** · `string` · _por defecto `''`_
    Mensaje de error. Con texto, el campo se marca en rojo y se anuncia.
- **`min`** · `string | null`
    Fecha mínima seleccionable, en ISO `yyyy-MM-dd`.
- **`max`** · `string | null`
    Fecha máxima seleccionable, en ISO `yyyy-MM-dd`.
- **`required`** · `boolean` · _por defecto `false`_
    Marca el campo como obligatorio (`aria-required` e indicador visual).
- **`disabled`** · `boolean` · _por defecto `false`_
    Deshabilita el control: no se puede enfocar ni editar.

### `SiremDrawer`

Selector: `sirem-drawer` · [Demo](projects/demo/src/app/pages/drawer-demo)

Panel lateral deslizante (navegación de la agenda, detalle de paciente, filtros avanzados…). En móvil ocupa casi todo el ancho.

#### Entradas

- **`open`** · `boolean` · _por defecto `false`_
    Estado abierto, con enlace de dos vías.
- **`title`** · `string` · _por defecto `''`_
    Título de la cabecera.
- **`side`** · `'left' | 'right'` · _por defecto `'right'`_
    Lado del que entra el panel: `left` o `right`.
    - **Valores:**
      - `left` — Entra desde el borde izquierdo.
      - `right` — Entra desde el borde derecho. Es el valor por defecto.

#### Salidas

- **`closed`** · `void`
    Se emite al cerrarse.
    - **Devuelve:** No emite datos: el evento no lleva carga útil.

### `SiremDuotoneIcon`

Selector: `sirem-duotone-icon` · [Demo](projects/demo/src/app/pages/duotone-icon-demo)

Icono duotone genérico (SVG inline de dos capas). Patrón duotone (igual en Streamline Ultimate Duotone y Phosphor Duotone): - Capa 1 con `opacity="0.2"` (relleno tenue). - Capa 2 sólida (trazo/forma principal)…

#### Entradas

- **`svg`** · `string` · _obligatorio_
    SVG completo del icono (debe usar fill="currentColor" + capa opacity="0.2").
- **`size`** · `number` · _por defecto `24`_
    Lado del icono en px.
- **`label`** · `string | null`
    Nombre accesible; sin él el icono es decorativo (`aria-hidden`).

### `SiremDynamicForm`

Selector: `sirem-dynamic-form` · [Demo](projects/demo/src/app/pages/dynamic-form-demo)

Formulario dinámico dirigido por configuración (equivale a `lo-form-dynamic`, compatible con el JSON del form-builder de Lion)…

#### Entradas

- **`fields`** · `SiremFormNode[]` · _obligatorio_
    Árbol de nodos del formulario (campos, grupos, tablas y HTML).
- **`values`** · `Record<string, unknown>`
    Valores por clave, con enlace de dos vías.
- **`autosave`** · `boolean` · _por defecto `false`_
    Emite valores con ~400 ms de antirrebote (historias autoguardables).
- **`showActions`** · `boolean` · _por defecto `true`_
    Muestra el pie con los botones de enviar y cancelar.
- **`submitLabel`** · `string` · _por defecto `'Guardar'`_
    Texto del botón de envío.
- **`cancelLabel`** · `string` · _por defecto `'Cancelar'`_
    Texto del botón de cancelación.

#### Salidas

- **`submitted`** · `Record<string, unknown>`
    Emite los valores al pulsar enviar (solo si el formulario es válido).
    - **Devuelve:** `values` del formulario, ya validado.
- **`cancelled`** · `void`
    Se emite al pulsar cancelar.
    - **Devuelve:** No emite datos: el evento no lleva carga útil.
- **`valueChanged`** · `Record<string, unknown>`
    Emite los valores en cada cambio (con antirrebote si `autosave`).
    - **Devuelve:** `values` actuales del formulario.

#### Tipos y esquemas

- **`SiremFormNode`** · _alias_
    Filas de celdas: encabezados `html` o campos (claves planas, admiten puntos).
    - **Definición:** `SiremFieldConfig | SiremGroupConfig | SiremTableConfig | SiremHtmlConfig`
- **`SiremFieldConfig`** · _interfaz_
    Tipo de control del formulario dinámico.
    - **Campos:**
        - `key` · `string`
        - `type` · `SiremFieldType`
        - `label?` · `string`
        - `placeholder?` · `string`
        - `hint?` · `string`
        - `span?` · `number` — Legado: columnas 1-12 (usar `column` en su lugar).
        - `column?` · `string[]` — Ancho estilo Lion: `["md-4"]`, `["md-6","lg-4"]`, `["md-12"]`…
        - `required?` · `boolean`
        - `isRequired?` · `boolean` — Alias Lion de `required`.
        - `disabled?` · `boolean`
        - `options?` · `SiremSelectOption[]` — Opciones estáticas (con `type: "text"` → autocompletado).
        - `strictOptions?` · `boolean` — Solo admite valores de la lista → se comporta como select.
        - `isStrict?` · `boolean` — Alias de `strictOptions`.
        - `multiple?` · `boolean` — Multi-selección con chips (`value` es un array).
        - `isMultiple?` · `boolean` — Alias de `multiple`.
        - `optionsEndpoint?` · `string` — URL GET que devuelve `{ objects: [...] }`.
        - `endpointOptions?` · `string` — Alias de `optionsEndpoint`.
        - `optionsParams?` · `Record<string, unknown>` — Query params del endpoint.
        - `optionsEndpointParams?` · `Record<string, unknown>` — Alias Lion: `optionsEndpointParams`.
        - `optionsMapper?` · `SiremOptionsMapper` — Convierte cada elemento remoto en `{ value, label }`.
        - `prefixIcon?` · `string` — Icono inicial (clase `fi fi-rr-user`).
        - `suffixIcon?` · `string` — Icono final (clase `fi fi-rr-eye`).
        - `rows?` · `number`
        - `min?` · `number | string`
        - `max?` · `number | string`
- **`SiremGroupConfig`** · _interfaz_
    HTML de la celda/encabezado (se sanitiza al renderizar).
    - **Campos:**
        - `type` · `'group'`
        - `key?` · `string`
        - `label?` · `string`
        - `description?` · `string`
        - `column?` · `string[]`
        - `children` · `SiremFormNode[]`
- **`SiremTableConfig`** · _interfaz_
    HTML de la celda/encabezado (se sanitiza al renderizar).
    - **Campos:**
        - `type` · `'table'`
        - `key` · `string`
        - `column?` · `string[]`
        - `tableChildren` · `SiremTableCell[][]` — Filas de celdas: encabezados `html` o campos (claves planas, admiten puntos).
- **`SiremHtmlConfig`** · _interfaz_
    Icono final (clase `fi fi-rr-eye`).
    - **Campos:**
        - `type` · `'html'`
        - `label` · `string` — HTML de la celda/encabezado (se sanitiza al renderizar).
- **`SiremFieldType`** · _unión_
    Tipo de control del formulario dinámico.
    - **Definición:** `'text' | 'number' | 'email' | 'password' | 'tel' | 'textarea' | 'select' | 'date' | 'switch' | 'checkbox' | 'radio' | 'image' | 'search'`
    - `text` — Texto libre. Es el valor por defecto.
    - `number` — Numérico.
    - `email` — Correo electrónico.
    - `password` — Contraseña.
    - `tel` — Teléfono.
    - `textarea` — Texto largo en varias líneas.
    - `select` — Lista estricta: solo admite un valor de `options`.
    - `date` — Fecha.
    - `switch` — Interruptor booleano.
    - `checkbox` — Casilla booleana.
    - `radio` — Opción única.
    - `image` — Subida de imagen.
    - `search` — Buscador con filtrado.
- **`SiremSelectOption`** · _interfaz_
    Opción de un desplegable: valor interno y texto visible.
    - **Campos:**
        - `value` · `string | number`
        - `label` · `string`
- **`SiremOptionsMapper`** · _alias_
    Convierte cada elemento de `objects` en una opción del listado.
    - **Definición:** `(item: unknown) => SiremSelectOption`
- **`SiremTableCell`** · _alias_
    Filas de celdas: encabezados `html` o campos (claves planas, admiten puntos).
    - **Definición:** `SiremFieldConfig | SiremHtmlConfig`

### `SiremEmptyState`

Selector: `sirem-empty-state` · [Demo](projects/demo/src/app/pages/empty-state-demo)

Estado vacío de listados (sin pacientes, sin resultados de filtro…).

#### Entradas

- **`title`** · `string` · _por defecto `'Sin resultados'`_
    Titular del estado vacío.
- **`description`** · `string` · _por defecto `''`_
    Texto de apoyo bajo el titular; puede quedar vacío.

### `SiremFiIcon`

Selector: `sirem-fi-icon` · [Demo](projects/demo/src/app/pages/fi-icon-demo)

Wrapper de Flaticon UIcons (icon font)…

#### Entradas

- **`name`** · `string` · _obligatorio_
    Sufijo del icono sin el prefijo `fi-`. Ej: `rr-user`, `sr-book`, `brands-facebook`.
- **`size`** · `number` · _por defecto `20`_
    Tamaño en px (font-size del icon font).
- **`label`** · `string | null`
    Si se informa, el icono es decorativo→accesible (role="img").

### `SiremFieldGroup`

Selector: `sirem-field-group` · [Demo](projects/demo/src/app/pages/field-group-demo)

Grupo de campos con título (equivale a `lib-group-field-dynamic`): agrupa campos relacionados dentro de un formulario y los distribuye en la cuadrícula de 12 columnas mediante el `span` de cada campo (ver `sirem-dynamic-…

#### Entradas

- **`title`** · `string` · _por defecto `''`_
    Título del grupo de campos.
- **`description`** · `string` · _por defecto `''`_
    Texto de apoyo bajo el título.

### `SiremImageUpload`

Selector: `sirem-image-upload-field` · [Demo](projects/demo/src/app/pages/image-upload-demo)

Carga de imagen con vista previa (foto del paciente, logo, QR…). El valor es la imagen como data-URL lista para previsualizar/enviar.

#### Entradas

- **`value`** · `string | null`
    Imagen elegida (data URL o ruta), con enlace de dos vías.
- **`label`** · `string` · _por defecto `''`_
    Etiqueta visible sobre el control.
- **`placeholder`** · `string` · _por defecto `'Toca para subir una imagen'`_
    Texto del estado vacío de la zona de carga.
- **`hint`** · `string` · _por defecto `'PNG o JPG'`_
    Nota de ayuda bajo el campo; la sustituye `error` cuando lo hay.
- **`error`** · `string` · _por defecto `''`_
    Mensaje de error. Con texto, el campo se marca en rojo y se anuncia.
- **`accept`** · `string` · _por defecto `'image/*'`_
    Tipos admitidos por el selector de archivos (`image/*`, `.png`…).
- **`required`** · `boolean` · _por defecto `false`_
    Marca el campo como obligatorio (`aria-required` e indicador visual).
- **`disabled`** · `boolean` · _por defecto `false`_
    Deshabilita el control: no se puede enfocar ni editar.

### `SiremInput`

Selector: `sirem-input-field` · [Demo](projects/demo/src/app/pages/input-demo)

Campo de texto con autocompletado integrado (doble vía con `[(value)]`). - Sin `options`: input normal…

#### Entradas

- **`value`** · `string | number | (string | number)[] | null`
    Valor del campo (texto, número o array en multiselección), con enlace de dos vías.
- **`type`** · `SiremInputType` · _por defecto `'text'`_
    Tipo de control nativo: `text`, `number`, `email`, `password`, `tel` o `url`.
    - **Valores:**
      - `text` — Texto libre. Es el valor por defecto.
      - `number` — Numérico: usa `min`/`max` y el teclado numérico.
      - `email` — Correo: teclado y validación del navegador.
      - `password` — Contraseña: el texto se oculta.
      - `tel` — Teléfono: teclado numérico.
      - `url` — Dirección web con validación básica.
- **`label`** · `string` · _por defecto `''`_
    Etiqueta visible sobre el control.
- **`placeholder`** · `string` · _por defecto `''`_
    Texto de ayuda que aparece mientras el campo está vacío.
- **`hint`** · `string` · _por defecto `''`_
    Nota de ayuda bajo el campo; la sustituye `error` cuando lo hay.
- **`error`** · `string` · _por defecto `''`_
    Mensaje de error. Con texto, el campo se marca en rojo y se anuncia.
- **`required`** · `boolean` · _por defecto `false`_
    Marca el campo como obligatorio (`aria-required` e indicador visual).
- **`disabled`** · `boolean` · _por defecto `false`_
    Deshabilita el control: no se puede enfocar ni editar.
- **`readonly`** · `boolean` · _por defecto `false`_
    Solo lectura: se puede enfocar y copiar, pero no editar.
- **`min`** · `number | null`
    Valor mínimo con `type="number"`.
- **`max`** · `number | null`
    Valor máximo con `type="number"`.
- **`options`** · `SiremSelectOption[]` · _por defecto `[]`_
    Opciones estáticas del autocompletado.
- **`optionsEndpoint`** · `string | null`
    URL GET que devuelve `{ objects: [...] }` (o un array directo).
- **`endpointOptions`** · `string | null`
    Alias de `optionsEndpoint`.
- **`optionsParams`** · `Record<string, unknown>`
    Query params del endpoint.
- **`optionsEndpointParams`** · `Record<string, unknown> | null`
    Alias de `optionsParams` (formato Lion: `optionsEndpointParams`).
- **`optionsResponsePath`** · `string | null`
    Ruta por puntos hasta el array dentro de la respuesta (p. ej. `"items"`, `"result.objects"`, `"data.items"`). Sin definir acepta un array directo o `{ objects: [...] }`.
- **`optionsMapper`** · `SiremOptionsMapper | null`
    Convierte cada elemento remoto en `{ value, label }`.
- **`strictOptions`** · `boolean` · _por defecto `false`_
    Solo admite valores de la lista → se comporta como select.
- **`isStrict`** · `boolean` · _por defecto `false`_
    Alias de `strictOptions`.
- **`multiple`** · `boolean` · _por defecto `false`_
    Multi-selección con chips (`value` es un array).
- **`isMultiple`** · `boolean` · _por defecto `false`_
    Alias de `multiple`.
- **`prefixIcon`** · `string` · _por defecto `''`_
    Icono inicial (clase `fi fi-rr-user`). Reserva espacio a la izquierda.
- **`suffixIcon`** · `string` · _por defecto `''`_
    Icono final (clase `fi fi-rr-eye`). Reserva espacio a la derecha.

#### Tipos y esquemas

- **`SiremInputType`** · _unión_
    Tipo nativo del campo (atributo `type` del input HTML).
    - **Definición:** `'text' | 'number' | 'email' | 'password' | 'tel' | 'url'`
    - `text` — Texto libre. Es el valor por defecto.
    - `number` — Numérico: usa `min`/`max` y el teclado numérico.
    - `email` — Correo: teclado y validación del navegador.
    - `password` — Contraseña: el texto se oculta.
    - `tel` — Teléfono: teclado numérico.
    - `url` — Dirección web con validación básica.
- **`SiremSelectOption`** · _interfaz_
    Opción de un desplegable: valor interno y texto visible.
    - **Campos:**
        - `value` · `string | number`
        - `label` · `string`
- **`SiremOptionsMapper`** · _alias_
    Convierte cada elemento de `objects` en una opción del listado.
    - **Definición:** `(item: unknown) => SiremSelectOption`

### `SiremInvoiceEditor`

Selector: `sirem-invoice-editor` · [Demo](projects/demo/src/app/pages/invoice-editor-demo)

Editor de factura de venta: cabecera (cliente, N°, fechas, notas), conceptos editables con IVA y descuento por línea y resumen de totales.

#### Entradas

- **`draft`** · `SiremInvoiceDraft` · _por defecto `siremEmptyInvoice()`_
    Estado editable de la factura (doble vía con `[(draft)]`).
- **`customers`** · `SiremInvoiceCustomer[]` · _por defecto `[]`_
    Clientes disponibles en el select de cabecera.
- **`nextNumber`** · `string` · _por defecto `''`_
    Correlativo sugerido cuando no hay número.
- **`taxRates`** · `number[]` · _por defecto `[0, 5, 19]`_
    Tarifas de IVA ofrecidas por línea.
- **`currency`** · `string` · _por defecto `'COP'`_
    Código ISO del formato monetario (`siremMoney`).
- **`status`** · `SiremInvoiceStatus` · _por defecto `'draft'`_
    Estado fiscal mostrado en la pastilla.
    - **Valores:**
      - `draft` — Borrador: aún editable.
      - `issued` — Emitida: deja de ser editable.
      - `void` — Anulada.
- **`loading`** · `boolean` · _por defecto `false`_
    Bloquea el botón Guardar mientras persiste.

#### Salidas

- **`saved`** · `SiremInvoiceDraft`
    Factura válida lista para persistir.
    - **Devuelve:**
      - `number` · `string` — Número de la factura.
      - `customerId` · `string | number | null` — Cliente elegido (`value` de `customers`).
      - `issueDate` · `string` — Fecha de emisión `yyyy-mm-dd`.
      - `dueDate` · `string` — Fecha de vencimiento `yyyy-mm-dd`.
      - `notes` · `string` — Notas libres del pie.
      - `lines` · `SiremInvoiceLine[]` — Líneas de la factura.
- **`cancelled`** · `void`
    Se descartan los cambios (el draft vuelve a vacío).
    - **Devuelve:** No emite datos: el evento no lleva carga útil.

#### Tipos y esquemas

- **`SiremInvoiceDraft`** · _interfaz_
    Cabecera + conceptos de la factura (lo que edita y emite el componente).
    - **Campos:**
        - `number` · `string` — Número de la factura.
        - `customerId` · `string | number | null` — Cliente elegido (`value` de `customers`).
        - `issueDate` · `string` — Fecha de emisión `yyyy-mm-dd`.
        - `dueDate` · `string` — Fecha de vencimiento `yyyy-mm-dd`.
        - `notes` · `string` — Notas libres del pie.
        - `lines` · `SiremInvoiceLine[]` — Líneas de la factura.
- **`SiremInvoiceCustomer`** · _interfaz_
    Cliente / tercero que se factura. `value` es el id de tu dominio.
    - **Campos:**
        - `value` · `string | number`
        - `label` · `string`
        - `taxId?` · `string` — NIT / CC / razón social secundaria.
- **`SiremInvoiceStatus`** · _unión_
    Estado fiscal del documento.
    - **Definición:** `'draft' | 'issued' | 'void'`
    - `draft` — Borrador: aún editable.
    - `issued` — Emitida: deja de ser editable.
    - `void` — Anulada.
- **`SiremInvoiceLine`** · _interfaz_
    Concepto (línea) de la factura.
    - **Campos:**
        - `id` · `string` — Identificador de la línea.
        - `description` · `string` — Concepto facturado.
        - `quantity` · `number` — Cantidad.
        - `unitPrice` · `number` — Precio unitario antes de impuestos.
        - `discount` · `number` — Descuento por línea en porcentaje (0–100).
        - `taxRate` · `number` — Tarifa de IVA en porcentaje (0, 5, 19…).

### `SiremList`

Selector: `sirem-list` · [Demo](projects/demo/src/app/pages/list-demo)

Lista simple de filas (título + subtítulo + icono/avatar + badge). Alternativa ligera a la tabla para móviles y paneles. Uso:

#### Entradas

- **`items`** · `SiremListItem[]` · _obligatorio_
    Elementos a mostrar (título, subtítulo, icono, avatar…).
- **`dividers`** · `boolean` · _por defecto `true`_
    Separadores entre filas.
- **`emptyText`** · `string` · _por defecto `'Sin elementos.'`_
    Texto que se muestra cuando `items` está vacío.

#### Salidas

- **`itemPressed`** · `SiremListItem`
    Se emite con el elemento pulsado.
    - **Devuelve:**
      - `title` · `string` — Texto principal de la fila.
      - `subtitle?` · `string` — Línea secundaria bajo el título.
      - `meta?` · `string` — Texto a la derecha (hora, valor…).
      - `icon?` · `string` — Clase CSS del icono líder (p. ej. `fi fi-rr-user`).
      - `svg?` · `string` — SVG inline líder (duotone / streamline). Prioridad sobre `icon`.
      - `avatarName?` · `string` — Muestra avatar con estas iniciales en lugar de icono.
      - `avatarSrc?` · `string | null` — URL del avatar, usado junto a `avatarName`.
      - `badge?` · `string` — Texto del badge de la derecha.
      - `badgeTone?` · `SiremBadgeTone` — Color del badge (`neutral` si se omite).
      - `chevron?` · `boolean` — Muestra chevron › a la derecha.
      - `disabled?` · `boolean` — Atenúa la fila y bloquea la pulsación.
      - `value?` · `any` — Dato libre que se devuelve en `itemPressed`.

#### Tipos y esquemas

- **`SiremListItem`** · _interfaz_
    Fila de la lista.
    - **Campos:**
        - `title` · `string` — Texto principal de la fila.
        - `subtitle?` · `string` — Línea secundaria bajo el título.
        - `meta?` · `string` — Texto a la derecha (hora, valor…).
        - `icon?` · `string` — Clase CSS del icono líder (p. ej. `fi fi-rr-user`).
        - `svg?` · `string` — SVG inline líder (duotone / streamline). Prioridad sobre `icon`.
        - `avatarName?` · `string` — Muestra avatar con estas iniciales en lugar de icono.
        - `avatarSrc?` · `string | null` — URL del avatar, usado junto a `avatarName`.
        - `badge?` · `string` — Texto del badge de la derecha.
        - `badgeTone?` · `SiremBadgeTone` — Color del badge (`neutral` si se omite).
        - `chevron?` · `boolean` — Muestra chevron › a la derecha.
        - `disabled?` · `boolean` — Atenúa la fila y bloquea la pulsación.
        - `value?` · `any` — Dato libre que se devuelve en `itemPressed`.
- **`SiremBadgeTone`** · _unión_
    Semántica de color del badge.
    - **Definición:** `'neutral' | 'info' | 'accent' | 'success' | 'warning' | 'danger'`
    - `neutral` — Sin semántica de color. Para etiquetas informativas.
    - `info` — Informativo, con tinte azul de marca.
    - `accent` — Acento de marca (lima). Destaca sin semántica de estado.
    - `success` — Correcto o confirmado.
    - `warning` — Pendiente o con atención.
    - `danger` — Error, vencido o bloqueado.

### `SiremModal`

Selector: `sirem-modal` · [Demo](projects/demo/src/app/pages/modal-demo)

Diálogo modal genérico (CRUD sin recargar página: equivale a `ElementModalFormDynamicComponent`)…

#### Entradas

- **`open`** · `boolean` · _por defecto `false`_
    Estado abierto, con enlace de dos vías.
- **`title`** · `string` · _por defecto `''`_
    Título del diálogo y nombre accesible del panel.
- **`size`** · `SiremModalSize` · _por defecto `'md'`_
    Ancho máximo: `sm`, `md` (defecto), `lg` o `xl`.
    - **Valores:**
      - `sm` — 28 rem de ancho máximo. Confirmaciones.
      - `md` — 36 rem. Formularios cortos. Es el valor por defecto.
      - `lg` — 48 rem. Contenido amplio o tablas.
      - `xl` — 64 rem. Vistas muy densas.
- **`persistent`** · `boolean` · _por defecto `false`_
    Si es true, el backdrop y Escape no lo cierran.
- **`backdropClose`** · `boolean` · _por defecto `true`_
    Cerrar al pulsar fuera del panel (el fondo). Independiente de `persistent`: con `false` el fondo no cierra pero Escape sigue funcionando, salvo que también sea `persistent`.
- **`actions`** · `SiremModalAction[]` · _por defecto `[]`_
    Botones del footer (admiten N acciones con variante, icono y loading).
- **`actionsAlign`** · `SiremModalActionsAlign` · _por defecto `'end'`_
    Alineación de los botones declarativos.
    - **Valores:**
      - `start` — Botones a la izquierda.
      - `center` — Botones centrados.
      - `end` — Botones a la derecha. Es el valor por defecto.
      - `stretch` — Botones repartidos a lo ancho del pie.

#### Salidas

- **`closed`** · `void`
    Se emite al cerrarse.
    - **Devuelve:** No emite datos: el evento no lleva carga útil.
- **`actionPressed`** · `SiremModalAction`
    Se emite con el botón pulsado del footer declarativo.
    - **Devuelve:**
      - `label` · `string` — Texto del botón.
      - `variant?` · `SiremButtonVariant` — Variante visual (defecto `secondary`).
      - `size?` · `SiremButtonSize` — Tamaño (defecto `sm`).
      - `icon?` · `string` — Clase CSS del icono en `slot="icon"` (p. ej. `fi fi-rr-check`).
      - `disabled?` · `boolean` — Deshabilita el botón.
      - `loading?` · `boolean` — Muestra el estado de carga del botón.
      - `value?` · `any` — Dato libre que se devuelve en `actionPressed`.

#### Tipos y esquemas

- **`SiremModalSize`** · _unión_
    Ancho máximo del diálogo.
    - **Definición:** `'sm' | 'md' | 'lg' | 'xl'`
    - `sm` — 28 rem de ancho máximo. Confirmaciones.
    - `md` — 36 rem. Formularios cortos. Es el valor por defecto.
    - `lg` — 48 rem. Contenido amplio o tablas.
    - `xl` — 64 rem. Vistas muy densas.
- **`SiremModalAction`** · _interfaz_
    Botón del footer declarativo del modal.
    - **Campos:**
        - `label` · `string` — Texto del botón.
        - `variant?` · `SiremButtonVariant` — Variante visual (defecto `secondary`).
        - `size?` · `SiremButtonSize` — Tamaño (defecto `sm`).
        - `icon?` · `string` — Clase CSS del icono en `slot="icon"` (p. ej. `fi fi-rr-check`).
        - `disabled?` · `boolean` — Deshabilita el botón.
        - `loading?` · `boolean` — Muestra el estado de carga del botón.
        - `value?` · `any` — Dato libre que se devuelve en `actionPressed`.
- **`SiremModalActionsAlign`** · _unión_
    Alineación de los botones declarativos del pie del modal.
    - **Definición:** `'start' | 'center' | 'end' | 'stretch'`
    - `start` — Botones a la izquierda.
    - `center` — Botones centrados.
    - `end` — Botones a la derecha. Es el valor por defecto.
    - `stretch` — Botones repartidos a lo ancho del pie.
- **`SiremButtonVariant`** · _unión_
    Estilo visual del botón (semántica de color).
    - **Definición:** `'primary' | 'accent' | 'secondary' | 'success' | 'warning' | 'ghost' | 'danger'`
    - `primary` — Acción principal. Fondo de marca con el texto de contraste del tema.
    - `accent` — Acento de marca (lima). Acción destacada sin ser la principal.
    - `secondary` — Acción secundaria. Fondo de superficie con borde.
    - `success` — Confirmación o resultado correcto.
    - `warning` — Aviso o estado que requiere atención.
    - `ghost` — Sin fondo ni borde; solo al pasar el cursor cobra fondo.
    - `danger` — Acción destructiva o error.
- **`SiremButtonSize`** · _unión_
    Tamaño del botón; `md` iguala la altura de los campos.
    - **Definición:** `'sm' | 'md' | 'lg'`
    - `sm` — Compacto, 2rem de alto. Para barras, cabeceras y tablas.
    - `md` — Base, 2.5rem. Igual de alto que los campos del formulario.
    - `lg` — Amplio, 3rem. Para acciones destacadas.

### `SiremMultiSelect`

Selector: `sirem-multi-select` · [Demo](projects/demo/src/app/pages/multi-select-demo)

Selector de opciones múltiples con buscador, grupos e iconos. Ideal para características, permisos y roles. Uso:

#### Entradas

- **`options`** · `SiremMultiSelectOption[]` · _obligatorio_
    Opciones seleccionables (valor, texto e icono opcional).
- **`value`** · `(string | number)[]` · _por defecto `[]`_
    Valores seleccionados (doble vía).
- **`label`** · `string` · _por defecto `''`_
    Etiqueta visible sobre el control.
- **`searchPlaceholder`** · `string` · _por defecto `'Buscar opciones…'`_
    Texto de ejemplo del buscador interno.
- **`emptyText`** · `string` · _por defecto `'Sin coincidencias.'`_
    Mensaje cuando ninguna opción coincide con el filtro.
- **`hint`** · `string` · _por defecto `''`_
    Nota de ayuda bajo el campo; la sustituye `error` cuando lo hay.
- **`error`** · `string` · _por defecto `''`_
    Mensaje de error. Con texto, el campo se marca en rojo y se anuncia.
- **`disabled`** · `boolean` · _por defecto `false`_
    Deshabilita el control: no se puede enfocar ni editar.
- **`selectAll`** · `boolean` · _por defecto `true`_
    Muestra el botón elegir/quitar todas.
- **`maxHeight`** · `number` · _por defecto `280`_
    Alto máximo de la lista con scroll.
- **`ungroupedTitle`** · `string` · _por defecto `''`_
    Título para el grupo sin grupo.

#### Tipos y esquemas

- **`SiremMultiSelectOption`** · _interfaz_
    Opción elegible (permiso, rol, característica…).
    - **Campos:**
        - `value` · `string | number`
        - `label` · `string`
        - `hint?` · `string`
        - `icon?` · `string` — Clase CSS del icono (p. ej. `fi fi-rr-eye`).
        - `svg?` · `string` — SVG inline (duotone / streamline). Prioridad sobre `icon`.
        - `group?` · `string` — Grupo al que pertenece (para agrupar y buscar).
        - `disabled?` · `boolean`

### `SiremNavbar`

Selector: `sirem-navbar` · [Demo](projects/demo/src/app/pages/navbar-demo)

Barra de navegación con cuatro disposiciones: - `vertical`: lista apilada en panel (módulos, ajustes). - `horizontal`: fila superior con submenús desplegables. - `minibar`: riel solo-iconos con submenús flotantes…

#### Entradas

- **`items`** · `SiremNavItem[]` · _obligatorio_
    Árbol de navegación (iconos, hijos, permisos, separadores…).
- **`layout`** · `SiremNavbarLayout` · _por defecto `'vertical'`_
    Disposición: `vertical`, `horizontal`, `minibar` o `floating`.
    - **Valores:**
      - `vertical` — Rail lateral con los ítems en columna.
      - `horizontal` — Barra superior con los ítems en fila.
      - `minibar` — Rail estrecho: solo iconos, con tooltip.
      - `floating` — Pieza flotante separada de los bordes.
- **`permissions`** · `Set<string> | string[] | null`
    Permisos del usuario; oculta ítems con `permission` ausente.
- **`stickyAppearance`** · `'auto' | SiremStickyAppearance` · _por defecto `'auto'`_
    Aspecto **mientras la directiva `siremSticky` la mantiene fija**. `auto` (defecto) mantiene el de `appearance`; `elevated`, `glass` o `flat` cambian la piel al pegarse.
- **`appearance`** · `SiremStickyAppearance` · _por defecto `'default'`_
    Aspecto normal: `default`, `elevated`, `glass` o `flat`.
    - **Valores:**
      - `default` — El aspecto propio del componente.
      - `elevated` — Superficie con sombra: se despega del contenido.
      - `glass` — Superficie translúcida con desenfoque (efecto cristal).
      - `flat` — Sin fondo, borde ni sombra: se funde con la página.
- **`blur`** · `boolean` · _por defecto `false`_
    Fondo translúcido con desenfoque (ideal con `siremSticky`).
- **`submenu`** · `SiremSubmenuConfig`
    Gesto y colocación de los submenús, por franja de ancho de pantalla. - `[submenu]="{ trigger: 'hover' }"` → el mismo gesto en todas las franjas. - `[submenu]="{ breakpoint: 1024, desktop: { trigger: 'hover' }, mobile: { trigger: 'click' } }"` → hover por encima de 1024 px y click por debajo. Sin configurar: `hover` en escritorio, `click` en móvil y `breakpoint` 768.

#### Salidas

- **`itemPressed`** · `SiremNavItem`
    Se emite al pulsar un ítem.
    - **Devuelve:**
      - `label` · `string` — Texto del ítem.
      - `icon?` · `string` — Clase CSS del icono (p. ej. `fi fi-rr-users`).
      - `svg?` · `string` — SVG inline (duotone/streamline). Tiene prioridad sobre `icon`.
      - `route?` · `string | any[]` — Ruta de Angular a la que navega.
      - `href?` · `string` — Enlace externo (`href`); alternativa a `route` para URLs fuera de la app.
      - `img?` · `string` — Imagen redonda como icono (p. ej. logo); prioridad sobre `svg`/`icon`.
      - `badge?` · `string | number` — Texto o número del badge de la derecha.
      - `permission?` · `string` — Permiso requerido; se oculta si no está en `permissions`.
      - `tooltip?` · `string` — Texto del tooltip flotante al pasar el ratón con el sidebar colapsado (solo iconos). Por defecto usa `label`.
      - `children?` · `SiremNavItem[]` — Subítems; con hijos el ítem se vuelve desplegable.

#### Tipos y esquemas

- **`SiremNavItem`** · _interfaz_
    Ítem de navegación jerárquica del sidebar / navbar.
    - **Campos:**
        - `label` · `string` — Texto del ítem.
        - `icon?` · `string` — Clase CSS del icono (p. ej. `fi fi-rr-users`).
        - `svg?` · `string` — SVG inline (duotone/streamline). Tiene prioridad sobre `icon`.
        - `route?` · `string | any[]` — Ruta de Angular a la que navega.
        - `href?` · `string` — Enlace externo (`href`); alternativa a `route` para URLs fuera de la app.
        - `img?` · `string` — Imagen redonda como icono (p. ej. logo); prioridad sobre `svg`/`icon`.
        - `badge?` · `string | number` — Texto o número del badge de la derecha.
        - `permission?` · `string` — Permiso requerido; se oculta si no está en `permissions`.
        - `tooltip?` · `string` — Texto del tooltip flotante al pasar el ratón con el sidebar colapsado (solo iconos). Por defecto usa `label`.
        - `children?` · `SiremNavItem[]` — Subítems; con hijos el ítem se vuelve desplegable.
- **`SiremNavbarLayout`** · _unión_
    Disposición de la barra de navegación.
    - **Definición:** `'vertical' | 'horizontal' | 'minibar' | 'floating'`
    - `vertical` — Rail lateral con los ítems en columna.
    - `horizontal` — Barra superior con los ítems en fila.
    - `minibar` — Rail estrecho: solo iconos, con tooltip.
    - `floating` — Pieza flotante separada de los bordes.
- **`SiremStickyAppearance`** · _unión_
    Aspecto que puede adoptar una barra (topbar, navbar o page-header): - `default`: el aspecto propio del componente. - `elevated`: superficie + sombra, despegada del contenido. - `glass`: superficie translúcida con desenfoque (cristal). - `flat`: sin fondo, borde ni sombra; se funde con la página. Se usa en `appearance` (aspecto normal) y `stickyAppearance` (al quedar fija), de modo que una barra puede cambiar de piel al pegarse.
    - **Definición:** `'default' | 'elevated' | 'glass' | 'flat'`
    - `default` — El aspecto propio del componente.
    - `elevated` — Superficie con sombra: se despega del contenido.
    - `glass` — Superficie translúcida con desenfoque (efecto cristal).
    - `flat` — Sin fondo, borde ni sombra: se funde con la página.
- **`SiremSubmenuConfig`** · _interfaz_
    Configuración de los submenús de un componente de navegación. Cada ajuste se resuelve con esta prioridad: banda activa (`mobile`/`desktop`) → valor común → defecto.
    - **Campos:**
        - `breakpoint?` · `number` — Ancho en px que separa las bandas: `≤ breakpoint` es móvil. Defecto `768`.
        - `mobile?` · `SiremSubmenuBand` — Ajustes solo en pantallas estrechas (≤ `breakpoint`).
        - `desktop?` · `SiremSubmenuBand` — Ajustes solo en pantallas anchas (> `breakpoint`).
- **`SiremSubmenuBand`** · _interfaz_
    Ajustes del overlay de submenú para una franja de ancho concreto.
    - **Campos:**
        - `trigger?` · `SiremOverlayTriggerType` — Evento que abre el panel: `hover`, `click`, `dblclick`, `contextmenu`, `longpress` o `manual`.
        - `placement?` · `SiremOverlayPlacement` — Lado del ítem por el que sale el panel y su alineación (`bottom-start`, `right-start`…).
        - `offset?` · `number` — Separación en px entre el ítem y el panel.
        - `hoverDelayMs?` · `number` — Espera con el puntero encima antes de abrir (`hover`).
        - `hoverHideDelayMs?` · `number` — Espera tras salir del panel antes de cerrar (`hover`); da tiempo a llegar a él.
- **`SiremOverlayTriggerType`** · _unión_
    Evento que abre el overlay.
    - **Definición:** `'click' | 'dblclick' | 'contextmenu' | 'longpress' | 'hover' | 'manual'`
    - `click` — Un clic. Es el valor por defecto y el mas habitual.
    - `dblclick` — Doble clic. Evita abrir el menu a la primera pulsacion.
    - `contextmenu` — Clic derecho. El panel sale bajo el puntero y el menu del navegador no aparece.
    - `longpress` — Mantener pulsado el tiempo de `siremOverlayLongPressMs`.
    - `hover` — El puntero entra y permanece `siremOverlayHoverDelayMs` sobre el elemento.
    - `manual` — Ignora los eventos del raton; solo responde a `[(open)]` desde codigo.
- **`SiremOverlayPlacement`** · _alias_
    Combinación de lado y alineación admitida.
    - **Definición:** `SiremOverlaySide | 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end' | 'left-start' | 'left-center' | 'left-end' | 'right-start' | 'right-center' | 'right-end'`
- **`SiremOverlaySide`** · _unión_
    Lado del disparador por el que sale el panel.
    - **Definición:** `'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end'`
    - `top`
    - `bottom`
    - `left`
    - `right`
    - `inline-start`
    - `inline-end`

### `SiremOverlayViewport`

Selector: `sirem-overlay-viewport` · [Demo](projects/demo/src/app/pages/overlay-demo)

Configurador opcional de la capa de overlays. **No hace falta montarlo**: `[siremOverlay]` crea la capa por sí sola la primera vez que se usa, con estilos y `z-index` por defecto…

#### Entradas

- **`zIndex`** · `number` · _por defecto `1200`_
    z-index de la capa de overlays.

### `SiremPageHeader`

Selector: `sirem-page-header` · [Demo](projects/demo/src/app/pages/page-header-demo)

Cabecera estandarizada de listados (`lo-resource-set-list`): título + subtítulo descriptivo + acciones proyectadas.

#### Entradas

- **`title`** · `string` · _obligatorio_
    Título de la página.
- **`subtitle`** · `string` · _por defecto `''`_
    Línea de contexto bajo el título.
- **`appearance`** · `SiremStickyAppearance` · _por defecto `'default'`_
    Aspecto normal: `default` (transparente), `elevated`, `glass` o `flat`.
    - **Valores:**
      - `default` — El aspecto propio del componente.
      - `elevated` — Superficie con sombra: se despega del contenido.
      - `glass` — Superficie translúcida con desenfoque (efecto cristal).
      - `flat` — Sin fondo, borde ni sombra: se funde con la página.
- **`stickyAppearance`** · `'auto' | SiremStickyAppearance` · _por defecto `'elevated'`_
    Aspecto **mientras la directiva `siremSticky` la mantiene fija**. `auto` hereda `appearance`; por defecto `elevated`, para que el contenido no se vea detrás del título.

#### Tipos y esquemas

- **`SiremStickyAppearance`** · _unión_
    Aspecto que puede adoptar una barra (topbar, navbar o page-header): - `default`: el aspecto propio del componente. - `elevated`: superficie + sombra, despegada del contenido. - `glass`: superficie translúcida con desenfoque (cristal). - `flat`: sin fondo, borde ni sombra; se funde con la página. Se usa en `appearance` (aspecto normal) y `stickyAppearance` (al quedar fija), de modo que una barra puede cambiar de piel al pegarse.
    - **Definición:** `'default' | 'elevated' | 'glass' | 'flat'`
    - `default` — El aspecto propio del componente.
    - `elevated` — Superficie con sombra: se despega del contenido.
    - `glass` — Superficie translúcida con desenfoque (efecto cristal).
    - `flat` — Sin fondo, borde ni sombra: se funde con la página.

### `SiremPopupCard`

Selector: `sirem-popup-card` · [Demo](projects/demo/src/app/pages/popup-card-demo)

Tarjeta flotante ligera para ventanas emergentes de mapa (telemetría GPS: velocidad, batería, última posición…)…

#### Entradas

- **`title`** · `string` · _por defecto `'Dispositivo'`_
    Identificador del dispositivo (p. ej. placa o IMEI corto).
- **`rows`** · `SiremPopupRow[]` · _por defecto `[]`_
    Filas `etiqueta → valor`, con tono de badge opcional.
- **`closable`** · `boolean` · _por defecto `true`_
    Muestra el botón de cerrar de la cabecera.

#### Salidas

- **`closed`** · `void`
    Se emite al pulsar cerrar.
    - **Devuelve:** No emite datos: el evento no lleva carga útil.

#### Tipos y esquemas

- **`SiremPopupRow`** · _interfaz_
    Fila de telemetría clave → valor (velocidad, batería…).
    - **Campos:**
        - `label` · `string`
        - `value` · `string`
        - `tone?` · `SiremBadgeTone`
- **`SiremBadgeTone`** · _unión_
    Semántica de color del badge.
    - **Definición:** `'neutral' | 'info' | 'accent' | 'success' | 'warning' | 'danger'`
    - `neutral` — Sin semántica de color. Para etiquetas informativas.
    - `info` — Informativo, con tinte azul de marca.
    - `accent` — Acento de marca (lima). Destaca sin semántica de estado.
    - `success` — Correcto o confirmado.
    - `warning` — Pendiente o con atención.
    - `danger` — Error, vencido o bloqueado.

### `SiremRadioGroup`

Selector: `sirem-radio-group-field` · [Demo](projects/demo/src/app/pages/radio-group-demo)

Grupo de opciones excluyentes (tipo de persona, régimen…).

#### Entradas

- **`value`** · `string | number | null`
    Opción seleccionada, con enlace de dos vías.
- **`options`** · `SiremSelectOption[]` · _por defecto `[]`_
    Opciones del grupo (valor y texto).
- **`label`** · `string` · _por defecto `''`_
    Título del grupo; se asocia al `fieldset` como leyenda.
- **`hint`** · `string` · _por defecto `''`_
    Nota de ayuda bajo el grupo.
- **`groupName`** · `string` · _por defecto `'sirem-radio'`_
    Nombre compartido por los radios para agruparlos en el DOM.
- **`orientation`** · `'horizontal' | 'vertical'` · _por defecto `'horizontal'`_
    `horizontal` (fila) o `vertical` (columna).
    - **Valores:**
      - `horizontal` — Opciones en fila. Es el valor por defecto.
      - `vertical` — Opciones en columna.
- **`required`** · `boolean` · _por defecto `false`_
    Marca el campo como obligatorio (`aria-required` e indicador visual).
- **`disabled`** · `boolean` · _por defecto `false`_
    Deshabilita todas las opciones.

#### Tipos y esquemas

- **`SiremSelectOption`** · _interfaz_
    Opción de un desplegable: valor interno y texto visible.
    - **Campos:**
        - `value` · `string | number`
        - `label` · `string`

### `SiremRichText`

Selector: `sirem-rich-text` · [Demo](projects/demo/src/app/pages/rich-text-demo)

Editor de texto enriquecido liviano (contenteditable + barra de formato). Devuelve HTML en doble vía; sin dependencias externas. Uso:

#### Entradas

- **`value`** · `string` · _por defecto `''`_
    HTML del contenido (doble vía).
- **`label`** · `string` · _por defecto `''`_
    Etiqueta visible sobre el editor.
- **`placeholder`** · `string` · _por defecto `'Escribe aquí…'`_
    Texto de ayuda mientras el contenido está vacío.
- **`hint`** · `string` · _por defecto `''`_
    Nota de ayuda bajo el editor.
- **`error`** · `string` · _por defecto `''`_
    Mensaje de error. Con texto, el campo se marca en rojo y se anuncia.
- **`minHeight`** · `number` · _por defecto `140`_
    Alto mínimo del área en px.

### `SiremSearchField`

Selector: `sirem-search-field` · [Demo](projects/demo/src/app/pages/search-field-demo)

Campo de búsqueda con lupa y botón limpiar (filtros de listados).

#### Entradas

- **`value`** · `string` · _por defecto `''`_
    Texto de búsqueda, con enlace de dos vías.
- **`label`** · `string` · _por defecto `''`_
    Etiqueta del buscador (a menudo solo accesible).
- **`placeholder`** · `string` · _por defecto `'Buscar…'`_
    Texto de ejemplo dentro del campo.
- **`disabled`** · `boolean` · _por defecto `false`_
    Deshabilita el control: no se puede enfocar ni editar.
- **`error`** · `string` · _por defecto `''`_
    Mensaje de error. Con texto, el campo se marca en rojo y se anuncia.

### `SiremSearchPalette`

Selector: `sirem-search-palette` · [Demo](projects/demo/src/app/pages/search-palette-demo)

Buscador global estilo paleta de comandos (equivale a `SearchPalettesComponent`). Se abre con `Ctrl+K` / `Cmd+K` desde cualquier vista; filtra por texto, navega con ↑↓ + Enter y se cierra con Escape. Uso:

#### Entradas

- **`items`** · `SiremPaletteItem[]` · _por defecto `[]`_
    Entradas buscables (título, sección, icono, ruta).
- **`placeholder`** · `string` · _por defecto `'Buscar pacientes, facturas, placas…'`_
    Texto de ejemplo del buscador.
- **`open`** · `boolean` · _por defecto `false`_
    Controla la visibilidad de la paleta, con enlace de dos vías.

#### Salidas

- **`selected`** · `SiremPaletteItem`
    Se emite con la entrada elegida.
    - **Devuelve:**
      - `label` · `string` — Texto principal del resultado.
      - `hint?` · `string` — Contexto secundario (ruta, tipo, sede…).
      - `group?` · `string` — Sección a la que pertenece el resultado.

#### Tipos y esquemas

- **`SiremPaletteItem`** · _interfaz_
    Resultado seleccionable de la paleta (paciente, factura, placa, acción…).
    - **Campos:**
        - `label` · `string` — Texto principal del resultado.
        - `hint?` · `string` — Contexto secundario (ruta, tipo, sede…).
        - `group?` · `string` — Sección a la que pertenece el resultado.

### `SiremSegmented`

Selector: `sirem-segmented` · [Demo](projects/demo/src/app/pages/segmented-demo)

Control segmentado de pastillas (referencia Bento): un grupo de opciones excluyentes donde la activa se resalta con una ficha que **se desliza** hasta la opción elegida…

#### Entradas

- **`items`** · `SiremSegmentedItem[] | null`
    Opciones a mostrar. Con `null` (defecto) el control es el switch fijo **Tabla ⇄ Tarjetas** (`table` / `cards`).
- **`value`** · `string | null`
    Valor activo (doble vía).
- **`size`** · `SiremSegmentedSize` · _por defecto `'md'`_
    Alto del control: `sm`, `md` (defecto) o `lg`.
    - **Valores:**
      - `sm` — Compacto, texto de 0.75 rem. Para barras y tablas.
      - `md` — Base. Es el valor por defecto.
      - `lg` — Amplio, texto de 0.9375 rem y más aire.
- **`tone`** · `'default' | 'accent'` · _por defecto `'default'`_
    `accent` pinta la ficha activa con el acento lima.
    - **Valores:**
      - `default` — Ficha activa en tinta. Es el valor por defecto.
      - `accent` — Ficha activa con el acento lima.
- **`stretch`** · `boolean` · _por defecto `false`_
    Ocupa el 100 % del ancho, repartiendo las opciones.
- **`ariaLabel`** · `string | null`
    Nombre accesible del grupo de botones.

#### Tipos y esquemas

- **`SiremSegmentedItem`** · _interfaz_
    Opción del control segmentado.
    - **Campos:**
        - `value` · `string`
        - `label` · `string`
        - `icon?` · `string` — Clase CSS de icono opcional (p. ej. `fi fi-rr-grid`).
        - `hint?` · `string` — Texto pequeño bajo la etiqueta (p. ej. la fecha en un selector de día).
- **`SiremSegmentedSize`** · _unión_
    Texto pequeño bajo la etiqueta (p. ej. la fecha en un selector de día).
    - **Definición:** `'sm' | 'md' | 'lg'`
    - `sm` — Compacto, texto de 0.75 rem. Para barras y tablas.
    - `md` — Base. Es el valor por defecto.
    - `lg` — Amplio, texto de 0.9375 rem y más aire.

### `SiremSelect`

Selector: `sirem-select-field` · [Demo](projects/demo/src/app/pages/select-demo)

Selector desplegable (especialidad, estado civil, tipo de documento…) sobre un `<select>` nativo…

#### Entradas

- **`value`** · `string | number | null`
    Valor seleccionado, con enlace de dos vías.
- **`options`** · `SiremSelectOption[]` · _por defecto `[]`_
    Opciones del desplegable (valor y texto).
- **`label`** · `string` · _por defecto `''`_
    Etiqueta visible sobre el control.
- **`placeholder`** · `string` · _por defecto `'Seleccionar…'`_
    Texto que se muestra mientras no hay selección.
- **`hint`** · `string` · _por defecto `''`_
    Nota de ayuda bajo el campo; la sustituye `error` cuando lo hay.
- **`error`** · `string` · _por defecto `''`_
    Mensaje de error. Con texto, el campo se marca en rojo y se anuncia.
- **`required`** · `boolean` · _por defecto `false`_
    Marca el campo como obligatorio (`aria-required` e indicador visual).
- **`disabled`** · `boolean` · _por defecto `false`_
    Deshabilita el control: no se puede enfocar ni editar.

#### Tipos y esquemas

- **`SiremSelectOption`** · _interfaz_
    Opción de un desplegable: valor interno y texto visible.
    - **Campos:**
        - `value` · `string | number`
        - `label` · `string`

### `SiremSheet`

Selector: `sirem-sheet` · [Demo](projects/demo/src/app/pages/sheet-demo)

Hoja inferior (bottom sheet) redimensionable con presets y pantalla completa.

#### Entradas

- **`open`** · `boolean` · _por defecto `false`_
    Estado abierto (doble vía).
- **`size`** · `SiremSheetSize` · _por defecto `'md'`_
    Altura predeterminada activa (doble vía).
    - **Valores:**
      - `sm` — 42 % del alto de la ventana.
      - `md` — 62 % del alto. Es el valor por defecto.
      - `lg` — 85 % del alto.
      - `full` — 100 % del alto: pantalla completa.
- **`title`** · `string | null`
    Título de la cabecera y nombre accesible del panel.
- **`subtitle`** · `string | null`
    Línea secundaria bajo el título.
- **`ariaLabel`** · `string | null` · _por defecto `'Panel'`_
    Nombre accesible cuando no hay `title`.
- **`closable`** · `boolean` · _por defecto `true`_
    Muestra el botón de cerrar.
- **`resizable`** · `boolean` · _por defecto `true`_
    Permite arrastrar el asidero para cambiar el alto.
- **`gestureResize`** · `boolean` · _por defecto `false`_
    Permite cambiar el alto con gestos verticales **dentro del contenido** (móvil y ratón). Arriba agranda hasta `full`; abajo encoge, y solo si el contenido está al principio (`scrollTop === 0`) para no robar el scroll. Desactivado por defecto: el contenido scrollea normal.
- **`maximizable`** · `boolean` · _por defecto `true`_
    Permite llegar a pantalla completa.
- **`minimizable`** · `boolean` · _por defecto `true`_
    Permite encoger. Con `false` el sheet vive siempre en `full` y no se muestran ni el asidero ni el botón de restaurar.
- **`backdropClose`** · `boolean` · _por defecto `true`_
    Cerrar al pulsar el fondo.
- **`closeOnEscape`** · `boolean` · _por defecto `true`_
    Cerrar con `Escape`.
- **`defaultSize`** · `SiremSheetSize` · _por defecto `'md'`_
    Tamaño al que vuelve «restaurar» si aún no se eligió otro.
    - **Valores:**
      - `sm` — 42 % del alto de la ventana.
      - `md` — 62 % del alto. Es el valor por defecto.
      - `lg` — 85 % del alto.
      - `full` — 100 % del alto: pantalla completa.
- **`maxWidth`** · `string` · _por defecto `'100%'`_
    Ancho máximo del panel (cualquier unidad CSS).

#### Salidas

- **`closed`** · `void`
    Se emite al cerrarse, antes de la animación de salida.
    - **Devuelve:** No emite datos: el evento no lleva carga útil.
- **`resized`** · `SiremSheetSize`
    Se emite con el nuevo tamaño al cambiar el alto (asidero, gesto o botón).
    - **Valores:**
      - `sm` — 42 % del alto de la ventana.
      - `md` — 62 % del alto. Es el valor por defecto.
      - `lg` — 85 % del alto.
      - `full` — 100 % del alto: pantalla completa.

#### Tipos y esquemas

- **`SiremSheetSize`** · _unión_
    Alturas predeterminadas del sheet.
    - **Definición:** `'sm' | 'md' | 'lg' | 'full'`
    - `sm` — 42 % del alto de la ventana.
    - `md` — 62 % del alto. Es el valor por defecto.
    - `lg` — 85 % del alto.
    - `full` — 100 % del alto: pantalla completa.

### `SiremSidebar`

Selector: `sirem-sidebar` · [Demo](projects/demo/src/app/pages/sidebar-demo)

Menú lateral jerárquico, colapsable y responsivo…

#### Entradas

- **`items`** · `SiremNavItem[]` · _obligatorio_
    Árbol de navegación (iconos, hijos, permisos, separadores…).
- **`permissions`** · `Set<string> | string[] | null`
    Permisos del usuario; los ítems con `permission` ausente se ocultan.
- **`layout`** · `'vertical' | 'horizontal'` · _por defecto `'vertical'`_
    Disposición: lateral clásica u horizontal superior.
    - **Valores:**
      - `vertical` — Rail lateral con los ítems en columna.
      - `horizontal` — Barra superior con los ítems en fila.
- **`fixed`** · `boolean` · _por defecto `false`_
    Fija la barra al hacer scroll (`position: sticky`).
- **`pinned`** · `boolean` · _por defecto `false`_
    Mantiene el sidebar vertical fijo a pantalla completa en escritorio.
- **`centerNav`** · `boolean` · _por defecto `false`_
    Centra verticalmente los ítems de navegación cuando hay espacio.
- **`blur`** · `boolean` · _por defecto `false`_
    Fondo translúcido con desenfoque (ideal con `fixed`).
- **`floating`** · `boolean` · _por defecto `false`_
    Panel flotante: se separa de los bordes con margen y radio (dashboard).
- **`collapsed`** · `boolean` · _por defecto `false`_
    Colapso total (desktop): solo iconos. Ideal para mapas.
- **`mobileOpen`** · `boolean` · _por defecto `false`_
    Drawer en móvil.
- **`brand`** · `string` · _por defecto `'SIREM UI'`_
    Nombre de la marca en la cabecera del sidebar.
- **`submenu`** · `SiremSubmenuConfig`
    Gesto y colocación de los submenús, por franja de ancho de pantalla. - `[submenu]="{ trigger: 'hover' }"` → el mismo gesto en todas las franjas. - `[submenu]="{ breakpoint: 1024, desktop: { trigger: 'hover' }, mobile: { trigger: 'click' } }"` → hover por encima de 1024 px y click por debajo. Sin configurar: `hover` en escritorio, `click` en móvil y `breakpoint` 768.

#### Salidas

- **`itemPressed`** · `SiremNavItem`
    Se emite al pulsar un ítem (para rutas o telemetría).
    - **Devuelve:**
      - `label` · `string` — Texto del ítem.
      - `icon?` · `string` — Clase CSS del icono (p. ej. `fi fi-rr-users`).
      - `svg?` · `string` — SVG inline (duotone/streamline). Tiene prioridad sobre `icon`.
      - `route?` · `string | any[]` — Ruta de Angular a la que navega.
      - `href?` · `string` — Enlace externo (`href`); alternativa a `route` para URLs fuera de la app.
      - `img?` · `string` — Imagen redonda como icono (p. ej. logo); prioridad sobre `svg`/`icon`.
      - `badge?` · `string | number` — Texto o número del badge de la derecha.
      - `permission?` · `string` — Permiso requerido; se oculta si no está en `permissions`.
      - `tooltip?` · `string` — Texto del tooltip flotante al pasar el ratón con el sidebar colapsado (solo iconos). Por defecto usa `label`.
      - `children?` · `SiremNavItem[]` — Subítems; con hijos el ítem se vuelve desplegable.

#### Tipos y esquemas

- **`SiremNavItem`** · _interfaz_
    Ítem de navegación jerárquica del sidebar / navbar.
    - **Campos:**
        - `label` · `string` — Texto del ítem.
        - `icon?` · `string` — Clase CSS del icono (p. ej. `fi fi-rr-users`).
        - `svg?` · `string` — SVG inline (duotone/streamline). Tiene prioridad sobre `icon`.
        - `route?` · `string | any[]` — Ruta de Angular a la que navega.
        - `href?` · `string` — Enlace externo (`href`); alternativa a `route` para URLs fuera de la app.
        - `img?` · `string` — Imagen redonda como icono (p. ej. logo); prioridad sobre `svg`/`icon`.
        - `badge?` · `string | number` — Texto o número del badge de la derecha.
        - `permission?` · `string` — Permiso requerido; se oculta si no está en `permissions`.
        - `tooltip?` · `string` — Texto del tooltip flotante al pasar el ratón con el sidebar colapsado (solo iconos). Por defecto usa `label`.
        - `children?` · `SiremNavItem[]` — Subítems; con hijos el ítem se vuelve desplegable.
- **`SiremSubmenuConfig`** · _interfaz_
    Configuración de los submenús de un componente de navegación. Cada ajuste se resuelve con esta prioridad: banda activa (`mobile`/`desktop`) → valor común → defecto.
    - **Campos:**
        - `breakpoint?` · `number` — Ancho en px que separa las bandas: `≤ breakpoint` es móvil. Defecto `768`.
        - `mobile?` · `SiremSubmenuBand` — Ajustes solo en pantallas estrechas (≤ `breakpoint`).
        - `desktop?` · `SiremSubmenuBand` — Ajustes solo en pantallas anchas (> `breakpoint`).
- **`SiremSubmenuBand`** · _interfaz_
    Ajustes del overlay de submenú para una franja de ancho concreto.
    - **Campos:**
        - `trigger?` · `SiremOverlayTriggerType` — Evento que abre el panel: `hover`, `click`, `dblclick`, `contextmenu`, `longpress` o `manual`.
        - `placement?` · `SiremOverlayPlacement` — Lado del ítem por el que sale el panel y su alineación (`bottom-start`, `right-start`…).
        - `offset?` · `number` — Separación en px entre el ítem y el panel.
        - `hoverDelayMs?` · `number` — Espera con el puntero encima antes de abrir (`hover`).
        - `hoverHideDelayMs?` · `number` — Espera tras salir del panel antes de cerrar (`hover`); da tiempo a llegar a él.
- **`SiremOverlayTriggerType`** · _unión_
    Evento que abre el overlay.
    - **Definición:** `'click' | 'dblclick' | 'contextmenu' | 'longpress' | 'hover' | 'manual'`
    - `click` — Un clic. Es el valor por defecto y el mas habitual.
    - `dblclick` — Doble clic. Evita abrir el menu a la primera pulsacion.
    - `contextmenu` — Clic derecho. El panel sale bajo el puntero y el menu del navegador no aparece.
    - `longpress` — Mantener pulsado el tiempo de `siremOverlayLongPressMs`.
    - `hover` — El puntero entra y permanece `siremOverlayHoverDelayMs` sobre el elemento.
    - `manual` — Ignora los eventos del raton; solo responde a `[(open)]` desde codigo.
- **`SiremOverlayPlacement`** · _alias_
    Combinación de lado y alineación admitida.
    - **Definición:** `SiremOverlaySide | 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end' | 'left-start' | 'left-center' | 'left-end' | 'right-start' | 'right-center' | 'right-end'`
- **`SiremOverlaySide`** · _unión_
    Lado del disparador por el que sale el panel.
    - **Definición:** `'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end'`
    - `top`
    - `bottom`
    - `left`
    - `right`
    - `inline-start`
    - `inline-end`

### `SiremSparkline`

Selector: `sirem-sparkline` · [Demo](projects/demo/src/app/pages/sparkline-demo)

Minigráfico sin ejes (sparkline) para KPIs dentro de una tarjeta. - `variant="bar"` (defecto): barras tipo píldora, ideal para el Bento. - `variant="line"`: polilínea suave, para tendencias…

#### Entradas

- **`data`** · `number[]` · _obligatorio_
    Serie de valores (positivos).
- **`variant`** · `SiremSparklineVariant` · _por defecto `'bar'`_
    Barras (defecto) o línea.
    - **Valores:**
      - `bar` — Barras verticales.
      - `line` — Línea con área rellena.
- **`tone`** · `SiremSparklineTone` · _por defecto `'neutral'`_
    Color del valor destacado.
    - **Valores:**
      - `neutral` — Neutro, sin color de marca.
      - `accent` — Acento de marca (lima).
      - `sage` — Verde salvia, para tendencias tranquilas.
      - `danger` — Rojo, para caídas o alertas.
- **`highlight`** · `number | null`
    Índice destacado; `null` los deja todos tenues.
- **`height`** · `number` · _por defecto `40`_
    Alto en px.
- **`label`** · `string | null`
    Etiqueta accesible; sin ella el gráfico es decorativo.

#### Tipos y esquemas

- **`SiremSparklineVariant`** · _unión_
    Forma de la minigráfica (área, línea o barras).
    - **Definición:** `'bar' | 'line'`
    - `bar` — Barras verticales.
    - `line` — Línea con área rellena.
- **`SiremSparklineTone`** · _unión_
    Color semántico de la minigráfica.
    - **Definición:** `'neutral' | 'accent' | 'sage' | 'danger'`
    - `neutral` — Neutro, sin color de marca.
    - `accent` — Acento de marca (lima).
    - `sage` — Verde salvia, para tendencias tranquilas.
    - `danger` — Rojo, para caídas o alertas.

### `SiremStatCard`

Selector: `sirem-stat-card` · [Demo](projects/demo/src/app/pages/stat-card-demo)

Tarjeta KPI (total pacientes, facturado del mes, cartera vencida…). - `variant="soft"` (defecto): tarjeta clara habitual. - `variant="tint"`: fondo pastel del tono `color` con icono en chip…

#### Entradas

- **`label`** · `string` · _obligatorio_
    Título de la métrica (p. ej. «Pacientes activos»).
- **`value`** · `string | number` · _obligatorio_
    Valor principal, ya formateado (`'1.248'`, `'98 %'`…).
- **`delta`** · `number | null`
    Variación porcentual; null la oculta.
- **`deltaLabel`** · `string` · _por defecto `'vs. periodo anterior'`_
    Texto que acompaña a la variación (`+12.4 % vs. periodo anterior`). Vacío deja solo el porcentaje.
- **`size`** · `'md' | 'sm'` · _por defecto `'md'`_
    `md` (defecto) o `sm`: compacta, para filas de KPIs.
    - **Valores:**
      - `md` — Tamaño base. Es el valor por defecto.
      - `sm` — Compacto, para filas de KPIs.
- **`variant`** · `SiremStatVariant` · _por defecto `'soft'`_
    `soft` (clara), `tint` (pastel) o `solid` (color pleno).
    - **Valores:**
      - `soft` — Tarjeta clara, blanco con borde. Valor por defecto.
      - `tint` — Fondo pastel del tono de `color`, con el icono en chip.
      - `solid` — Color pleno con texto blanco, para acentos fuertes.
- **`surface`** · `SiremSurface` · _por defecto `'solid'`_
    Superficie sólida (defecto) o translúcida.
    - **Valores:**
      - `solid` — Superficie opaca.
      - `glass` — Superficie translúcida con desenfoque.
- **`color`** · `'brand' | 'accent' | 'info' | 'success' | 'warning' | 'danger'` · _por defecto `'brand'`_
    Color para `variant="solid"` o `variant="tint"`.
    - **Valores:**
      - `brand` — Color de marca. Es el valor por defecto.
      - `accent` — Acento lima.
      - `info` — Informativo, tinte azul.
      - `success` — Éxito, verde salvia.
      - `warning` — Aviso, ámbar.
      - `danger` — Error, rojo.

### `SiremStreamlineIcon`

Selector: `sirem-streamline-icon` · [Demo](projects/demo/src/app/pages/streamline-icon-demo)

Icono Streamline (SVG inline registrado por nombre). Diseñado para Streamline Ultimate Duotone: respeta las dos capas del SVG (relleno `opacity="0.2"` + forma sólida) y hereda `currentColor`…

#### Entradas

- **`name`** · `string | null`
    Nombre registrado vía `provideStreamlineIcons()`.
- **`svg`** · `string | null`
    SVG directo (tiene prioridad sobre `name`).
- **`size`** · `number` · _por defecto `24`_
    Lado del icono en px.
- **`label`** · `string | null`
    Nombre accesible; sin él el icono es decorativo (`aria-hidden`).

### `SiremSwitch`

Selector: `sirem-switch-field` · [Demo](projects/demo/src/app/pages/switch-demo)

Interruptor booleano (sincronización Xubio, estado activo…).

#### Entradas

- **`checked`** · `boolean` · _por defecto `false`_
    Estado activado, con enlace de dos vías.
- **`label`** · `string` · _por defecto `''`_
    Texto del interruptor.
- **`description`** · `string` · _por defecto `''`_
    Línea secundaria bajo la etiqueta.
- **`disabled`** · `boolean` · _por defecto `false`_
    Deshabilita el interruptor.

### `SiremTextarea`

Selector: `sirem-textarea-field` · [Demo](projects/demo/src/app/pages/textarea-demo)

Área de texto multilínea (observaciones, notas clínicas…).

#### Entradas

- **`value`** · `string | null`
    Texto del área, con enlace de dos vías.
- **`label`** · `string` · _por defecto `''`_
    Etiqueta visible sobre el control.
- **`placeholder`** · `string` · _por defecto `''`_
    Texto de ayuda que aparece mientras el campo está vacío.
- **`hint`** · `string` · _por defecto `''`_
    Nota de ayuda bajo el campo; la sustituye `error` cuando lo hay.
- **`error`** · `string` · _por defecto `''`_
    Mensaje de error. Con texto, el campo se marca en rojo y se anuncia.
- **`rows`** · `number` · _por defecto `3`_
    Número de líneas visibles (alto inicial).
- **`required`** · `boolean` · _por defecto `false`_
    Marca el campo como obligatorio (`aria-required` e indicador visual).
- **`disabled`** · `boolean` · _por defecto `false`_
    Deshabilita el control: no se puede enfocar ni editar.

### `SiremTimeline`

Selector: `sirem-timeline` · [Demo](projects/demo/src/app/pages/timeline-demo)

Línea de tiempo vertical (histórico del paciente, trazabilidad de documentos, eventos de un dispositivo GPS…).

#### Entradas

- **`items`** · `SiremTimelineItem[]` · _por defecto `[]`_
    Hitos a mostrar (título, descripción, hora y tono).

#### Tipos y esquemas

- **`SiremTimelineItem`** · _interfaz_
    Un hito de la línea de tiempo.
    - **Campos:**
        - `title` · `string`
        - `description?` · `string`
        - `time?` · `string`
        - `tone?` · `SiremBadgeTone`
- **`SiremBadgeTone`** · _unión_
    Semántica de color del badge.
    - **Definición:** `'neutral' | 'info' | 'accent' | 'success' | 'warning' | 'danger'`
    - `neutral` — Sin semántica de color. Para etiquetas informativas.
    - `info` — Informativo, con tinte azul de marca.
    - `accent` — Acento de marca (lima). Destaca sin semántica de estado.
    - `success` — Correcto o confirmado.
    - `warning` — Pendiente o con atención.
    - `danger` — Error, vencido o bloqueado.

### `SiremTopbar`

Selector: `sirem-topbar` · [Demo](projects/demo/src/app/pages/topbar-demo)

Barra superior: hamburguesa (móvil), workspace a la izquierda, buscador global (Ctrl+K), acciones especiales y pantalla completa. El menú de usuario se proyecta en `slot="user"`.

#### Entradas

- **`spaceLabel`** · `string` · _por defecto `'Mi espacio'`_
    Workspace o sede actual. Dispara `spacePressed` para abrir su selector.
- **`spaceAriaLabel`** · `string` · _por defecto `'workspace'`_
    Texto del workspace cuando no se muestra como botón (móvil).
- **`pageTitle`** · `string` · _por defecto `''`_
    Título de la página actual (chip al lado del workspace).
- **`pageSupTitle`** · `string` · _por defecto `''`_
    Subtítulo del chip de página (opcional, en versalitas).
- **`stickyAppearance`** · `'auto' | SiremTopbarAppearance` · _por defecto `'auto'`_
    Aspecto **mientras la directiva `siremSticky` la mantiene fija**. `auto` (defecto) mantiene el de `appearance`; `elevated`, `glass` o `flat` cambian la piel al pegarse.
- **`blur`** · `boolean` · _por defecto `false`_
    Fondo translúcido con desenfoque (ideal con `siremSticky`).
- **`transparent`** · `boolean` · _por defecto `false`_
    Fondo transparente: el shell de la app se ve a través de la barra. Se puede combinar con `blur` (queda transparente + `backdrop-filter`, el clásico header cristal) o con `floating`/`appearance="cards"`.
- **`shadowOnScroll`** · `boolean` · _por defecto `false`_
    Muestra la sombra al hacer scroll (`shadowOnScroll`): la barra gana elevación cuando el contenido pasa por debajo (útil con `siremSticky`).
- **`showSpace`** · `boolean` · _por defecto `true`_
    Muestra el botón de workspace/sucursal.
- **`floating`** · `boolean` · _por defecto `false`_
    Barra flotante: se separa de los bordes con margen y radio, con fondo transparente (se ve el shell; borde + blur dan legibilidad). El margen izquierdo lo puede fijar el shell con `--sirem-topbar-inset-left`.
- **`appearance`** · `SiremTopbarAppearance` · _por defecto `'default'`_
    Estética global: `default`, `cards`, `elevated`, `glass` o `flat`.
    - **Valores:**
      - `default` — Barra continua de lado a lado. Es el valor por defecto.
      - `cards` — Piezas flotantes: buscador y acciones como tarjetas.
      - `elevated` — Superficie con sombra: la barra se despega del contenido.
      - `glass` — Superficie translúcida con desenfoque (efecto cristal).
      - `flat` — Sin fondo, borde ni sombra: se funde con la página.
- **`searchAlign`** · `SiremTopbarSearchAlign` · _por defecto `'start'`_
    Alineación del buscador; `center` lo deja centrado en la barra.
    - **Valores:**
      - `start` — Alineado al inicio, junto al resto de elementos.
      - `center` — Centrado en la barra.
- **`searchPlaceholder`** · `string` · _por defecto `'Buscar pacientes, facturas, placas…'`_
    Texto atenuado del buscador.
- **`searchHighlight`** · `string` · _por defecto `''`_
    Parte del placeholder que se muestra en negrita.
- **`searchHint`** · `string` · _por defecto `'Ctrl K'`_
    Tecla sugerida; cadena vacía la oculta.
- **`showFullscreen`** · `boolean` · _por defecto `true`_
    Muestra el botón de pantalla completa.
- **`showSpaceDot`** · `boolean` · _por defecto `true`_
    Muestra el punto decorativo junto al workspace.
- **`showSpaceChevron`** · `boolean` · _por defecto `true`_
    Muestra la flecha del workspace (indica que abre un selector).

#### Salidas

- **`menuPressed`** · `void`
    Se emite al pulsar el botón de menú (abre el sidebar en móvil).
    - **Devuelve:** No emite datos: el evento no lleva carga útil.
- **`searchPressed`** · `void`
    Se emite al pulsar el buscador (abre la paleta de búsqueda).
    - **Devuelve:** No emite datos: el evento no lleva carga útil.
- **`spacePressed`** · `void`
    Se emite al pulsar el workspace (abre su selector).
    - **Devuelve:** No emite datos: el evento no lleva carga útil.
- **`fullscreenPressed`** · `void`
    Se emite al pulsar el botón de pantalla completa.
    - **Devuelve:** No emite datos: el evento no lleva carga útil.

#### Tipos y esquemas

- **`SiremTopbarAppearance`** · _alias_
    Estética global de la barra (incluye los aspectos de `sticky`).
    - **Definición:** `'cards' | SiremStickyAppearance`
- **`SiremTopbarSearchAlign`** · _unión_
    Cómo se alinea el buscador dentro de la barra.
    - **Definición:** `'start' | 'center'`
    - `start` — Alineado al inicio, junto al resto de elementos.
    - `center` — Centrado en la barra.
- **`SiremStickyAppearance`** · _unión_
    Aspecto que puede adoptar una barra (topbar, navbar o page-header): - `default`: el aspecto propio del componente. - `elevated`: superficie + sombra, despegada del contenido. - `glass`: superficie translúcida con desenfoque (cristal). - `flat`: sin fondo, borde ni sombra; se funde con la página. Se usa en `appearance` (aspecto normal) y `stickyAppearance` (al quedar fija), de modo que una barra puede cambiar de piel al pegarse.
    - **Definición:** `'default' | 'elevated' | 'glass' | 'flat'`
    - `default` — El aspecto propio del componente.
    - `elevated` — Superficie con sombra: se despega del contenido.
    - `glass` — Superficie translúcida con desenfoque (efecto cristal).
    - `flat` — Sin fondo, borde ni sombra: se funde con la página.

### `SiremUserMenu`

Selector: `sirem-user-menu` · [Demo](projects/demo/src/app/pages/user-menu-demo)

Menú desplegable del perfil (datos del usuario + acciones). Las acciones pueden declararse con `groups` (agrupadas y con iconos) o proyectarse libremente; cualquier clic dentro del panel lo cierra. Uso:

#### Entradas

- **`userName`** · `string` · _obligatorio_
    Nombre del usuario; origen de las iniciales del avatar.
- **`userDetail`** · `string` · _por defecto `''`_
    Línea secundaria bajo el nombre (cargo, sede…).
- **`avatarSrc`** · `string | null`
    URL de la foto de perfil; si falta, se usan las iniciales.
- **`avatarBg`** · `string` · _por defecto `''`_
    Color de fondo de las iniciales (opcional; usa el primario por defecto).
- **`avatarText`** · `string` · _por defecto `''`_
    Texto forzado del avatar (p. ej. iniciales `JP` de un nombre corto); si está vacío se derivan de `userName`.
- **`groups`** · `SiremUserMenuGroup[]` · _por defecto `[]`_
    Grupos de acciones con iconos (alternativa a proyectar contenido).

#### Salidas

- **`actionPressed`** · `SiremUserMenuAction`
    Se emite con la acción elegida del menú.
    - **Devuelve:**
      - `label` · `string` — Texto de la acción.
      - `icon?` · `string` — Clase CSS del icono (p. ej. `fi fi-rr-user`).
      - `svg?` · `string` — SVG inline (duotone / streamline). Tiene prioridad sobre `icon`.
      - `danger?` · `boolean` — Marca la acción como peligrosa (p. ej. cerrar sesión).
      - `disabled?` · `boolean` — Deshabilita la acción.
      - `value?` · `any` — Dato libre que se devuelve en `actionPressed`.

#### Tipos y esquemas

- **`SiremUserMenuGroup`** · _interfaz_
    Grupo opcional de acciones (con título y separador automático).
    - **Campos:**
        - `title?` · `string`
        - `actions` · `SiremUserMenuAction[]`
- **`SiremUserMenuAction`** · _interfaz_
    Acción del menú de usuario.
    - **Campos:**
        - `label` · `string` — Texto de la acción.
        - `icon?` · `string` — Clase CSS del icono (p. ej. `fi fi-rr-user`).
        - `svg?` · `string` — SVG inline (duotone / streamline). Tiene prioridad sobre `icon`.
        - `danger?` · `boolean` — Marca la acción como peligrosa (p. ej. cerrar sesión).
        - `disabled?` · `boolean` — Deshabilita la acción.
        - `value?` · `any` — Dato libre que se devuelve en `actionPressed`.

## Directivas

Directivas standalone que se aplican a elementos existentes.

### `SiremAutofocusDirective`

Selector: `[siremAutofocus]` · [Demo](projects/demo/src/app/pages/autofocus-demo)

Enfoca el elemento anfitrión al aparecer en vista. Uso:

#### Entradas

- **`siremAutofocus`** · `boolean` · _por defecto `true`_
    Activa/desactiva el autofocus (defecto true).
- **`siremAutofocusDelay`** · `number` · _por defecto `0`_
    Retraso en ms antes de enfocar (defecto 0).

### `SiremClickOutsideDirective`

Selector: `[siremClickOutside]` · [Demo](projects/demo/src/app/pages/click-outside-demo)

Emite cuando el usuario pulsa fuera del elemento anfitrión. Ideal para cerrar menús, paletas y desplegables. Uso:

#### Salidas

- **`siremClickOutside`** · `PointerEvent`
    Se emite con el `PointerEvent` cuando se pulsa fuera del anfitrión.
    - **Devuelve:** Evento nativo del puntero.

### `SiremNumbersOnlyDirective`

Selector: `input[siremNumbersOnly]` · [Demo](projects/demo/src/app/pages/numbers-only-demo)

Restringe un `<input>` a dígitos (opcionalmente un decimal). Útil para documentos, teléfonos y valores numéricos. Uso:

#### Entradas

- **`siremNumbersAllowDecimal`** · `boolean` · _por defecto `false`_
    Permite un punto decimal (defecto false).

### `SiremOverlayTrigger`

Selector: `[siremOverlay]` · [Demo](projects/demo/src/app/pages/overlay-demo)

Abre un overlay (menú contextual, lista de opciones, ficha de detalle, sub-elementos de un sidebar o navbar) en una **capa superior**, de forma que ningún `overflow: hidden` de un ancestro lo recorte.

#### Entradas

- **`siremOverlay`** · `TemplateRef<unknown> | null`
    Plantilla con el contenido del panel. `null` desactiva la directiva.
- **`siremOverlayData`** · `unknown`
    Contexto que recibe la plantilla al instanciarse.
- **`siremOverlayTrigger`** · `SiremOverlayTriggerType` · _por defecto `'click'`_
    Evento que abre el panel.
    - **Valores:**
      - `click` — Un clic. Es el valor por defecto y el mas habitual.
      - `dblclick` — Doble clic. Evita abrir el menu a la primera pulsacion.
      - `contextmenu` — Clic derecho. El panel sale bajo el puntero y el menu del navegador no aparece.
      - `longpress` — Mantener pulsado el tiempo de `siremOverlayLongPressMs`.
      - `hover` — El puntero entra y permanece `siremOverlayHoverDelayMs` sobre el elemento.
      - `manual` — Ignora los eventos del raton; solo responde a `[(open)]` desde codigo.
- **`siremOverlayPlacement`** · `SiremOverlayPlacement` · _por defecto `'bottom-start'`_
    Lado y alineación deseada.
    - **Valores:**
      - `top` — Encima del disparador, centrado.
      - `top-start` — Encima, alineado a su inicio.
      - `top-end` — Encima, alineado a su final.
      - `bottom` — Debajo del disparador, centrado.
      - `bottom-start` — Debajo, alineado a su inicio. Valor por defecto.
      - `bottom-end` — Debajo, alineado a su final.
      - `left` — A la izquierda, centrado verticalmente.
      - `right` — A la derecha, centrado verticalmente.
      - `inline-start` — Al inicio de la línea: izquierda en LTR, derecha en RTL.
      - `inline-end` — Al final de la línea: derecha en LTR, izquierda en RTL.
- **`siremOverlayOffset`** · `number` · _por defecto `8`_
    Separación en px respecto al disparador.
- **`siremOverlayViewportPadding`** · `number` · _por defecto `8`_
    Margen que el panel deja siempre contra los bordes del viewport.
- **`siremOverlayLongPressMs`** · `number` · _por defecto `500`_
    Milisegundos que hay que mantener pulsado (`longpress`).
- **`siremOverlayHoverDelayMs`** · `number` · _por defecto `250`_
    Espera con el puntero encima antes de abrir (`hover`).
- **`siremOverlayHoverHideDelayMs`** · `number` · _por defecto `200`_
    Espera tras salir el puntero del disparador antes de cerrar (`hover`). Da tiempo a entrar en el panel, que vive fuera del elemento.
- **`siremOverlayClickDelayMs`** · `number` · _por defecto `0`_
    Retardo antes de abrir con `click`; util como antirrebote. `0` abre ya.
- **`siremOverlayFlip`** · `boolean` · _por defecto `true`_
    Voltea al lado opuesto cuando el preferido no cabe.
- **`siremOverlayShift`** · `boolean` · _por defecto `true`_
    Desplaza en el eje cruzado para no invadir el borde opuesto.
- **`siremOverlayMatchTriggerWidth`** · `boolean` · _por defecto `false`_
    Iguala el ancho del panel al del disparador (combos y selectores).
- **`siremOverlayCloseOnOutsideClick`** · `boolean` · _por defecto `true`_
    Cierra al pulsar fuera del panel.
- **`siremOverlayCloseOnEscape`** · `boolean` · _por defecto `true`_
    Cierra con la tecla Escape.
- **`siremOverlayRepositionOnScroll`** · `boolean` · _por defecto `true`_
    Reposiciona al hacer scroll o redimensionar; con `false`, se cierra.
- **`open`** · `boolean` · _por defecto `false`_
    Estado de apertura, controlable con dos vías.

#### Salidas

- **`opened`** · `void`
    Se emite cuando el panel se abre.
    - **Devuelve:** No emite datos: el evento no lleva carga útil.
- **`closed`** · `void`
    Se emite cuando el panel se cierra.
    - **Devuelve:** No emite datos: el evento no lleva carga útil.

#### Tipos y esquemas

- **`SiremOverlayTriggerType`** · _unión_
    Evento que abre el overlay.
    - **Definición:** `'click' | 'dblclick' | 'contextmenu' | 'longpress' | 'hover' | 'manual'`
    - `click` — Un clic. Es el valor por defecto y el mas habitual.
    - `dblclick` — Doble clic. Evita abrir el menu a la primera pulsacion.
    - `contextmenu` — Clic derecho. El panel sale bajo el puntero y el menu del navegador no aparece.
    - `longpress` — Mantener pulsado el tiempo de `siremOverlayLongPressMs`.
    - `hover` — El puntero entra y permanece `siremOverlayHoverDelayMs` sobre el elemento.
    - `manual` — Ignora los eventos del raton; solo responde a `[(open)]` desde codigo.
- **`SiremOverlayPlacement`** · _alias_
    Combinación de lado y alineación admitida.
    - **Definición:** `SiremOverlaySide | 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end' | 'left-start' | 'left-center' | 'left-end' | 'right-start' | 'right-center' | 'right-end'`
- **`SiremOverlaySide`** · _unión_
    Lado del disparador por el que sale el panel.
    - **Definición:** `'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end'`
    - `top`
    - `bottom`
    - `left`
    - `right`
    - `inline-start`
    - `inline-end`

### `SiremSticky`

Selector: `[siremSticky]`

Convierte cualquier elemento o componente en **sticky** (`position: sticky`), de forma abierta o acotada a un límite…

#### Entradas

- **`siremSticky`** · `boolean` · _por defecto `true`_
    Activa la fijación (`position: sticky`).
- **`siremStickyOffset`** · `number` · _por defecto `0`_
    Separación con el borde superior del contenedor de scroll, en px.
- **`siremStickyLimit`** · `number | null, unknown`
    Recorrido máximo fijo, en px, antes de soltarse. `null` (defecto) = sin límite. Ejemplo: `[siremStickyLimit]="160"`.
- **`siremStickyBoundary`** · `SiremStickyBoundary | null`
    Elemento cuyo **borde inferior** limita la fijación: la pieza se despega hasta él y después lo acompaña. Admite elemento, `ElementRef` o selector CSS (`'#fin'`). `null` (defecto) = sin límite por componente.
- **`siremStickyZIndex`** · `number` · _por defecto `30`_
    `z-index` mientras está fija.

#### Salidas

- **`siremStickyChange`** · `boolean`
    Se emite al fijarse (`true`) y al soltarse (`false`).

#### Tipos y esquemas

- **`SiremStickyBoundary`** · _alias_
    Elemento que limita la fijación (o selector CSS que lo resuelve).
    - **Definición:** `HTMLElement | ElementRef<HTMLElement> | string`

### `SiremTooltipDirective`

Selector: `[siremTooltip]` · [Demo](projects/demo/src/app/pages/tooltip-demo)

Tooltip oscuro flotante con flecha (referencia Bento). Aparece al pasar el ratón o al enfocar el elemento y se anuncia a lectores de pantalla vía `aria-describedby` + `role="tooltip"`…

#### Entradas

- **`siremTooltip`** · `string | null`
    Texto del globo. `null`/vacío no muestra nada.
- **`siremTooltipPlacement`** · `SiremTooltipPlacement` · _por defecto `'top'`_
    Lado del elemento donde se coloca.
    - **Valores:**
      - `top` — Encima del elemento.
      - `bottom` — Debajo del elemento.
      - `left` — A la izquierda.
      - `right` — A la derecha.
- **`siremTooltipDelay`** · `number` · _por defecto `120`_
    Retardo de aparición en ms (0 = inmediato).
- **`siremTooltipDisabled`** · `boolean` · _por defecto `false`_
    Desactiva el tooltip sin quitar el atributo.

#### Tipos y esquemas

- **`SiremTooltipPlacement`** · _unión_
    Lado por el que aparece el tooltip.
    - **Definición:** `'top' | 'bottom' | 'left' | 'right'`
    - `top` — Encima del elemento.
    - `bottom` — Debajo del elemento.
    - `left` — A la izquierda.
    - `right` — A la derecha.

## Pipes

Pipes standalone para plantillas.

### `SiremAgePipe`

Selector: `pipe siremAge` · [Demo](projects/demo/src/app/pages/age-demo)

Calcula la edad en años desde una fecha de nacimiento ISO. Uso: `{{ '1990-05-01' | siremAge }}` → `35 años`

#### Parámetros

- **`value`** · `string | Date | null | undefined` · _obligatorio_
    Fecha de nacimiento, en ISO `yyyy-MM-dd` o como `Date`.

### `SiremMoneyPipe`

Selector: `pipe siremMoney` · [Demo](projects/demo/src/app/pages/money-demo)

Formatea un valor como moneda es-CO sin decimales. Uso: `{{ 250000 | siremMoney }}` → `$ 250.000`

#### Parámetros

- **`value`** · `number | string | null | undefined` · _obligatorio_
    Importe, en número o en texto (`'250000'`).
- **`currencyCode`** · `string` · _por defecto `'COP'`_
    Divisa ISO 4217 del formato (`COP` por defecto).

### `SiremPhonePipe`

Selector: `pipe siremPhone` · [Demo](projects/demo/src/app/pages/phone-demo)

Formatea un teléfono colombiano de 10 dígitos en bloques 3-3-4. Uso: `{{ '3001112233' | siremPhone }}` → `300 111 2233`

#### Parámetros

- **`value`** · `string | number | null | undefined` · _obligatorio_
    Teléfono de 10 dígitos; se ignoran los separadores.

## Interceptores HTTP

Funciones `HttpInterceptorFn` que se registran con
`provideHttpClient(withInterceptors([...]))`.

### `siremAuthInterceptor`

Agrega `Authorization: Bearer <token>` a cada petición cuando el proveedor
configurado devuelve un token. Se configura con
`provideSiremAuth(() => string | null)` (sin token por defecto).

```ts
providers: [
  provideHttpClient(withInterceptors([siremAuthInterceptor])),
  provideSiremAuth(() => localStorage.getItem('token')),
]
```

### `siremBaseUrlInterceptor`

Prefija la base URL a las peticiones relativas (`/api/...`); las URLs
absolutas (`http…`) pasan intactas. Es la pareja de los `optionsEndpoint` de
los campos remotos. Se configura con
`provideSiremApiUrl('https://api.sirem.com')`.

```ts
providers: [
  provideHttpClient(withInterceptors([siremBaseUrlInterceptor])),
  provideSiremApiUrl('https://api.sirem.com'),
]
```

## Desarrollo

Comandos del repo (librería + demo):

```bash
npm start            # catálogo de demo → http://localhost:4200
npm run build:lib    # ng build deorta-sirem-ui → dist/
npm run build        # librería + demo
npm test             # vitest (librería + demo)
```

## Publicar en npm

```bash
npm login            # una vez por máquina (navegador; OTP si tienes 2FA)
npm run publish:lib  # compila la librería y publica dist/ (versión del package.json)
```

El paquete se publica como `deorta-sirem-ui` y solo contiene la librería
(`dist/deorta-sirem-ui`), no la demo. Incluye la hoja de tokens en
`src/lib/theme/sirem-theme.css` (alias corto: `deorta-sirem-ui/theme.css`);
las dependencias de Angular, `codemirror`, `rxjs` y `echarts` van como
`peerDependencies`, así que el consumidor solo instala el paquete y sus
pares. Para revisar el contenido antes de publicar: `npm run pack:lib`.

## Atribución

Al publicar una app que use la librería: `Uicons by [Flaticon](https://www.flaticon.com/uicons)` y el crédito a Streamline según la licencia del set usado (ver `docs/STREAMLINE.md`).
