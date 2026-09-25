import { TestBed } from '@angular/core/testing';
import type { ECharts } from 'echarts/core';
import { SiremChart } from './sirem-chart';

function mockSize(fixture: { nativeElement: HTMLElement }, w = 600, h = 320): void {
  const box = fixture.nativeElement.querySelector('.sirem-chart__box') as HTMLElement;
  Object.defineProperty(box, 'clientWidth', { configurable: true, value: w });
  Object.defineProperty(box, 'clientHeight', { configurable: true, value: h });
}

const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

describe('SiremChart', () => {
  it('should create and expose the chart on ready', async () => {
    const fixture = TestBed.createComponent(SiremChart);
    fixture.componentRef.setInput('option', {
      xAxis: { type: 'category', data: ['Ene', 'Feb'] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [5, 8] }],
    });
    let chart: ECharts | null = null;
    fixture.componentInstance.ready.subscribe((c) => (chart = c));
    fixture.detectChanges();
    mockSize(fixture);
    await wait(500);
    expect(chart).toBeTruthy();
  });

  it('should wait silently when the container has no size yet', async () => {
    const fixture = TestBed.createComponent(SiremChart);
    let chart: ECharts | null = null;
    fixture.componentInstance.ready.subscribe((c) => (chart = c));
    fixture.detectChanges();
    await wait(400);
    // Sin tamaño no hay init ni errores: reintenta en silencio.
    expect(chart).toBeNull();
    mockSize(fixture);
    await wait(500);
    expect(chart).toBeTruthy();
  });

  it('should apply height and loading overlay', () => {
    const fixture = TestBed.createComponent(SiremChart);
    fixture.componentRef.setInput('height', 240);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.sirem-chart')?.getAttribute('style')).toContain('240');
    expect(el.querySelector('[role="status"]')).toBeTruthy();
  });
});
