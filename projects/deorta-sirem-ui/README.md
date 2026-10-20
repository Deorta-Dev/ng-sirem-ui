# @deorta-dev/ng-sirem-ui

Componentes **Angular 21 standalone** para SIREM: design system con
**Tailwind CSS v4**, tokens de diseño (claro/oscuro), iconos Flaticon UIcons,
duotone y registro de Streamline Ultimate Duotone.

- **60 componentes, directivas y pipes** listos para usar.
- Tema por tokens: modo claro y oscuro sin duplicar estilos.
- Animaciones con `prefers-reduced-motion` respetado.
- Estilos encapsulados: la app consumidora solo aporta Tailwind y los tokens.

🌐 **Demo en vivo:** https://deorta-dev.github.io/ng-sirem-ui/

Documentación completa y código: https://github.com/Deorta-Dev/ng-sirem-ui

## Instalación

```bash
npm i @deorta-dev/ng-sirem-ui @flaticon/flaticon-uicons echarts
```

`echarts` es peer dependency (gráficas). Si usas el editor de código, instala
también `codemirror` y sus paquetes `@codemirror/*`; si usas los campos
remotos (`optionsEndpoint`), provee `provideHttpClient()`.

## Configuración

### Estilos y tokens

La librería **no impone estilos globales**: usa tokens semánticos `--sirem-*`.
Importa Tailwind, la fuente de iconos y la hoja de tokens en el `styles.css`:

```css
/* styles.css del proyecto consumidor */
@import 'tailwindcss';
@import '@flaticon/flaticon-uicons/css/regular/all.css';
@import '@flaticon/flaticon-uicons/css/bold/all.css';
@import '@flaticon/flaticon-uicons/css/solid/all.css';
@import '@flaticon/flaticon-uicons/css/brands/all.css';

/* Tokens SIREM (colores, superficies, sombras, radios y movimiento) */
@import '@deorta-dev/ng-sirem-ui/src/lib/theme/sirem-theme.css';
```

También puedes importar el alias corto: `@deorta-dev/ng-sirem-ui/theme.css`.

### Modo oscuro

```ts
document.documentElement.dataset.theme = 'dark'; // 'light' por defecto
```

Todos los tokens tienen override en `:root[data-theme='dark']`; los radios no
dependen del tema. Los componentes se adaptan solos.

### Proveedores opcionales

```ts
// app.config.ts — solo si usas optionsEndpoint en los campos remotos
import { provideHttpClient } from '@angular/common/http';
providers: [provideHttpClient()];

// app.config.ts — solo si usas iconos Streamline
import { provideStreamlineIcons } from '@deorta-dev/ng-sirem-ui';
providers: [provideStreamlineIcons({ 'home-duotone': MI_SVG })];
```

## Uso

```ts
import { Component, signal } from '@angular/core';
import { SiremButton, SiremCard } from '@deorta-dev/ng-sirem-ui';

@Component({
  standalone: true,
  imports: [SiremButton, SiremCard],
  template: `
    <sirem-card title="Pacientes" subtitle="1.240 registros">
      <sirem-button variant="primary" [loading]="saving()" (pressed)="save()">
        Guardar
      </sirem-button>
    </sirem-card>
  `,
})
export class PacientesPage {
  readonly saving = signal(false);
  save(): void {}
}
```

```html
<!-- Tabla de datos -->
<sirem-data-table [columns]="cols" [rows]="rows" [striped]="true" />

<!-- Formulario dinámico (JSON del form-builder) -->
<sirem-dynamic-form [fields]="form" [(values)]="values" (submitted)="save()" />

<!-- Iconos -->
<sirem-fi-icon name="rr-user" [size]="20" />
<sirem-duotone-icon [svg]="phosphorHome" />
<sirem-streamline-icon name="home-duotone" [size]="24" />
```

## Galería de componentes

<!-- galeria:start -->
### Componentes

| Componente | Selector | Para qué sirve |
|---|---|---|
| `SiremAdminLayout` | `sirem-admin-layout` | Contenedor maestro de la app autenticada (equivale a `lo-admin-layout`)… |
| [`SiremAgenda`](https://deorta-dev.github.io/ng-sirem-ui/demo/agenda) | `sirem-agenda` | Agenda multi-vista tipo Google Calendar (`sirem-agenda`) |
| [`SiremAvatar`](https://deorta-dev.github.io/ng-sirem-ui/demo/avatar) | `sirem-avatar` | Avatar con imagen o iniciales + punto de presencia/estado. (Listas de pacientes, terceros, usuarios.) |
| [`SiremBadge`](https://deorta-dev.github.io/ng-sirem-ui/demo/badge) | `sirem-badge` | Pastilla de estado (última visita, estado CUFE/DIAN, estado de cita, sincronización Xubio…). Con o sin punto |
| [`SiremBreadcrumbs`](https://deorta-dev.github.io/ng-sirem-ui/demo/breadcrumbs) | `sirem-breadcrumbs` | Ubicación jerárquica (p. ej. Inicio › Clínica › Pacientes) |
| [`SiremButton`](https://deorta-dev.github.io/ng-sirem-ui/demo/button) | `sirem-button` | Botón base del design system SIREM (estética Bento: píldoras de esquinas completamente redondeadas, sombras difusas y semántica de color; escala compacta: el tamaño md mide h-10… |
| [`SiremCalendar`](https://deorta-dev.github.io/ng-sirem-ui/demo/calendar) | `sirem-calendar` | Calendario mensual único de agenda (`ScheduleListComponent`) con tres tamaños… |
| [`SiremCard`](https://deorta-dev.github.io/ng-sirem-ui/demo/card) | `sirem-card` | Tarjeta contenedora genérica (fichas de paciente, tarjetas de inventario, paneles de configuración…). Encabezado opcional + contenido proyectado |
| [`SiremCardList`](https://deorta-dev.github.io/ng-sirem-ui/demo/card-list) | `sirem-card-list` | Lista de tarjetas: alternativa visual a la tabla para registros con varios datos (pacientes, facturas, equipos…)… |
| [`SiremChart`](https://deorta-dev.github.io/ng-sirem-ui/demo/chart) | `sirem-chart` | Gráfica estadística con Apache ECharts (barras simples, series múltiples, dona…). Recibe la opción ECharts tal cual, por lo que sirve para casos simples y compuestos sin cambiar… |
| [`SiremCheckbox`](https://deorta-dev.github.io/ng-sirem-ui/demo/checkbox) | `sirem-checkbox-field` | Casilla de verificación con etiqueta y descripción opcional |
| [`SiremCodeEditor`](https://deorta-dev.github.io/ng-sirem-ui/demo/code-editor) | `sirem-code-editor` | Editor de código con CodeMirror 6. Sigue el tema con `dark` (igual que `sirem-chart`): claro por defecto, One Dark en oscuro… |
| [`SiremCollapsible`](https://deorta-dev.github.io/ng-sirem-ui/demo/collapsible) | `sirem-collapsible` | Sección plegable con cabecera pulsable y contenido proyectado… |
| [`SiremCollapsibleGroup`](https://deorta-dev.github.io/ng-sirem-ui/demo/collapsible) | `sirem-collapsible-group` | Agrupador de secciones `sirem-collapsible`… |
| [`SiremConfirmDialog`](https://deorta-dev.github.io/ng-sirem-ui/demo/confirm-dialog) | `sirem-confirm-dialog` | Diálogo de confirmación sí/no (equivale a `BoolModalFormDynamicComponent`): eliminar paciente, anular factura, confirmar envío masivo…… |
| [`SiremDataTable`](https://deorta-dev.github.io/ng-sirem-ui/demo/data-table) | `sirem-data-table` | Tabla estandarizada de listados (pacientes, terceros, facturas, productos, amortizaciones…). Ordenable, con selección opcional, scroll horizontal en móvil y celdas tipadas… |
| [`SiremDate`](https://deorta-dev.github.io/ng-sirem-ui/demo/date) | `sirem-date-field` | Campo de fecha con calendario emergente (valor ISO `yyyy-MM-dd`). Muestra la fecha en formato local, admite escritura (`dd/mm/aaaa` o ISO) y abre `sirem-calendar` en tamaño… |
| [`SiremDateChip`](https://deorta-dev.github.io/ng-sirem-ui/demo/date-chip) | `sirem-date-chip` | Chip de fecha grande (referencia Bento): inicial del día de la semana arriba y el número destacado debajo. Se usa en fila, como selector rápido de días… |
| [`SiremDatepicker`](https://deorta-dev.github.io/ng-sirem-ui/demo/datepicker) | `sirem-datepicker-field` | Selector de fecha (citas, nacimiento, vencimientos…). Valor ISO `yyyy-MM-dd` |
| [`SiremDrawer`](https://deorta-dev.github.io/ng-sirem-ui/demo/drawer) | `sirem-drawer` | Panel lateral deslizante (navegación de la agenda, detalle de paciente, filtros avanzados…). En móvil ocupa casi todo el ancho |
| [`SiremDuotoneIcon`](https://deorta-dev.github.io/ng-sirem-ui/demo/duotone-icon) | `sirem-duotone-icon` | Icono duotone genérico (SVG inline de dos capas). Patrón duotone (igual en Streamline Ultimate Duotone y Phosphor Duotone)… |
| [`SiremDynamicForm`](https://deorta-dev.github.io/ng-sirem-ui/demo/dynamic-form) | `sirem-dynamic-form` | Formulario dinámico dirigido por configuración (equivale a `lo-form-dynamic`, compatible con el JSON del form-builder de Lion)… |
| [`SiremEmptyState`](https://deorta-dev.github.io/ng-sirem-ui/demo/empty-state) | `sirem-empty-state` | Estado vacío de listados (sin pacientes, sin resultados de filtro…) |
| [`SiremFieldGroup`](https://deorta-dev.github.io/ng-sirem-ui/demo/field-group) | `sirem-field-group` | Grupo de campos con título (equivale a `lib-group-field-dynamic`): agrupa campos relacionados dentro de un formulario y los distribuye en la cuadrícula de 12 columnas mediante el… |
| [`SiremFiIcon`](https://deorta-dev.github.io/ng-sirem-ui/demo/fi-icon) | `sirem-fi-icon` | Wrapper de Flaticon UIcons (icon font)… |
| [`SiremImageUpload`](https://deorta-dev.github.io/ng-sirem-ui/demo/image-upload) | `sirem-image-upload-field` | Carga de imagen con vista previa (foto del paciente, logo, QR…). El valor es la imagen como data-URL lista para previsualizar/enviar |
| [`SiremInput`](https://deorta-dev.github.io/ng-sirem-ui/demo/input) | `sirem-input-field` | Campo de texto con autocompletado integrado (doble vía con `[(value)]`)… |
| [`SiremInvoiceEditor`](https://deorta-dev.github.io/ng-sirem-ui/demo/invoice-editor) | `sirem-invoice-editor` | Editor de factura de venta: cabecera (cliente, N°, fechas, notas), conceptos editables con IVA y descuento por línea y resumen de totales |
| [`SiremList`](https://deorta-dev.github.io/ng-sirem-ui/demo/list) | `sirem-list` | Lista simple de filas (título + subtítulo + icono/avatar + badge). Alternativa ligera a la tabla para móviles y paneles… |
| [`SiremModal`](https://deorta-dev.github.io/ng-sirem-ui/demo/modal) | `sirem-modal` | Diálogo modal genérico (CRUD sin recargar página: equivale a `ElementModalFormDynamicComponent`)… |
| [`SiremMultiSelect`](https://deorta-dev.github.io/ng-sirem-ui/demo/multi-select) | `sirem-multi-select` | Selector de opciones múltiples con buscador, grupos e iconos. Ideal para características, permisos y roles… |
| [`SiremNavbar`](https://deorta-dev.github.io/ng-sirem-ui/demo/navbar) | `sirem-navbar` | Barra de navegación con cuatro disposiciones… |
| [`SiremOverlayViewport`](https://deorta-dev.github.io/ng-sirem-ui/demo/overlay) | `sirem-overlay-viewport` | Configurador opcional de la capa de overlays. **No hace falta montarlo**: `[siremOverlay]` crea la capa por sí sola la primera vez que se usa, con estilos y `z-index` por defecto… |
| [`SiremPageHeader`](https://deorta-dev.github.io/ng-sirem-ui/demo/page-header) | `sirem-page-header` | Cabecera estandarizada de listados (`lo-resource-set-list`): título + subtítulo descriptivo + acciones proyectadas |
| [`SiremPopupCard`](https://deorta-dev.github.io/ng-sirem-ui/demo/popup-card) | `sirem-popup-card` | Tarjeta flotante ligera para ventanas emergentes de mapa (telemetría GPS: velocidad, batería, última posición…)… |
| [`SiremRadioGroup`](https://deorta-dev.github.io/ng-sirem-ui/demo/radio-group) | `sirem-radio-group-field` | Grupo de opciones excluyentes (tipo de persona, régimen…) |
| [`SiremRichText`](https://deorta-dev.github.io/ng-sirem-ui/demo/rich-text) | `sirem-rich-text` | Editor de texto enriquecido liviano (contenteditable + barra de formato). Devuelve HTML en doble vía; sin dependencias externas… |
| [`SiremSearchField`](https://deorta-dev.github.io/ng-sirem-ui/demo/search-field) | `sirem-search-field` | Campo de búsqueda con lupa y botón limpiar (filtros de listados) |
| [`SiremSearchPalette`](https://deorta-dev.github.io/ng-sirem-ui/demo/search-palette) | `sirem-search-palette` | Buscador global estilo paleta de comandos (equivale a `SearchPalettesComponent`). Se abre con `Ctrl+K` / `Cmd+K` desde cualquier vista; filtra por texto, navega con ↑↓ + Enter y… |
| [`SiremSegmented`](https://deorta-dev.github.io/ng-sirem-ui/demo/segmented) | `sirem-segmented` | Control segmentado de pastillas (referencia Bento): un grupo de opciones excluyentes donde la activa se resalta con una ficha que **se desliza** hasta la opción elegida… |
| [`SiremSelect`](https://deorta-dev.github.io/ng-sirem-ui/demo/select) | `sirem-select-field` | Selector desplegable (especialidad, estado civil, tipo de documento…) sobre un `<select>` nativo… |
| [`SiremSheet`](https://deorta-dev.github.io/ng-sirem-ui/demo/sheet) | `sirem-sheet` | Hoja inferior (bottom sheet) redimensionable con presets y pantalla completa |
| [`SiremSidebar`](https://deorta-dev.github.io/ng-sirem-ui/demo/sidebar) | `sirem-sidebar` | Menú lateral jerárquico, colapsable y responsivo… |
| [`SiremSparkline`](https://deorta-dev.github.io/ng-sirem-ui/demo/sparkline) | `sirem-sparkline` | Minigráfico sin ejes (sparkline) para KPIs dentro de una tarjeta… |
| [`SiremStatCard`](https://deorta-dev.github.io/ng-sirem-ui/demo/stat-card) | `sirem-stat-card` | Tarjeta KPI (total pacientes, facturado del mes, cartera vencida…)… |
| [`SiremStreamlineIcon`](https://deorta-dev.github.io/ng-sirem-ui/demo/streamline-icon) | `sirem-streamline-icon` | Icono Streamline (SVG inline registrado por nombre). Diseñado para Streamline Ultimate Duotone: respeta las dos capas del SVG (relleno `opacity="0.2"` + forma sólida) y hereda… |
| [`SiremSwitch`](https://deorta-dev.github.io/ng-sirem-ui/demo/switch) | `sirem-switch-field` | Interruptor booleano (sincronización Xubio, estado activo…) |
| [`SiremTextarea`](https://deorta-dev.github.io/ng-sirem-ui/demo/textarea) | `sirem-textarea-field` | Área de texto multilínea (observaciones, notas clínicas…) |
| [`SiremTimeline`](https://deorta-dev.github.io/ng-sirem-ui/demo/timeline) | `sirem-timeline` | Línea de tiempo vertical (histórico del paciente, trazabilidad de documentos, eventos de un dispositivo GPS…) |
| [`SiremTopbar`](https://deorta-dev.github.io/ng-sirem-ui/demo/topbar) | `sirem-topbar` | Barra superior: hamburguesa (móvil), workspace a la izquierda, buscador global (Ctrl+K), acciones especiales y pantalla completa. El menú de usuario se proyecta en `slot="user"` |
| [`SiremUserMenu`](https://deorta-dev.github.io/ng-sirem-ui/demo/user-menu) | `sirem-user-menu` | Menú desplegable del perfil (datos del usuario + acciones). Las acciones pueden declararse con `groups` (agrupadas y con iconos) o proyectarse libremente; cualquier clic dentro… |

### Directivas

| Directiva | Selector | Para qué sirve |
|---|---|---|
| [`SiremAutofocusDirective`](https://deorta-dev.github.io/ng-sirem-ui/demo/autofocus) | `[siremAutofocus]` | Enfoca el elemento anfitrión al aparecer en vista… |
| [`SiremClickOutsideDirective`](https://deorta-dev.github.io/ng-sirem-ui/demo/click-outside) | `[siremClickOutside]` | Emite cuando el usuario pulsa fuera del elemento anfitrión. Ideal para cerrar menús, paletas y desplegables… |
| [`SiremNumbersOnlyDirective`](https://deorta-dev.github.io/ng-sirem-ui/demo/numbers-only) | `input[siremNumbersOnly]` | Restringe un `<input>` a dígitos (opcionalmente un decimal). Útil para documentos, teléfonos y valores numéricos… |
| [`SiremOverlayTrigger`](https://deorta-dev.github.io/ng-sirem-ui/demo/overlay) | `[siremOverlay]` | Abre un overlay (menú contextual, lista de opciones, ficha de detalle, sub-elementos de un sidebar o navbar) en una **capa superior**, de forma que ningún `overflow: hidden` de un… |
| [`SiremSticky`](https://deorta-dev.github.io/ng-sirem-ui/demo/sticky) | `[siremSticky]` | Convierte cualquier elemento o componente en **sticky** (`position: sticky`), de forma abierta o acotada a un límite… |
| [`SiremTooltipDirective`](https://deorta-dev.github.io/ng-sirem-ui/demo/tooltip) | `[siremTooltip]` | Tooltip oscuro flotante con flecha (referencia Bento). Aparece al pasar el ratón o al enfocar el elemento y se anuncia a lectores de pantalla vía `aria-describedby` +… |

### Pipes

| Pipe | Selector | Para qué sirve |
|---|---|---|
| [`SiremAgePipe`](https://deorta-dev.github.io/ng-sirem-ui/demo/age) | `siremAge` | Calcula la edad en años desde una fecha de nacimiento ISO. Uso: `{{ '1990-05-01' \| siremAge }}` → `35 años` |
| [`SiremMoneyPipe`](https://deorta-dev.github.io/ng-sirem-ui/demo/money) | `siremMoney` | Formatea un valor como moneda es-CO sin decimales. Uso: `{{ 250000 \| siremMoney }}` → `$ 250.000` |
| [`SiremPhonePipe`](https://deorta-dev.github.io/ng-sirem-ui/demo/phone) | `siremPhone` | Formatea un teléfono colombiano de 10 dígitos en bloques 3-3-4. Uso: `{{ '3001112233' \| siremPhone }}` → `300 111 2233` |

### Páginas de ejemplo

Composiciones completas del catálogo (solo con componentes SIREM); puedes abrirlas en el [demo en vivo](https://deorta-dev.github.io/ng-sirem-ui/):

| Página | Qué muestra |
|---|---|
| [Ajustes de Inventario](https://deorta-dev.github.io/ng-sirem-ui/demo/ajustes-inventario) | Entradas o salidas manuales por pérdida, robo o conteo físico |
| [Asientos Contables](https://deorta-dev.github.io/ng-sirem-ui/demo/asientos-contables) | Comprobantes de diario automáticos y manuales con cuadre DEBE/HABER |
| [Cambio Rápido de Contexto](https://deorta-dev.github.io/ng-sirem-ui/demo/impersonation) | Impersonation: entrar al entorno de un cliente con una credencial |
| [Cierre Contable](https://deorta-dev.github.io/ng-sirem-ui/demo/cierre-contable) | Bloqueo de periodos fiscales y asientos de cierre anual |
| [Conciliación Bancaria](https://deorta-dev.github.io/ng-sirem-ui/demo/conciliacion-bancaria) | Importa extractos en Excel/CSV y empareja movimientos con comprobantes |
| [Cotizaciones y Presupuestos](https://deorta-dev.github.io/ng-sirem-ui/demo/cotizaciones) | Propuestas comerciales convertibles a factura con un solo clic |
| [Cuentas Bancarias y Cajas](https://deorta-dev.github.io/ng-sirem-ui/demo/cuentas-bancarias) | Múltiples cuentas en moneda local y extranjera con sus saldos |
| [Cuentas por Cobrar](https://deorta-dev.github.io/ng-sirem-ui/demo/cuentas-por-cobrar) | Vencimientos, cobros parciales y estados de cuenta automatizados |
| [Cuentas por Pagar](https://deorta-dev.github.io/ng-sirem-ui/demo/cuentas-por-pagar) | Vencimientos, programación de pagos y comprobantes de egreso |
| [Dashboard Bento](https://deorta-dev.github.io/ng-sirem-ui/demo/page-bento) | Dashboard Bento: rail con tooltips, chips de fecha, sparklines y charts |
| [Detalle](https://deorta-dev.github.io/ng-sirem-ui/demo/page-detalle) | Ficha con KPIs y timeline |
| [Facturación Electrónica](https://deorta-dev.github.io/ng-sirem-ui/demo/facturacion-electronica) | Facturas, notas crédito y débito UBL 2.1 con validación y transmisión a la DIAN |
| [Facturas de Proveedores](https://deorta-dev.github.io/ng-sirem-ui/demo/facturas-proveedores) | Recepción electrónica con acuse de recibo y aceptación Radian |
| [Flujo de Caja](https://deorta-dev.github.io/ng-sirem-ui/demo/flujo-de-caja) | Proyección de ingresos y egresos a partir de cobrar y pagar |
| [Gestión de Empleados](https://deorta-dev.github.io/ng-sirem-ui/demo/gestion-empleados) | Ficha técnica con datos salariales, EPS, fondo de pensiones y ARL |
| [Gestión de Retenciones](https://deorta-dev.github.io/ng-sirem-ui/demo/retenciones) | ReteFuente, ReteICA y ReteIVA según la configuración tributaria |
| [Información Exógena](https://deorta-dev.github.io/ng-sirem-ui/demo/informacion-exogena) | Formatos tributarios y archivos de medios magnéticos |
| [Kárdex y Movimientos](https://deorta-dev.github.io/ng-sirem-ui/demo/kardex) | Trazabilidad de entradas y salidas con costo promedio ponderado |
| [Liquidación de Nómina](https://deorta-dev.github.io/ng-sirem-ui/demo/liquidacion-nomina) | Devengados y deducciones con neto a pagar por periodo |
| [Listado](https://deorta-dev.github.io/ng-sirem-ui/demo/page-listado) | Header, buscador y tabla con filtro |
| [Listas de Precios](https://deorta-dev.github.io/ng-sirem-ui/demo/listas-de-precios) | Tarifas mayorista y detal con actualización masiva de precios |
| [Login](https://deorta-dev.github.io/ng-sirem-ui/demo/page-login) | Acceso con card e inputs |
| [Multibodega](https://deorta-dev.github.io/ng-sirem-ui/demo/multibodega) | Control de existencias en ubicaciones físicas o virtuales |
| [Métricas de Salud](https://deorta-dev.github.io/ng-sirem-ui/demo/salud-clientes) | Alertas de vencidos, conciliaciones y documentos sin transmitir |
| [Nómina Electrónica DIAN](https://deorta-dev.github.io/ng-sirem-ui/demo/nomina-dian) | Documento soporte de pago de nómina y notas de ajuste |
| [Panel administrativo](https://deorta-dev.github.io/ng-sirem-ui/demo/page-admin) | Shell con sidebar fijo, workspace y dashboard |
| [Plan Único de Cuentas](https://deorta-dev.github.io/ng-sirem-ui/demo/plan-cuentas) | Catálogo PUC jerárquico, personalizable y preconfigurado |
| [Portafolio de Clientes](https://deorta-dev.github.io/ng-sirem-ui/demo/portafolio-clientes) | Dashboard central con el estado de todas las empresas cliente |
| [Prestaciones Sociales](https://deorta-dev.github.io/ng-sirem-ui/demo/prestaciones-sociales) | Prima, cesantías, intereses y vacaciones calculados |
| [Punto de Venta (POS)](https://deorta-dev.github.io/ng-sirem-ui/demo/pos) | Facturación en mostrador con carrito, código de barras y caja |
| [Remisiones](https://deorta-dev.github.io/ng-sirem-ui/demo/remisiones) | Albaranes de entrega que descuentan inventario sin obligación contable |
| [Reportes Financieros](https://deorta-dev.github.io/ng-sirem-ui/demo/reportes-financieros) | Estado de resultados, balance, libro mayor, balances y auxiliares |
| [Transferencias de Fondos](https://deorta-dev.github.io/ng-sirem-ui/demo/transferencias-fondos) | Movimientos internos entre cajas y bancos de la misma empresa |
| [Órdenes de Compra](https://deorta-dev.github.io/ng-sirem-ui/demo/ordenes-compra) | Solicitudes formales a proveedor convertibles en factura de compra |
<!-- galeria:end -->

## Interceptores HTTP

[Demo de los interceptores en el catálogo](https://deorta-dev.github.io/ng-sirem-ui/demo/interceptors)

```ts
// Token Bearer automático
providers: [
  provideHttpClient(withInterceptors([siremAuthInterceptor])),
  provideSiremAuth(() => localStorage.getItem('token')),
];

// Base URL para peticiones relativas (/api/...)
providers: [
  provideHttpClient(withInterceptors([siremBaseUrlInterceptor])),
  provideSiremApiUrl('https://api.sirem.com'),
];
```

## Atribución

- Uicons by [Flaticon](https://www.flaticon.com/uicons)
- Iconos Streamline según la licencia del set usado.
