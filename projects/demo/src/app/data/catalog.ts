/** Sección del catálogo demo. */
export type DemoSection = 'componentes' | 'directivas' | 'pipes' | 'interceptores' | 'paginas';

export const SECTIONS: { id: DemoSection; title: string; hint: string }[] = [
  { id: 'componentes', title: 'Componentes', hint: 'UI reutilizable con variantes en vivo.' },
  { id: 'directivas', title: 'Directivas', hint: 'Comportamiento sobre elementos nativos.' },
  { id: 'pipes', title: 'Pipes', hint: 'Formato de moneda, teléfono y edad.' },
  { id: 'interceptores', title: 'Interceptores', hint: 'Auth Bearer y base URL para HttpClient.' },
  { id: 'paginas', title: 'Páginas', hint: 'Ejemplos compuestos solo con SIREM.' },
];

/** Entrada del catálogo demo. `section` por defecto es `componentes`. */
export interface CatalogEntry {
  slug: string;
  name: string;
  selector: string;
  category: string;
  description: string;
  section?: DemoSection;
}

export const CATALOG: CatalogEntry[] = [
  // Botones
  {
    slug: 'button',
    name: 'Button',
    selector: 'sirem-button',
    category: 'Botones',
    description: 'Acciones con variantes, tamaños, loading y async.',
  },
  // Iconos
  {
    slug: 'fi-icon',
    name: 'Fi Icon',
    selector: 'sirem-fi-icon',
    category: 'Iconos',
    description: 'Flaticon UIcons por peso y tamaño.',
  },
  {
    slug: 'duotone-icon',
    name: 'Duotone Icon',
    selector: 'sirem-duotone-icon',
    category: 'Iconos',
    description: 'Phosphor duotone en dos tonos.',
  },
  {
    slug: 'streamline-icon',
    name: 'Streamline Icon',
    selector: 'sirem-streamline-icon',
    category: 'Iconos',
    description: 'Registro SVG Streamline Ultimate Duotone.',
  },
  // Layout (admin-layout excluido por ahora: se retomará al mejorar el shell)
  {
    slug: 'sidebar',
    name: 'Sidebar',
    selector: 'sirem-sidebar',
    category: 'Layout',
    description: 'Navegación lateral colapsable.',
  },
  {
    slug: 'topbar',
    name: 'Topbar',
    selector: 'sirem-topbar',
    category: 'Layout',
    description: 'Barra superior de espacio y acciones.',
  },
  {
    slug: 'breadcrumbs',
    name: 'Breadcrumbs',
    selector: 'sirem-breadcrumbs',
    category: 'Layout',
    description: 'Migas de pan por niveles.',
  },
  // Navegación
  {
    slug: 'user-menu',
    name: 'User Menu',
    selector: 'sirem-user-menu',
    category: 'Navegación',
    description: 'Perfil con avatar y acciones.',
  },
  {
    slug: 'search-palette',
    name: 'Search Palette',
    selector: 'sirem-search-palette',
    category: 'Navegación',
    description: 'Paleta Ctrl+K con grupos.',
  },
  {
    slug: 'navbar',
    name: 'Navbar',
    selector: 'sirem-navbar',
    category: 'Navegación',
    description: 'Menú vertical / horizontal.',
  },
  // Datos
  {
    slug: 'page-header',
    name: 'Page Header',
    selector: 'sirem-page-header',
    category: 'Datos',
    description: 'Título + subtítulo + acciones.',
  },
  {
    slug: 'view-toggle',
    name: 'View Toggle',
    selector: 'sirem-view-toggle',
    category: 'Datos',
    description: 'Alternar tabla / tarjetas.',
  },
  {
    slug: 'data-table',
    name: 'Data Table',
    selector: 'sirem-data-table',
    category: 'Datos',
    description: 'Tabla ordenable y seleccionable.',
  },
  {
    slug: 'card',
    name: 'Card',
    selector: 'sirem-card',
    category: 'Datos',
    description: 'Contenedor con header y footer.',
  },
  {
    slug: 'avatar',
    name: 'Avatar',
    selector: 'sirem-avatar',
    category: 'Datos',
    description: 'Iniciales o foto con presencia.',
  },
  {
    slug: 'badge',
    name: 'Badge',
    selector: 'sirem-badge',
    category: 'Datos',
    description: 'Etiquetas por tono.',
  },
  {
    slug: 'stat-card',
    name: 'Stat Card',
    selector: 'sirem-stat-card',
    category: 'Datos',
    description: 'KPI con delta e icono.',
  },
  {
    slug: 'timeline',
    name: 'Timeline',
    selector: 'sirem-timeline',
    category: 'Datos',
    description: 'Eventos con tonos y hora.',
  },
  {
    slug: 'empty-state',
    name: 'Empty State',
    selector: 'sirem-empty-state',
    category: 'Datos',
    description: 'Estado vacío con acción.',
  },
  {
    slug: 'list',
    name: 'List',
    selector: 'sirem-list',
    category: 'Datos',
    description: 'Filas con icono, badge y chevron.',
  },
  {
    slug: 'card-list',
    name: 'Card List',
    selector: 'sirem-card-list',
    category: 'Datos',
    description: 'Grilla de tarjetas en vez de tabla.',
  },
  {
    slug: 'chart',
    name: 'Chart',
    selector: 'sirem-chart',
    category: 'Datos',
    description: 'ECharts barras / líneas / dona.',
  },
  // Formularios
  {
    slug: 'input',
    name: 'Input',
    selector: 'sirem-input-field',
    category: 'Formularios',
    description: 'Texto, iconos y autocompletado.',
  },
  {
    slug: 'textarea',
    name: 'Textarea',
    selector: 'sirem-textarea-field',
    category: 'Formularios',
    description: 'Área multilínea.',
  },
  {
    slug: 'select',
    name: 'Select',
    selector: 'sirem-select-field',
    category: 'Formularios',
    description: 'Lista desplegable.',
  },
  {
    slug: 'datepicker',
    name: 'Datepicker',
    selector: 'sirem-datepicker-field',
    category: 'Formularios',
    description: 'Fecha nativa.',
  },
  {
    slug: 'date',
    name: 'Date',
    selector: 'sirem-date-field',
    category: 'Formularios',
    description: 'Fecha con calendario popup.',
  },
  {
    slug: 'switch',
    name: 'Switch',
    selector: 'sirem-switch-field',
    category: 'Formularios',
    description: 'Interruptor on/off.',
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    selector: 'sirem-checkbox-field',
    category: 'Formularios',
    description: 'Casilla con descripción.',
  },
  {
    slug: 'radio-group',
    name: 'Radio Group',
    selector: 'sirem-radio-group-field',
    category: 'Formularios',
    description: 'Opciones excluyentes.',
  },
  {
    slug: 'search-field',
    name: 'Search Field',
    selector: 'sirem-search-field',
    category: 'Formularios',
    description: 'Búsqueda con estado.',
  },
  {
    slug: 'image-upload',
    name: 'Image Upload',
    selector: 'sirem-image-upload-field',
    category: 'Formularios',
    description: 'Subida con preview.',
  },
  {
    slug: 'field-group',
    name: 'Field Group',
    selector: 'sirem-field-group',
    category: 'Formularios',
    description: 'Agrupador de campos.',
  },
  {
    slug: 'multi-select',
    name: 'Multi Select',
    selector: 'sirem-multi-select',
    category: 'Formularios',
    description: 'Permisos y roles con grupos y buscador.',
  },
  {
    slug: 'code-editor',
    name: 'Code Editor',
    selector: 'sirem-code-editor',
    category: 'Formularios',
    description: 'Código editable que sigue el tema.',
  },
  {
    slug: 'rich-text',
    name: 'Rich Text',
    selector: 'sirem-rich-text',
    category: 'Formularios',
    description: 'Texto enriquecido que devuelve HTML.',
  },
  {
    slug: 'dynamic-form',
    name: 'Dynamic Form',
    selector: 'sirem-dynamic-form',
    category: 'Formularios',
    description: 'Schema Lion con grupos y tablas.',
  },
  // Overlays
  {
    slug: 'modal',
    name: 'Modal',
    selector: 'sirem-modal',
    category: 'Overlays',
    description: 'Diálogo por tamaños.',
  },
  {
    slug: 'toast',
    name: 'Dynamic Toast',
    selector: 'dt-viewport',
    category: 'Overlays',
    description: 'Notificaciones con Dynamic Island y spring physics.',
  },
  {
    slug: 'confirm-dialog',
    name: 'Confirm Dialog',
    selector: 'sirem-confirm-dialog',
    category: 'Overlays',
    description: 'Confirmación primary/danger.',
  },
  {
    slug: 'drawer',
    name: 'Drawer',
    selector: 'sirem-drawer',
    category: 'Overlays',
    description: 'Panel lateral.',
  },
  {
    slug: 'popup-card',
    name: 'Popup Card',
    selector: 'sirem-popup-card',
    category: 'Overlays',
    description: 'Tarjeta popup de mapa.',
  },
  // Agenda
  {
    slug: 'calendar',
    name: 'Calendar',
    selector: 'sirem-calendar',
    category: 'Agenda',
    description: 'Calendario small/medium/large.',
  },
  // Directivas
  {
    slug: 'autofocus',
    name: 'Autofocus',
    selector: '[siremAutofocus]',
    category: 'Foco',
    description: 'Enfoca al aparecer, con retraso opcional.',
    section: 'directivas',
  },
  {
    slug: 'click-outside',
    name: 'Click Outside',
    selector: '(siremClickOutside)',
    category: 'Eventos',
    description: 'Detecta clics fuera del elemento.',
    section: 'directivas',
  },
  {
    slug: 'numbers-only',
    name: 'Numbers Only',
    selector: 'input[siremNumbersOnly]',
    category: 'Formato',
    description: 'Solo dígitos, con decimal opcional.',
    section: 'directivas',
  },
  // Pipes
  {
    slug: 'money',
    name: 'Money',
    selector: 'siremMoney',
    category: 'Formato',
    description: 'Moneda es-CO sin decimales.',
    section: 'pipes',
  },
  {
    slug: 'phone',
    name: 'Phone',
    selector: 'siremPhone',
    category: 'Formato',
    description: 'Teléfono en bloques 3-3-4.',
    section: 'pipes',
  },
  {
    slug: 'age',
    name: 'Age',
    selector: 'siremAge',
    category: 'Formato',
    description: 'Edad desde fecha ISO.',
    section: 'pipes',
  },
  // Interceptores
  {
    slug: 'interceptors',
    name: 'Auth + Base URL',
    selector: 'siremAuthInterceptor',
    category: 'HTTP',
    description: 'Bearer y prefijo de API.',
    section: 'interceptores',
  },
  // Páginas de ejemplo
  {
    slug: 'page-login',
    name: 'Login',
    selector: 'page-login',
    category: 'Ejemplos',
    description: 'Acceso con card e inputs.',
    section: 'paginas',
  },
  {
    slug: 'page-admin',
    name: 'Panel administrativo',
    selector: 'page-admin',
    category: 'Ejemplos',
    description: 'Shell con sidebar fijo, workspace y dashboard.',
    section: 'paginas',
  },
  {
    slug: 'page-listado',
    name: 'Listado',
    selector: 'page-listado',
    category: 'Ejemplos',
    description: 'Header, buscador y tabla con filtro.',
    section: 'paginas',
  },
  {
    slug: 'page-detalle',
    name: 'Detalle',
    selector: 'page-detalle',
    category: 'Ejemplos',
    description: 'Ficha con KPIs y timeline.',
    section: 'paginas',
  },
];

export const CATEGORIES = [...new Set(CATALOG.map((c) => c.category))];

export function sectionOf(entry: CatalogEntry): DemoSection {
  return entry.section ?? 'componentes';
}
