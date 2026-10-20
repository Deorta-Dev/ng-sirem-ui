import { Component } from '@angular/core';
import { SiremChart } from '@deorta-dev/ng-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';
import { themeMode } from '../../shared/theme/theme';

/** Paleta SIREM compartida por las demos (redondeada y estilizada). */
const SIREM_COLORS = ['#26272b', '#8cb396', '#e4ff42', '#5f8a72', '#9aa1ac'];

const LIME = '#e4ff42';

const TOOLTIP = {
  backgroundColor: '#0f172a',
  borderWidth: 0,
  cornerRadius: 10,
  padding: [8, 12],
  textStyle: { color: '#f1f5f9', fontSize: 12 },
};

const AXIS = {
  axisLine: { lineStyle: { color: '#cbd5e1' } },
  axisTick: { show: false },
  axisLabel: { color: '#64748b', fontSize: 11 },
  splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' as const } },
};

@Component({
  selector: 'app-chart-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremChart],
  template: `
    <app-demo-page-layout title="Chart" category="Datos" subtitle="sirem-chart — ECharts con estilo SIREM (redondeado, sigue el theme).">
      <app-demo-variant-card title="Barras redondeadas" description="Ventas por mes con bordes suaves." [htmlCode]="h1" [tsCode]="t">
        <sirem-chart [option]="barras" [dark]="isDark()" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Líneas suaves con área" description="Comparativa de sedes." [htmlCode]="h2" [tsCode]="t">
        <sirem-chart [option]="lineas" [dark]="isDark()" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Dona estilizada" description="Participación por servicio." [htmlCode]="h3" [tsCode]="t">
        <sirem-chart [option]="dona" [height]="260" [dark]="isDark()" />
      </app-demo-variant-card>
      <app-demo-variant-card title="Loading" description="Capa de carga sobre la gráfica." [htmlCode]="h4" [tsCode]="t">
        <sirem-chart [option]="barras" [loading]="true" [dark]="isDark()" />
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Lollipop (referencia Bento)"
        description="Barra fina + punto en la cabeza: el gráfico del bloque Indicators."
        [htmlCode]="h5"
        [tsCode]="t5"
      >
        <sirem-chart [option]="lollipop" [height]="220" [dark]="isDark()" />
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Área con píldoras"
        description="Columnas translúcidas de fondo y línea suave con etiqueta de valor."
        [htmlCode]="h6"
        [tsCode]="t6"
      >
        <sirem-chart [option]="areaPildoras" [height]="220" [dark]="isDark()" />
      </app-demo-variant-card>
      <app-demo-variant-card
        title="Ecualizador"
        description="Barras alternas con marcador lima en el máximo (bloque Earnings)."
        [htmlCode]="h7"
        [tsCode]="t7"
      >
        <sirem-chart [option]="ecualizador" [height]="220" [dark]="isDark()" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class ChartDemoPage {
  isDark() {
    return themeMode() === 'dark';
  }

  readonly barras = {
    color: SIREM_COLORS,
    tooltip: { ...TOOLTIP, trigger: 'axis' as const, axisPointer: { type: 'shadow' as const } },
    grid: { left: 8, right: 8, top: 24, bottom: 0, containLabel: true },
    xAxis: { type: 'category' as const, data: ['Ene', 'Feb', 'Mar', 'Abr'], ...AXIS },
    yAxis: { type: 'value' as const, ...AXIS },
    series: [
      {
        type: 'bar' as const,
        data: [12, 19, 9, 15],
        barWidth: '45%',
        itemStyle: { borderRadius: [8, 8, 0, 0] },
        emphasis: { itemStyle: { shadowBlur: 12, shadowColor: 'rgba(29,100,241,.35)' } },
      },
    ],
  };

  readonly lineas = {
    color: SIREM_COLORS,
    tooltip: { ...TOOLTIP, trigger: 'axis' as const },
    legend: { bottom: 0, textStyle: { color: '#64748b', fontSize: 11 }, itemWidth: 14, itemHeight: 14, icon: 'roundRect' as const },
    grid: { left: 8, right: 8, top: 24, bottom: 32, containLabel: true },
    xAxis: { type: 'category' as const, data: ['Ene', 'Feb', 'Mar'], boundaryGap: false, ...AXIS },
    yAxis: { type: 'value' as const, ...AXIS },
    series: [
      {
        name: 'Norte', type: 'line' as const, data: [10, 14, 12],
        smooth: true, symbol: 'circle', symbolSize: 8, lineStyle: { width: 3 },
        areaStyle: { opacity: 0.12 },
      },
      {
        name: 'Sur', type: 'line' as const, data: [8, 11, 15],
        smooth: true, symbol: 'circle', symbolSize: 8, lineStyle: { width: 3 },
        areaStyle: { opacity: 0.12 },
      },
    ],
  };

  readonly dona = {
    color: SIREM_COLORS,
    tooltip: TOOLTIP,
    legend: { bottom: 0, textStyle: { color: '#64748b', fontSize: 11 }, itemWidth: 14, itemHeight: 14, icon: 'circle' as const },
    series: [
      {
        type: 'pie' as const,
        radius: ['48%', '72%'],
        center: ['50%', '44%'],
        itemStyle: { borderRadius: 8, borderWidth: 2, borderColor: '#fff' },
        label: { color: '#475569', fontSize: 11 },
        emphasis: { scale: true, scaleSize: 4 },
        data: [
          { value: 40, name: 'Consulta' },
          { value: 35, name: 'Óptica' },
          { value: 25, name: 'Lab' },
        ],
      },
    ],
  };

  /** Tinta del tema (el lollipop/área/ecualizador cambian de color con el modo). */
  private tinta(): string {
    return this.isDark() ? '#eceef1' : '#26272b';
  }

  /** Lollipop: barra fina + scatter en la cabeza. */
  get lollipop() {
    const datos = [42, 58, 36, 64, 50, 72];
    return {
      grid: { left: 4, right: 4, top: 16, bottom: 0, containLabel: true },
      xAxis: {
        type: 'category' as const,
        data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#8b9098', fontSize: 10 },
      },
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

  /** Área con columnas translúcidas tipo píldora y línea suave etiquetada. */
  get areaPildoras() {
    const datos = [30, 44, 26, 52, 38, 60];
    return {
      grid: { left: 0, right: 0, top: 30, bottom: 0, containLabel: true },
      xAxis: {
        type: 'category' as const,
        data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#8b9098', fontSize: 10 },
      },
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
    const muted = this.isDark() ? '#3a3d43' : '#d5d8de';
    return {
      grid: { left: 0, right: 0, top: 24, bottom: 0, containLabel: true },
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

  readonly h1 = '<sirem-chart [option]="barras" [dark]="isDark()" />';
  readonly h2 = '<sirem-chart [option]="lineas" [dark]="isDark()" />  <!-- smooth + área -->';
  readonly h3 = '<sirem-chart [option]="dona" [height]="260" [dark]="isDark()" />';
  readonly h4 = '<sirem-chart [option]="barras" [loading]="true" [dark]="isDark()" />';
  readonly h5 = '<sirem-chart [option]="lollipop" [height]="220" [dark]="isDark()" />';
  readonly h6 = '<sirem-chart [option]="areaPildoras" [height]="220" [dark]="isDark()" />';
  readonly h7 = '<sirem-chart [option]="ecualizador" [height]="220" [dark]="isDark()" />';

  readonly t5 = `/** Lollipop = barra fina (bar) + punto (scatter) con los mismos datos. */
get lollipop() {
  const datos = [42, 58, 36, 64, 50, 72];
  return {
    xAxis: { type: 'category', data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'] },
    yAxis: { type: 'value', show: false },
    series: [
      { type: 'bar', data: datos, barWidth: 2, itemStyle: { color: '#c6cbd3' } },
      { type: 'scatter', data: datos, symbolSize: 9, itemStyle: { color: '#26272b' } },
    ],
  };
}`;

  readonly t6 = `/** Píldoras translúcidas de fondo + línea suave con markPoint. */
get areaPildoras() {
  const datos = [30, 44, 26, 52, 38, 60];
  return {
    xAxis: { type: 'category', data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'] },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'bar', data: datos, barWidth: '22%',
        itemStyle: { color: 'rgba(140,179,150,0.22)', borderRadius: [999, 999, 999, 999] },
      },
      {
        type: 'line', data: datos, smooth: true, symbol: 'none',
        lineStyle: { width: 3, color: '#26272b' },
        markPoint: {
          data: [{ type: 'max' }], symbol: 'roundRect', symbolSize: [46, 22],
          itemStyle: { color: '#e4ff42' },
          label: { formatter: '$990', color: '#1a1a1a', fontWeight: 600 },
        },
      },
    ],
  };
}`;

  readonly t7 = `/** Barras alternas con color por dato y marcador lima en el máximo. */
get ecualizador() {
  const muted = '#d5d8de';
  return {
    xAxis: { type: 'category', data: ['12 Ago', '19 Sep', '26 Oct'] },
    yAxis: { type: 'value', show: false },
    series: [{
      type: 'bar', barWidth: '26%',
      data: [
        { value: 38, itemStyle: { color: '#26272b' } },
        { value: 54, itemStyle: { color: muted } },
        { value: 44, itemStyle: { color: '#26272b' } },
      ],
      itemStyle: { borderRadius: [8, 8, 8, 8] },
      markPoint: {
        data: [{ type: 'max' }], symbol: 'circle', symbolSize: 10,
        itemStyle: { color: '#e4ff42' }, label: { show: false },
      },
    }],
  };
}`;
  readonly t = `import { SiremChart } from '@deorta-dev/ng-sirem-ui';
import { themeMode } from '../../shared/theme/theme';

isDark() { return themeMode() === 'dark'; }

readonly SIREM_COLORS = ['#26272b', '#8cb396', '#e4ff42', '#5f8a72', '#9aa1ac'];

readonly TOOLTIP = {
  backgroundColor: '#0f172a', borderWidth: 0, cornerRadius: 10,
  padding: [8, 12], textStyle: { color: '#f1f5f9', fontSize: 12 },
};

readonly AXIS = {
  axisLine: { lineStyle: { color: '#cbd5e1' } },
  axisTick: { show: false },
  axisLabel: { color: '#64748b', fontSize: 11 },
  splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' as const } },
};

readonly barras = {
  color: SIREM_COLORS,
  tooltip: { ...TOOLTIP, trigger: 'axis' as const, axisPointer: { type: 'shadow' as const } },
  grid: { left: 8, right: 8, top: 24, bottom: 0, containLabel: true },
  xAxis: { type: 'category' as const, data: ['Ene', 'Feb', 'Mar', 'Abr'], ...AXIS },
  yAxis: { type: 'value' as const, ...AXIS },
  series: [{
    type: 'bar' as const, data: [12, 19, 9, 15], barWidth: '45%',
    itemStyle: { borderRadius: [8, 8, 0, 0] },
    emphasis: { itemStyle: { shadowBlur: 12, shadowColor: 'rgba(29,100,241,.35)' } },
  }],
};

readonly lineas = {
  color: SIREM_COLORS,
  tooltip: { ...TOOLTIP, trigger: 'axis' as const },
  legend: { bottom: 0, textStyle: { color: '#64748b', fontSize: 11 }, itemWidth: 14, itemHeight: 14, icon: 'roundRect' as const },
  grid: { left: 8, right: 8, top: 24, bottom: 32, containLabel: true },
  xAxis: { type: 'category' as const, data: ['Ene', 'Feb', 'Mar'], boundaryGap: false, ...AXIS },
  yAxis: { type: 'value' as const, ...AXIS },
  series: [
    { name: 'Norte', type: 'line' as const, data: [10, 14, 12], smooth: true, symbol: 'circle', symbolSize: 8, lineStyle: { width: 3 }, areaStyle: { opacity: 0.12 } },
    { name: 'Sur', type: 'line' as const, data: [8, 11, 15], smooth: true, symbol: 'circle', symbolSize: 8, lineStyle: { width: 3 }, areaStyle: { opacity: 0.12 } },
  ],
};

readonly dona = {
  color: SIREM_COLORS,
  tooltip: TOOLTIP,
  legend: { bottom: 0, textStyle: { color: '#64748b', fontSize: 11 }, itemWidth: 14, itemHeight: 14, icon: 'circle' as const },
  series: [{
    type: 'pie' as const, radius: ['48%', '72%'], center: ['50%', '44%'],
    itemStyle: { borderRadius: 8, borderWidth: 2, borderColor: '#fff' },
    label: { color: '#475569', fontSize: 11 },
    emphasis: { scale: true, scaleSize: 4 },
    data: [
      { value: 40, name: 'Consulta' },
      { value: 35, name: 'Óptica' },
      { value: 25, name: 'Lab' },
    ],
  }],
};`;
}
