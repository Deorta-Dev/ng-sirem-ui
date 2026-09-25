import { Component } from '@angular/core';
import {
  SiremAvatar,
  SiremBadge,
  SiremBreadcrumbs,
  SiremCard,
  SiremPageHeader,
  SiremStatCard,
  SiremTimeline,
  SiremTimelineItem,
} from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';

@Component({
  selector: 'app-page-detalle-demo-page',
  standalone: true,
  imports: [
    DemoPageLayout,
    DemoVariantCard,
    SiremAvatar,
    SiremBadge,
    SiremBreadcrumbs,
    SiremCard,
    SiremPageHeader,
    SiremStatCard,
    SiremTimeline,
  ],
  template: `
    <app-demo-page-layout title="Página: Detalle" category="Páginas" subtitle="Migas + header + KPIs + línea de tiempo.">
      <app-demo-variant-card title="Vista completa" description="Ficha de paciente." [htmlCode]="h1" [tsCode]="t">
        <div class="flex w-full flex-col gap-3">
          <sirem-breadcrumbs [items]="migas" />
          <sirem-page-header title="María Torres" subtitle="HC-2026-001 · CC 1020" />
          <div class="flex items-center gap-3">
            <sirem-avatar name="María Torres" size="lg" presence="success" />
            <sirem-badge tone="success" dot>Activa</sirem-badge>
          </div>
          <div class="grid gap-3 md:grid-cols-3">
            <sirem-stat-card label="Consultas" value="6" variant="solid" color="brand" />
            <sirem-stat-card label="Facturado" value="$1,2 M" [delta]="8.2" />
            <sirem-stat-card label="Saldo" value="$250.000" [delta]="-2.1" />
          </div>
          <sirem-card title="Atenciones recientes">
            <sirem-timeline [items]="atenciones" />
          </sirem-card>
        </div>
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class PageDetalleDemoPage {
  readonly migas = [
    { label: 'Inicio', link: '/' },
    { label: 'Pacientes', link: '/demo/page-listado' },
    { label: 'María Torres' },
  ];

  readonly atenciones: SiremTimelineItem[] = [
    { title: 'Control', description: 'RX estable.', time: '2026-09-24', tone: 'success' },
    { title: 'Examen', description: 'Agudeza visual y fondo de ojo.', time: '2026-06-10', tone: 'info' },
  ];

  readonly h1 = `<sirem-breadcrumbs [items]="migas" />
<sirem-page-header title="María Torres" subtitle="HC-2026-001 · CC 1020" />
<sirem-avatar name="María Torres" size="lg" presence="success" />
<sirem-badge tone="success" dot>Activa</sirem-badge>
<sirem-stat-card label="Consultas" value="6" variant="solid" color="brand" />
<sirem-card title="Atenciones recientes">
  <sirem-timeline [items]="atenciones" />
</sirem-card>`;
  readonly t = `import { SiremTimelineItem } from 'deorta-sirem-ui';

readonly migas = [
  { label: 'Inicio', link: '/' },
  { label: 'Pacientes', link: '/demo/page-listado' },
  { label: 'María Torres' },
];
readonly atenciones: SiremTimelineItem[] = [
  { title: 'Control', description: 'RX estable.', time: '2026-09-24', tone: 'success' },
  { title: 'Examen', description: 'Agudeza visual y fondo de ojo.', time: '2026-06-10', tone: 'info' },
];`;
}
