import { Component, computed, signal } from '@angular/core';
import {
  SiremAvatar,
  SiremBadge,
  SiremButton,
  SiremCalendar,
  type SiremCalendarEvent,
  SiremCard,
  SiremChart,
  SiremDateChip,
  SiremFiIcon,
  type SiremNavItem,
  SiremSegmented,
  type SiremSegmentedItem,
  SiremSidebar,
  SiremSparkline,
  SiremStatCard,
} from 'deorta-sirem-ui';
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';
import { themeMode } from '../../shared/theme/theme';

/** Paleta de las gráficas, adaptada al tema claro/oscuro. */
const SAGE = '#8cb396';
const LIME = '#e4ff42';

/**
 * Página de ejemplo «Dashboard Bento»: reproduce la referencia de diseño
 * (canvas claro, tarjetas flotantes muy redondeadas, acentos lima y salvia)
 * compuesta **solo con componentes SIREM**.
 *
 * Recorre los primitivos nuevos: `sirem-sidebar` en riel colapsado con
 * tooltips, `sirem-date-chip`, `sirem-segmented`, `sirem-sparkline`,
 * `sirem-calendar` con días rayados, `sirem-stat-card` y `sirem-chart`
 * (lollipop, ecualizador y área con píldoras).
 */
@Component({
  selector: 'app-bento-dashboard-demo-page',
  standalone: true,
  imports: [
    PageDemoShell,
    SiremAvatar,
    SiremBadge,
    SiremButton,
    SiremCalendar,
    SiremCard,
    SiremChart,
    SiremDateChip,
    SiremFiIcon,
    SiremSegmented,
    SiremSidebar,
    SiremSparkline,
    SiremStatCard,
  ],
  template: `
    <app-page-demo-shell label="Dashboard Bento" [files]="codeFiles">
      <div class="min-h-[100dvh]" style="background: var(--sirem-page-bg)">
        <sirem-sidebar
          brand="S"
          [items]="railItems"
          [(collapsed)]="railCollapsed"
          [pinned]="true"
          [floating]="true"
          [blur]="true"
        >
          <div slot="user" class="flex w-full justify-center">
            <sirem-button
              variant="accent"
              [iconOnly]="true"
              aria-label="Nueva medición"
              (pressed)="railCollapsed.set(false)"
            >
              <sirem-fi-icon name="rr-angle-small-right" />
            </sirem-button>
          </div>
        </sirem-sidebar>

        <section
          class="min-h-[100dvh] px-4 pb-28 pt-6 sm:px-6 md:pl-[calc(var(--workspace-sidebar-width)+2.5rem)]"
          [style.--workspace-sidebar-width]="'4.5rem'"
        >
          <!-- Cabecera: fichas de fecha + píldora de periodo -->
          <header class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              @for (d of dias; track d.day) {
                <sirem-date-chip
                  size="lg"
                  [weekday]="d.weekday"
                  [day]="d.day"
                  [active]="diaActivo() === d.day"
                  [dot]="d.dot"
                  [ariaLabel]="d.weekday + ' ' + d.day"
                  (pressed)="diaActivo.set(d.day)"
                />
              }
            </div>
            <div
              class="flex items-center gap-2 rounded-full py-1.5 pl-4 pr-1.5"
              style="background: var(--sirem-primary); box-shadow: var(--sirem-shadow-sm)"
            >
              <span class="text-sm font-semibold" style="color: var(--sirem-primary-text)">
                2024 Charts
              </span>
              <sirem-avatar name="Ana Pérez" size="sm" />
            </div>
          </header>

          <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <!-- Hero: tarjeta de medios que llena su fila -->
            <sirem-card class="lg:col-span-4" padding="none">
              <div
                class="relative flex h-full min-h-[20rem] flex-col justify-end gap-0.5 p-5"
                style="background: linear-gradient(155deg, #23262b 0%, #4b5058 58%, #8f959e 100%)"
              >
                <svg
                  viewBox="0 0 200 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  class="pointer-events-none absolute inset-0 h-full w-full"
                >
                  <path
                    d="M0 76 C 34 18, 76 96, 112 50 S 168 22, 200 42"
                    fill="none"
                    stroke="#e4ff42"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    vector-effect="non-scaling-stroke"
                  />
                </svg>
                <span
                  class="absolute right-4 top-4 rounded-full px-2.5 py-1 text-xs font-bold"
                  style="
                    background: color-mix(in srgb, var(--sirem-surface) 72%, transparent);
                    color: var(--sirem-text);
                    -webkit-backdrop-filter: blur(10px);
                    backdrop-filter: blur(10px);
                  "
                >
                  +19%
                </span>
                <p
                  class="relative flex items-center gap-1.5 text-xs font-semibold"
                  style="color: #d6d9de"
                >
                  <sirem-fi-icon name="rr-marker" [size]="14" />
                  Zona Norte
                </p>
                <p class="relative text-3xl font-bold leading-tight" style="color: #ffffff">
                  12km Running
                </p>
                <p class="relative text-xs font-semibold tracking-[0.22em]" style="color: #e4ff42">
                  NIKE PRO
                </p>
              </div>
            </sirem-card>

            <!-- Agenda: calendario plano sobre la tarjeta lima -->
            <sirem-card class="lg:col-span-4" tone="accent" padding="none">
              <div class="flex h-full flex-col p-4">
                <sirem-calendar
                  variant="plain"
                  size="small"
                  [events]="sesiones()"
                  [stripedDays]="rayados()"
                  [(selected)]="diaSeleccionado"
                />
                <div class="mt-3 flex items-end justify-between px-1" aria-hidden="true">
                  @for (t of regla; track t) {
                    <span class="flex flex-col items-center gap-1">
                      <span class="text-[10px] font-semibold" style="color: var(--sirem-text-faint)">
                        {{ t }}
                      </span>
                      <span class="block h-1.5 w-px" style="background: var(--sirem-border-strong)"></span>
                    </span>
                  }
                </div>
                <div class="mt-auto pt-4">
                  <sirem-segmented
                    size="sm"
                    tone="accent"
                    [items]="importes"
                    [(value)]="importe"
                    ariaLabel="Importe"
                  />
                </div>
              </div>
            </sirem-card>

            <!-- Ahorro: área con píldoras; la gráfica estira la tarjeta -->
            <sirem-card class="lg:col-span-4" tone="sage" padding="none">
              <div class="flex h-full flex-col p-4">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h3 class="text-base font-semibold" style="color: var(--sirem-text)">
                      Wow, Great!
                    </h3>
                    <p class="text-xs" style="color: var(--sirem-text-muted)">Ahorro del periodo</p>
                  </div>
                  <sirem-button variant="secondary" size="sm">
                    Saving
                    <sirem-fi-icon name="rr-angle-small-down" />
                  </sirem-button>
                </div>
                <div class="mt-3">
                  <p class="text-xs" style="color: var(--sirem-text-muted)">Saved</p>
                  <p class="text-2xl font-bold" style="color: var(--sirem-text)">$990</p>
                </div>
                <div class="mt-2 min-h-[10rem] flex-1">
                  <sirem-chart [option]="ahorro" [height]="'100%'" [dark]="esOscuro()" />
                </div>
              </div>
            </sirem-card>

            <!-- Indicadores: lollipop + gasto total en salvia al pie -->
            <sirem-card class="lg:col-span-4" padding="none">
              <div class="flex h-full flex-col">
                <div class="flex items-start justify-between gap-3 px-4 pt-4">
                  <div>
                    <h3 class="text-base font-semibold" style="color: var(--sirem-text)">
                      Indicators
                    </h3>
                    <p class="text-xs" style="color: var(--sirem-text-muted)">
                      Comparado con el mes pasado
                    </p>
                  </div>
                  <sirem-badge tone="accent">+19%</sirem-badge>
                </div>
                <p class="mt-2 px-4 text-right text-2xl font-bold" style="color: var(--sirem-text)">
                  $7,860
                </p>
                <div class="mt-2 h-[11rem]">
                  <sirem-chart [option]="lollipop" [height]="'100%'" [dark]="esOscuro()" />
                </div>
                <div
                  class="mt-auto flex flex-1 items-center justify-between gap-3 px-4 py-3"
                  style="background: var(--sirem-surface-sage)"
                >
                  <div>
                    <p class="text-xs font-semibold" style="color: var(--sirem-text-muted)">
                      Total Spend
                    </p>
                    <p class="text-xl font-bold" style="color: var(--sirem-text)">$59,638</p>
                  </div>
                  <div class="text-right">
                    <sirem-badge tone="accent">+15%</sirem-badge>
                    <p class="mt-1 text-xs" style="color: var(--sirem-text-muted)">
                      vs. $8,496 del año pasado
                    </p>
                  </div>
                </div>
              </div>
            </sirem-card>

            <!-- KPIs: rejilla 2×2 con sparkline al pie -->
            <div class="grid grid-cols-2 grid-rows-2 gap-4 lg:col-span-4">
              @for (kpi of kpis; track kpi.title) {
                <sirem-stat-card
                  size="sm"
                  [label]="kpi.title"
                  [value]="kpi.value"
                  [delta]="kpi.delta"
                  deltaLabel=""
                  [variant]="kpi.variant"
                  [color]="kpi.color"
                >
                  <sirem-sparkline
                    class="mt-auto pt-3"
                    [data]="kpi.data"
                    [highlight]="kpi.highlight"
                    [tone]="kpi.tone"
                    [height]="30"
                    [label]="kpi.title"
                  />
                </sirem-stat-card>
              }
            </div>

            <!-- Earnings: valor, trío de stats, ecualizador y pie -->
            <sirem-card class="lg:col-span-4" padding="none">
              <div class="flex h-full flex-col p-4">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h3 class="text-base font-semibold" style="color: var(--sirem-text)">Earnings</h3>
                    <p class="text-xs" style="color: var(--sirem-text-muted)">28 Sep · último mes</p>
                  </div>
                  <sirem-badge tone="accent">+16%</sirem-badge>
                </div>
                <p class="mt-2 text-3xl font-bold" style="color: var(--sirem-text)">$8,498</p>
                <div class="mt-3 grid grid-cols-3 gap-2">
                  <sirem-stat-card size="sm" label="Target" value="$2,268" variant="tint" color="brand" />
                  <sirem-stat-card
                    size="sm"
                    label="Difference"
                    value="−0.260"
                    variant="tint"
                    color="danger"
                  />
                  <sirem-stat-card
                    size="sm"
                    label="Goals"
                    value="+0.99"
                    variant="tint"
                    color="success"
                  />
                </div>
                <div class="mt-3 min-h-[7rem] flex-1">
                  <sirem-chart [option]="ecualizador" [height]="'100%'" [dark]="esOscuro()" />
                </div>
                <div
                  class="mt-3 grid grid-cols-3 gap-2 border-t pt-3"
                  style="border-color: var(--sirem-border-soft)"
                >
                  @for (m of metricas; track m.label) {
                    <div class="flex flex-col items-center gap-1 text-center">
                      <sirem-fi-icon [name]="m.icon" [size]="18" />
                      <p class="text-sm font-bold" style="color: var(--sirem-text)">{{ m.value }}</p>
                      <p class="text-[11px]" style="color: var(--sirem-text-muted)">{{ m.label }}</p>
                    </div>
                  }
                </div>
              </div>
            </sirem-card>

            <!-- Nuevos productos: una sola fila de fichas -->
            <sirem-card class="lg:col-span-8" padding="none">
              <div class="flex h-full flex-col p-4">
                <div class="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 class="text-base font-semibold" style="color: var(--sirem-text)">
                      New Products
                    </h3>
                    <p class="text-xs" style="color: var(--sirem-text-muted)">9,258 Items</p>
                  </div>
                  <sirem-button
                    variant="ghost"
                    [bordered]="false"
                    [iconOnly]="true"
                    aria-label="Favoritos"
                  >
                    <sirem-fi-icon name="rr-heart" />
                  </sirem-button>
                </div>
                <div class="grid flex-1 grid-cols-4 gap-3">
                  <div
                    class="flex min-h-[6.5rem] flex-col justify-between rounded-2xl p-3"
                    style="background: var(--sirem-accent); color: var(--sirem-accent-ink)"
                  >
                    <span class="text-sm font-semibold">All</span>
                    <sirem-fi-icon name="rr-grid" [size]="20" />
                  </div>
                  @for (tile of productos; track tile.label) {
                    <div
                      class="flex min-h-[6.5rem] flex-col justify-between rounded-2xl p-3"
                      [style.background]="tile.bg"
                    >
                      <span class="text-xs font-semibold" style="color: #141518">{{ tile.label }}</span>
                      <sirem-badge tone="neutral">{{ tile.price }}</sirem-badge>
                    </div>
                  }
                </div>
              </div>
            </sirem-card>

            <!-- Semana en curso -->
            <sirem-card class="lg:col-span-4" tone="muted" padding="none">
              <div class="flex h-full flex-col p-4">
                <div>
                  <h3 class="text-base font-semibold" style="color: var(--sirem-text)">Week</h3>
                  <p class="text-xs" style="color: var(--sirem-text-muted)">Semana en curso</p>
                </div>
                <div class="mt-3">
                  <sirem-segmented
                    size="sm"
                    [items]="semana"
                    [(value)]="diaSemana"
                    ariaLabel="Día de la semana"
                  />
                </div>
                <div class="mt-auto flex items-center justify-between gap-3 pt-4">
                  <span class="text-xs" style="color: var(--sirem-text-muted)">Recordatorios</span>
                  <sirem-badge tone="accent">3</sirem-badge>
                </div>
              </div>
            </sirem-card>
          </div>
        </section>
      </div>
    </app-page-demo-shell>
  `,
})
export class BentoDashboardDemoPage {
  readonly railCollapsed = signal(true);
  readonly diaActivo = signal<string | number>('19');
  readonly diaSeleccionado = signal<string | null>(null);
  readonly importe = signal<string | null>('btc');
  readonly diaSemana = signal<string | null>('30');

  readonly railItems: SiremNavItem[] = [
    { label: 'Buscar', icon: 'fi fi-rr-search' },
    { label: 'Inicio', icon: 'fi fi-rr-home' },
    { label: 'Explorar', icon: 'fi fi-rr-compass' },
    { label: 'Capas', icon: 'fi fi-rr-layers' },
    { label: 'Cartera', icon: 'fi fi-rr-briefcase' },
    { label: 'Equipo', icon: 'fi fi-rr-users' },
    { label: 'Seguridad', icon: 'fi fi-rr-shield', tooltip: 'Shield' },
    { label: 'Panel', icon: 'fi fi-rr-grid' },
    { label: 'Ajustes', icon: 'fi fi-rr-settings' },
    { label: 'Mensajes', icon: 'fi fi-rr-comment' },
  ];

  readonly dias = [
    { weekday: 'L', day: '19', dot: false },
    { weekday: 'V', day: '23', dot: true },
  ];

  readonly importes: SiremSegmentedItem[] = [
    { value: 'bnb', label: '0.34 BNB' },
    { value: 'sol', label: '19 SOL' },
    { value: 'btc', label: '0.09 BTC' },
    { value: 'eth', label: '0.8 ETH' },
  ];

  /** Marcas de la regla decorativa que separa el calendario del importe. */
  readonly regla = ['60', '61', '62', '63'];

  readonly semana: SiremSegmentedItem[] = [
    { value: '29', label: 'L', hint: '29' },
    { value: '30', label: 'M', hint: '30' },
    { value: '31', label: 'X', hint: '31' },
  ];

  readonly kpis = [
    {
      title: 'Business Costs',
      value: '4.9k',
      delta: 20.5,
      variant: 'tint' as const,
      color: 'success' as const,
      tone: 'sage' as const,
      highlight: 3,
      data: [4, 7, 5, 9, 6],
    },
    {
      title: 'Travel Costs',
      value: '2.1k',
      delta: 8.2,
      variant: 'soft' as const,
      color: 'brand' as const,
      tone: 'accent' as const,
      highlight: 4,
      data: [3, 5, 4, 6, 7],
    },
    {
      title: 'Saving Monthly',
      value: '990',
      delta: 12.4,
      variant: 'tint' as const,
      color: 'accent' as const,
      tone: 'accent' as const,
      highlight: 4,
      data: [2, 4, 6, 5, 9],
    },
    {
      title: 'Balance',
      value: '$0.8',
      delta: -3.1,
      variant: 'soft' as const,
      color: 'brand' as const,
      tone: 'danger' as const,
      highlight: 3,
      data: [6, 4, 5, 3, 2],
    },
  ];

  readonly metricas = [
    { icon: 'fi fi-rr-bulb', value: '23°', label: 'Success Rate' },
    { icon: 'fi fi-rr-cloud', value: '19 m/s', label: 'Goes Up Percent' },
    { icon: 'fi fi-rr-stats', value: '64%', label: 'Positive' },
  ];

  readonly productos = [
    { label: 'Watch', price: '$89', bg: 'linear-gradient(140deg, #cfe4d0, #8cb396)' },
    { label: 'Kit', price: '$64', bg: 'linear-gradient(140deg, #eceef1, #c6cbd3)' },
    { label: 'Socks', price: '$12', bg: 'linear-gradient(140deg, #f5ffc2, #e7f1e8)' },
  ];

  /** Días rayados (no disponibles) del mes en curso. */
  readonly rayados = computed<string[]>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return [3, 8, 12, 17].map((d) => y + '-' + m + '-' + String(d).padStart(2, '0'));
  });

  /** Días con sesión: en la variante plana se pintan con el acento lima. */
  readonly sesiones = computed<SiremCalendarEvent[]>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const iso = (d: number) => y + '-' + m + '-' + String(d).padStart(2, '0');
    return [5, 10, 15, 23, 27].map((d) => ({
      date: iso(d),
      label: 'Sesión',
      color: '#5f8a72',
    }));
  });

  esOscuro(): boolean {
    return themeMode() === 'dark';
  }

  private tinta(): string {
    return this.esOscuro() ? '#eceef1' : '#26272b';
  }

  /** Lollipop: barra fina + punto en la cabeza. */
  get lollipop() {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const datos = [42, 58, 36, 64, 50, 72];
    return {
      grid: { left: 4, right: 4, top: 14, bottom: 0, containLabel: true },
      xAxis: {
        type: 'category' as const,
        data: meses,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#8b9098', fontSize: 10 },
      },
      // Tope holgado: el punto de la cabeza necesita aire para no recortarse.
      yAxis: { type: 'value' as const, show: false, max: 88 },
      series: [
        {
          type: 'bar' as const,
          data: datos,
          barWidth: 2,
          itemStyle: { color: '#c6cbd3', borderRadius: [2, 2, 2, 2] },
        },
        {
          type: 'scatter' as const,
          data: datos,
          symbolSize: 9,
          itemStyle: { color: this.tinta() },
          z: 3,
        },
      ],
    };
  }

  /** Área con columnas translúcidas tipo píldora y línea suave. */
  get ahorro() {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const datos = [30, 44, 26, 52, 38, 60];
    return {
      grid: { left: 0, right: 0, top: 30, bottom: 0, containLabel: true },
      xAxis: {
        type: 'category' as const,
        data: meses,
        boundaryGap: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#8b9098', fontSize: 10 },
      },
      // Tope holgado para que la píldora del máximo no se recorte.
      yAxis: { type: 'value' as const, show: false, max: 78 },
      series: [
        {
          type: 'bar' as const,
          data: datos,
          barWidth: '22%',
          itemStyle: { color: 'rgba(140,179,150,0.22)', borderRadius: [999, 999, 999, 999] },
        },
        {
          type: 'line' as const,
          data: datos,
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 3, color: this.tinta() },
          markPoint: {
            data: [{ type: 'max' as const }],
            symbol: 'roundRect',
            symbolSize: [46, 22],
            itemStyle: { color: LIME },
            label: { formatter: '$990', color: '#1a1a1a', fontSize: 11, fontWeight: 600 },
          },
        },
      ],
    };
  }

  /** Ecualizador: barras alternas con marcador lima en el máximo. */
  get ecualizador() {
    const muted = this.esOscuro() ? '#3a3d43' : '#d5d8de';
    return {
      grid: { left: 0, right: 0, top: 20, bottom: 0, containLabel: true },
      xAxis: {
        type: 'category' as const,
        data: ['12 Ago', '19 Sep', '26 Oct'],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#8b9098', fontSize: 11 },
      },
      yAxis: {
        type: 'value' as const,
        show: false,
        max: 64,
        splitNumber: 2,
        splitLine: { lineStyle: { type: 'dashed' as const, color: muted } },
      },
      series: [
        {
          type: 'bar' as const,
          barWidth: 22,
          data: [
            { value: 38, itemStyle: { color: this.tinta() } },
            { value: 54, itemStyle: { color: muted } },
            { value: 44, itemStyle: { color: this.tinta() } },
          ],
          itemStyle: { borderRadius: [11, 11, 11, 11] },
          markPoint: {
            data: [{ type: 'max' as const }],
            symbol: 'circle',
            symbolSize: 10,
            itemStyle: { color: LIME },
            label: { show: false },
          },
        },
      ],
    };
  }

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'bento-dashboard.html',
      language: 'html',
      code: `<sirem-sidebar brand="S" [items]="railItems" [collapsed]="true" [pinned]="true" [floating]="true">
  <div slot="user"><sirem-button variant="accent" [iconOnly]="true" aria-label="Nueva" /></div>
</sirem-sidebar>

<header class="flex items-center justify-between">
  <sirem-date-chip size="lg" weekday="L" day="19" [active]="true" />
  <sirem-date-chip size="lg" weekday="V" day="23" [dot]="true" />
  <sirem-avatar name="Ana Pérez" size="sm" />
</header>

<!-- El calendario va sin marco sobre la tarjeta lima -->
<sirem-card tone="accent" padding="none">
  <sirem-calendar variant="plain" size="small" [events]="sesiones()" [stripedDays]="rayados()" />
  <sirem-segmented tone="accent" [items]="importes" [(value)]="importe" />
</sirem-card>

<!-- La gráfica llena su tarjeta -->
<sirem-card tone="sage" padding="none">
  <sirem-chart [option]="ahorro" [height]="'100%'" />
</sirem-card>

<sirem-card title="Indicators">
  <sirem-badge tone="accent">+19%</sirem-badge>
  <sirem-chart [option]="lollipop" [height]="'100%'" />
</sirem-card>

<!-- KPI compacto con sparkline al pie -->
<sirem-stat-card size="sm" label="Business Costs" value="4.9k" [delta]="20.5" deltaLabel="" variant="tint" color="success">
  <sirem-sparkline class="mt-auto pt-3" [data]="kpi.data" [highlight]="3" tone="sage" />
</sirem-stat-card>`,
    },
    {
      name: 'bento-dashboard.ts',
      language: 'typescript',
      code: `import { signal, computed } from '@angular/core';
import {
  SiremCalendar, type SiremCalendarEvent, SiremCard, SiremChart, SiremDateChip,
  SiremSegmented, SiremSidebar, SiremSparkline, SiremStatCard, type SiremNavItem,
} from 'deorta-sirem-ui';

readonly railItems: SiremNavItem[] = [
  { label: 'Inicio', icon: 'fi fi-rr-home' },
  { label: 'Seguridad', icon: 'fi fi-rr-shield', tooltip: 'Shield' },
];

readonly sesiones = computed<SiremCalendarEvent[]>(() => [
  { date: '2026-10-05', label: 'Sesión', color: '#5f8a72' },
  { date: '2026-10-10', label: 'Sesión', color: '#5f8a72' },
]);

/** Lollipop = barra fina + scatter en la cabeza (con tope holgado). */
readonly lollipop = {
  xAxis: { type: 'category', data: ['Ene', 'Feb', 'Mar'] },
  yAxis: { type: 'value', show: false, max: 88 },
  series: [
    { type: 'bar', data: [42, 58, 36], barWidth: 2 },
    { type: 'scatter', data: [42, 58, 36], symbolSize: 9 },
  ],
};`,
    },
  ];
}
