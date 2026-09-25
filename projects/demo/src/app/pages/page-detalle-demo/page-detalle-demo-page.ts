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
import { PageDemoShell, type DemoCodeFile } from '../../shared/page-demo-shell/page-demo-shell';

@Component({
  selector: 'app-page-detalle-demo-page',
  standalone: true,
  imports: [
    PageDemoShell,
    SiremAvatar,
    SiremBadge,
    SiremBreadcrumbs,
    SiremCard,
    SiremPageHeader,
    SiremStatCard,
    SiremTimeline,
  ],
  template: `
    <app-page-demo-shell label="Página de detalle" [files]="codeFiles">
      <main class="min-h-[calc(100dvh-2.75rem)] bg-slate-50 p-4 sm:p-6 lg:p-8 dark:bg-slate-950">
        <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
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
      </main>
    </app-page-demo-shell>
  `,
})
export class PageDetalleDemoPage {
  readonly migas = [
    { label: 'Inicio', link: '/' },
    { label: 'Pacientes', link: '/demo/page-listado' },
    { label: 'María Torres' },
  ];

  readonly atenciones: SiremTimelineItem[] = [
    {
      title: 'Control',
      description: 'RX estable.',
      time: '2026-09-24',
      tone: 'success',
    },
    {
      title: 'Examen',
      description: 'Agudeza visual y fondo de ojo.',
      time: '2026-06-10',
      tone: 'info',
    },
  ];

  readonly codeFiles: DemoCodeFile[] = [
    {
      name: 'page-detalle.html',
      language: 'html',
      code: `<main class="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
  <div class="mx-auto flex w-full max-w-screen-2xl flex-col gap-5">
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
</main>`,
    },
    {
      name: 'page-detalle.component.ts',
      language: 'typescript',
      code: `import {
  SiremTimelineItem,
  SiremBreadcrumbs,
} from 'deorta-sirem-ui';

export class PageDetallePage {
  readonly migas = [
    { label: 'Inicio', link: '/' },
    { label: 'Pacientes', link: '/patients' },
    { label: 'María Torres' },
  ];

  readonly atenciones: SiremTimelineItem[] = [
    {
      title: 'Control',
      description: 'RX estable.',
      time: '2026-09-24',
      tone: 'success',
    },
    {
      title: 'Examen',
      description: 'Agudeza visual y fondo de ojo.',
      time: '2026-06-10',
      tone: 'info',
    },
  ];
}`,
    },
  ];
}
