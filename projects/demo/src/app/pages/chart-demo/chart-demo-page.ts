import { Component } from '@angular/core';
import { SiremChart } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';
import { themeMode } from '../../shared/theme/theme';

/** Paleta SIREM compartida por las demos (redondeada y estilizada). */
const SIREM_COLORS = ['#1d64f1', '#59a5ff', '#8ec5ff', '#174fe1', '#3384fc'];

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

  readonly h1 = '<sirem-chart [option]="barras" [dark]="isDark()" />';
  readonly h2 = '<sirem-chart [option]="lineas" [dark]="isDark()" />  <!-- smooth + área -->';
  readonly h3 = '<sirem-chart [option]="dona" [height]="260" [dark]="isDark()" />';
  readonly h4 = '<sirem-chart [option]="barras" [loading]="true" [dark]="isDark()" />';
  readonly t = `import { SiremChart } from 'deorta-sirem-ui';
import { themeMode } from '../../shared/theme/theme';

isDark() { return themeMode() === 'dark'; }

readonly SIREM_COLORS = ['#1d64f1', '#59a5ff', '#8ec5ff', '#174fe1', '#3384fc'];

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
