import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent,
  MarkPointComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';
import type { ECharts, EChartsCoreOption } from 'echarts/core';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent,
  MarkPointComponent,
  TitleComponent,
  TooltipComponent,
  CanvasRenderer,
  SVGRenderer,
]);

/**
 * Gráfica estadística con Apache ECharts (barras simples, series múltiples,
 * dona…). Recibe la opción ECharts tal cual, por lo que sirve para casos
 * simples y compuestos sin cambiar de componente.
 *
 * Registra barras, líneas, dona y dispersión, además de `markPoint`,
 * `markLine` y `markArea`, así que las anotaciones de la opción se pintan.
 *
 * Uso:
 * ```html
 * <sirem-chart [option]="ventasPorMes" [dark]="esOscuro()" />
 * <!-- simple: --> { xAxis: { data: [...] }, series: [{ type: 'bar', data: [...] }] }
 * <!-- múltiple: --> series: [{ name: 'A', type: 'line', ... }, { name: 'B', ... }]
 * <!-- llena su contenedor: --> <sirem-chart [height]="'100%'" [option]="opt" />
 * ```
 */
@Component({
  selector: 'sirem-chart',
  standalone: true,
  styleUrl: './sirem-chart.scss',
  // Solo en modo «llenar» el host reclama el alto del contenedor; con un alto
  // numérico se queda con el suyo para no alterar las páginas que ya lo usan.
  host: { '[class.sirem-chart-host--fill]': 'isFill()' },
  template: `
    <div class="sirem-chart" [style.height]="heightStyle()">
      <div #box class="sirem-chart__box"></div>
      @if (loading()) {
        <div class="sirem-chart__loading" role="status" aria-label="Cargando gráfica">
          <span class="sirem-chart__spinner" aria-hidden="true"></span>
        </div>
      }
    </div>
  `,
})
export class SiremChart {
  /** Opción ECharts completa (título, ejes, series…). */
  readonly option = input<EChartsCoreOption>({});
  /** Alto: número en px (320 por defecto) o longitud CSS (`'100%'`). */
  readonly height = input<number | string>(320);
  /** `true` cuando el alto es una longitud (p. ej. `100%`): llena su contenedor. */
  readonly isFill = computed(() => typeof this.height() !== 'number');
  /** Alto resuelto para el contenedor. */
  readonly heightStyle = computed(() => {
    const h = this.height();
    return typeof h === 'number' ? `${h}px` : h;
  });
  /** Capa de carga sobre la gráfica. */
  readonly loading = input(false);
  /** Tema oscuro integrado de ECharts. */
  readonly dark = input(false);
  /** Renderizador: svg (nítido, apto tests) o canvas (miles de puntos). */
  readonly renderer = input<'canvas' | 'svg'>('svg');

  readonly ready = output<ECharts>();

  private readonly box = viewChild<ElementRef<HTMLDivElement>>('box');
  private readonly destroyRef = inject(DestroyRef);
  private chart: ECharts | null = null;
  private ro: ResizeObserver | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private retries = 0;
  private static readonly MAX_RETRIES = 40;

  constructor() {
    afterNextRender(() => this.render());
    effect(() => {
      // Re-lee las entradas para reaccionar a cambios.
      this.option();
      this.dark();
      this.renderer();
      this.height();
      this.render();
    });
    this.destroyRef.onDestroy(() => {
      if (this.retryTimer) clearTimeout(this.retryTimer);
      this.ro?.disconnect();
      this.chart?.dispose();
      this.chart = null;
    });
  }

  private render(): void {
    const el = this.box()?.nativeElement;
    if (!el) return;
    if (el.clientWidth <= 0 || el.clientHeight <= 0) {
      // Contenedor oculto o aún sin layout (p. ej. demo proyectada pero no
      // visible): reintenta un tiempo y luego desiste en silencio.
      if (this.retryTimer) clearTimeout(this.retryTimer);
      if (this.retries < SiremChart.MAX_RETRIES) {
        this.retries++;
        this.retryTimer = setTimeout(() => this.render(), 150);
      }
      return;
    }
    this.retries = 0;
    const theme = this.dark() ? 'dark' : undefined;
    const renderer = this.renderer();
    const needsNew =
      !this.chart ||
      (this.chart as unknown as { __siremTheme?: unknown }).__siremTheme !== theme ||
      (this.chart as unknown as { __siremRenderer?: unknown }).__siremRenderer !== renderer;
    if (needsNew) {
      this.chart?.dispose();
      this.chart = echarts.init(el, theme, { renderer });
      (this.chart as unknown as { __siremTheme?: unknown }).__siremTheme = theme;
      (this.chart as unknown as { __siremRenderer?: unknown }).__siremRenderer = renderer;
      this.ready.emit(this.chart);
      if (!this.ro && typeof ResizeObserver !== 'undefined') {
        this.ro = new ResizeObserver(() => this.chart?.resize());
        this.ro.observe(el);
      }
    }
    const chart = this.chart;
    if (!chart) return;
    chart.setOption(this.option(), { notMerge: false });
    chart.resize();
  }
}
