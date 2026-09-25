import { Component, signal } from '@angular/core';
import { SiremCodeEditor } from 'deorta-sirem-ui';
import { DemoVariantCard } from '../../shared/demo-variant-card/demo-variant-card';
import { DemoPageLayout } from '../../shared/demo-page-layout/demo-page-layout';
import { themeMode } from '../../shared/theme/theme';

@Component({
  selector: 'app-code-editor-demo-page',
  standalone: true,
  imports: [DemoPageLayout, DemoVariantCard, SiremCodeEditor],
  template: `
    <app-demo-page-layout title="Code Editor" category="Formularios" subtitle="sirem-code-editor — CodeMirror editable que sigue el tema (prueba el ☀/☾ del header).">
      <app-demo-variant-card title="TypeScript + tema" description="dark sigue el theme global." [htmlCode]="h1" [tsCode]="t">
        <sirem-code-editor label="Fórmula" language="typescript" [(code)]="ts" [dark]="isDark()" [height]="200" />
      </app-demo-variant-card>
      <app-demo-variant-card title="HTML" description="Resaltado web." [htmlCode]="h2" [tsCode]="t">
        <sirem-code-editor language="html" [(code)]="html" [dark]="isDark()" [height]="160" />
      </app-demo-variant-card>
      <app-demo-variant-card title="JSON solo lectura" description="Para ver payloads." [htmlCode]="h3" [tsCode]="t">
        <sirem-code-editor language="json" [(code)]="payload" [dark]="isDark()" [readonly]="true" [height]="160" />
      </app-demo-variant-card>
    </app-demo-page-layout>
  `,
})
export class CodeEditorDemoPage {
  readonly ts = signal('const esferaOD = -1.25;\nconst cilindroOD = -0.5;\n\nfunction diagnostico() {\n  return "H52.1 Miopía";\n}');
  readonly html = signal('<sirem-badge tone="success">Activa</sirem-badge>');
  readonly payload = signal('{\n  "paciente": "María Torres",\n  "estado": "activa"\n}');
  isDark() {
    return themeMode() === 'dark';
  }
  readonly h1 = '<sirem-code-editor label="Fórmula" language="typescript"\n  [(code)]="ts" [dark]="isDark()" [height]="200" />';
  readonly h2 = '<sirem-code-editor language="html" [(code)]="html"\n  [dark]="isDark()" [height]="160" />';
  readonly h3 = '<sirem-code-editor language="json" [(code)]="payload"\n  [dark]="isDark()" [readonly]="true" [height]="160" />';
  readonly t = `import { signal } from '@angular/core';
import { SiremCodeEditor } from 'deorta-sirem-ui';
import { themeMode } from '../../shared/theme/theme';

readonly ts = signal('const esferaOD = -1.25;\\nconst cilindroOD = -0.5;\\n\\nfunction diagnostico() {\\n  return "H52.1 Miopía";\\n}');
readonly html = signal('<sirem-badge tone="success">Activa</sirem-badge>');
readonly payload = signal('{\\n  "paciente": "María Torres",\\n  "estado": "activa"\\n}');

isDark() { return themeMode() === 'dark'; }`;
}
