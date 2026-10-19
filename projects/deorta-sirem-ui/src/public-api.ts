/*
 * Public API Surface of deorta-sirem-ui
 *
 * Estructura por componente (ver AGENTS.md):
 * projects/deorta-sirem-ui/src/lib/<categoria>/<nombre>/sirem-<nombre>.ts
 */

// Botones
export * from './lib/button/sirem-button';

// Iconos
export * from './lib/icons/fi-icon/sirem-fi-icon';
export * from './lib/icons/duotone-icon/sirem-duotone-icon';
export * from './lib/icons/streamline-icon/sirem-streamline-icon';

// Layout (shell: lo-admin-layout, sidebar, header, breadcrumbs)
export * from './lib/layout/admin-layout/sirem-admin-layout';
export * from './lib/layout/sidebar/sirem-sidebar';
export * from './lib/layout/topbar/sirem-topbar';
export * from './lib/layout/sticky/sirem-sticky';
export * from './lib/layout/breadcrumbs/sirem-breadcrumbs';
export * from './lib/layout/collapsible/sirem-collapsible';
export * from './lib/layout/collapsible/sirem-collapsible-group';

// Navegación (perfil, paleta Ctrl+K, control segmentado)
export * from './lib/navigation/user-menu/sirem-user-menu';
export * from './lib/navigation/search-palette/sirem-search-palette';
export * from './lib/navigation/navbar/sirem-navbar';
export * from './lib/navigation/segmented/sirem-segmented';

// Datos (listados lo-resource-set-list, tarjetas, estados)
export * from './lib/data-display/page-header/sirem-page-header';
export * from './lib/data-display/data-table/sirem-data-table';
export * from './lib/data-display/card/sirem-card';
export * from './lib/data-display/avatar/sirem-avatar';
export * from './lib/data-display/badge/sirem-badge';
export * from './lib/data-display/stat-card/sirem-stat-card';
export * from './lib/data-display/timeline/sirem-timeline';
export * from './lib/data-display/empty-state/sirem-empty-state';
export * from './lib/data-display/chart/sirem-chart';
export * from './lib/data-display/list/sirem-list';
export * from './lib/data-display/card-list/sirem-card-list';
export * from './lib/data-display/sparkline/sirem-sparkline';
export * from './lib/data-display/date-chip/sirem-date-chip';

// Campos de formulario (doble vía con [(value)] / [(checked)])
export * from './lib/form/field-box';
export * from './lib/form/input/sirem-input';
export * from './lib/form/textarea/sirem-textarea';
export * from './lib/form/select/sirem-select';
export * from './lib/form/datepicker/sirem-datepicker';
export * from './lib/form/date/sirem-date';
export * from './lib/form/switch/sirem-switch';
export * from './lib/form/checkbox/sirem-checkbox';
export * from './lib/form/radio-group/sirem-radio-group';
export * from './lib/form/image-upload/sirem-image-upload';
export * from './lib/form/search-field/sirem-search-field';
export * from './lib/form/multi-select/sirem-multi-select';
export * from './lib/form/code-editor/sirem-code-editor';
export * from './lib/form/rich-text/sirem-rich-text';

// Formularios dinámicos (grid 12 columnas, autoguardado)
export * from './lib/form/field-group/sirem-field-group';
export * from './lib/form/dynamic-form/sirem-dynamic-form';
export * from './lib/form/invoice-editor/sirem-invoice-editor';

// Overlays (CRUD en modales, paneles, popups de mapa)
export * from './lib/overlays/modal/sirem-modal';
export * from './lib/overlays/confirm-dialog/sirem-confirm-dialog';
export * from './lib/overlays/drawer/sirem-drawer';
export * from './lib/overlays/popup-card/sirem-popup-card';
export * from './lib/overlays/sheet/sirem-sheet';
export * from './lib/overlays/overlay/sirem-overlay-position';
export * from './lib/overlays/overlay/sirem-overlay-layer';
export * from './lib/overlays/overlay/sirem-overlay-viewport';
export * from './lib/overlays/overlay/sirem-overlay-trigger';
export * from './lib/overlays/overlay/sirem-submenu';

// Agenda (calendario con estados por colores)
export * from './lib/schedule/calendar/sirem-calendar';
export * from './lib/schedule/agenda/sirem-agenda';

// Directivas
export * from './lib/directives/autofocus/sirem-autofocus.directive';
export * from './lib/directives/click-outside/sirem-click-outside.directive';
export * from './lib/directives/numbers-only/sirem-numbers-only.directive';
export * from './lib/directives/tooltip/sirem-tooltip.directive';

// Pipes
export * from './lib/pipes/money/sirem-money.pipe';
export * from './lib/pipes/phone/sirem-phone.pipe';
export * from './lib/pipes/age/sirem-age.pipe';

// Interceptores HTTP
export * from './lib/interceptors/auth/sirem-auth.interceptor';
export * from './lib/interceptors/base-url/sirem-base-url.interceptor';
