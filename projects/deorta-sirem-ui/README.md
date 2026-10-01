# deorta-sirem-ui

Librería Angular standalone (v21) de componentes reutilizables SIREM:
botones, iconos Flaticon UIcons, iconos duotone y registro de iconos
Streamline Ultimate Duotone. Estilos con Tailwind CSS v4.

## Consumir en otro proyecto

```bash
npm i deorta-sirem-ui @flaticon/flaticon-uicons echarts
```

```css
/* styles.css del proyecto consumidor */
@import 'tailwindcss';
@import '@flaticon/flaticon-uicons/css/regular/all.css';
@import '@flaticon/flaticon-uicons/css/bold/all.css';
@import '@flaticon/flaticon-uicons/css/solid/all.css';
@import '@flaticon/flaticon-uicons/css/brands/all.css';

@theme {
  --color-sirem-50: #eef6ff;
  --color-sirem-100: #d9eaff;
  --color-sirem-200: #bcdcff;
  --color-sirem-300: #8ec5ff;
  --color-sirem-400: #59a5ff;
  --color-sirem-500: #3384fc;
  --color-sirem-600: #1d64f1;
  --color-sirem-700: #174fe1;
  --color-sirem-800: #1943b4;
  --color-sirem-900: #1a3c8b;
}
```

### Tokens semánticos (obligatorio)

Los `.scss` de la librería **no empaquetan CSS**: consumen tokens semánticos
`--sirem-*` que tu app debe definir (o importar desde la librería). Copia este
bloque en el `styles.css` del consumidor, o importa el fichero de la librería:

```css
@import 'deorta-sirem-ui/src/lib/theme/sirem-theme.css';
```

Tokens disponibles:

| Grupo | Tokens |
|---|---|
| Superficie | `--sirem-page-bg`, `--sirem-surface`, `--sirem-surface-alt`, `--sirem-surface-hover`, `--sirem-surface-panel`, `--sirem-surface-glass`, `--sirem-surface-glass-strong` |
| Texto | `--sirem-text`, `--sirem-text-soft`, `--sirem-text-muted`, `--sirem-text-faint` |
| Borde | `--sirem-border`, `--sirem-border-soft`, `--sirem-border-strong` |
| Tintes | `--sirem-tint-bg`, `--sirem-tint-text`, `--sirem-tint-strong-bg`, `--sirem-tint-strong-text`, `--sirem-tint-{success,warning,danger,neutral}-{bg,text}` |
| Radios | `--sirem-radius-sm` (8px), `--sirem-radius-md` (12px), `--sirem-radius-lg` (16px), `--sirem-radius-xl` (18px) |
| Sombras | `--sirem-shadow-xs`, `--sirem-shadow-sm`, `--sirem-shadow-md`, `--sirem-shadow-lg` |

Todos salvo los radios tienen override en `:root[data-theme='dark']` (los radios
son independientes del tema). El modo oscuro se activa con
`document.documentElement.dataset.theme = 'dark'`.

```ts
// app.config.ts (solo si usas optionsEndpoint en sirem-input-field)
import { provideHttpClient } from '@angular/common/http';
providers: [provideHttpClient()];
```

```ts
// app.config.ts (solo si usas Streamline)
import { provideStreamlineIcons } from 'deorta-sirem-ui';
providers: [provideStreamlineIcons({ 'home-duotone': MI_SVG })];
```

```html
<sirem-button variant="primary" (pressed)="ok()">Guardar</sirem-button>
<sirem-fi-icon name="rr-user" [size]="20" />
<sirem-streamline-icon name="home-duotone" [size]="24" />
```

## Notificaciones Dynamic Toast

Las notificaciones usan [`ngx-dynamic-toast`](https://github.com/ederjavs/ngx-dynamic-toast),
una librería Angular MIT con animaciones spring, Dynamic Island y soporte de
`promise`. El paquete requiere `motion` como peer dependency.

```ts
import { DynamicToastService } from 'ngx-dynamic-toast';

private readonly toast = inject(DynamicToastService);

save() {
  this.toast.success('Cambios guardados', {
    description: 'La historia clínica se actualizó.',
  });
}
```

```ts
// app.config.ts
import { provideDynamicToast } from 'ngx-dynamic-toast';

providers: [
  provideDynamicToast({
    theme: 'dark',
    position: 'top-right',
    offset: { top: 16, right: 16 },
  }),
];
```

```html
<!-- Una vez en el layout raíz -->
<dt-viewport theme="dark" position="top-right" />
```

La librería está inspirada en [Sileo](https://sileo.aaryan.design), proyecto MIT
de Aryan Hia.

Guía de desarrollo: ver `AGENTS.md` en la raíz del repo.
Flujo Streamline Pro: ver `docs/STREAMLINE.md`.

## Publicar

```bash
ng build deorta-sirem-ui
cd dist/deorta-sirem-ui
npm publish
```

## Atribución (obligatoria al publicar apps que la usen)

- `Uicons by <a href="https://www.flaticon.com/uicons">Flaticon</a>`
- Iconos Streamline según su licencia (ver `docs/STREAMLINE.md`).
