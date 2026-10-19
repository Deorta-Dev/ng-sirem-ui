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
  /* Rampa "ink" (neutros de marca; 600 = primario tinta). */
  --color-sirem-50: #f7f8f9;
  --color-sirem-100: #eceef1;
  --color-sirem-200: #dfe2e7;
  --color-sirem-300: #c6cbd3;
  --color-sirem-400: #9aa1ac;
  --color-sirem-500: #5c636e;
  --color-sirem-600: #26272b;
  --color-sirem-700: #1c1d20;
  --color-sirem-800: #141518;
  --color-sirem-900: #0c0d0f;
  /* Acento de marca (lima) y secundario (salvia). */
  --color-sirem-accent-100: #f5ffc2;
  --color-sirem-accent-200: #eeff8f;
  --color-sirem-accent-300: #e4ff42;
  --color-sirem-accent-400: #d3f524;
  --color-sirem-accent-500: #b4d80f;
  --color-sirem-accent-ink: #1a1a1a;
  --color-sirem-sage-100: #e7f1e8;
  --color-sirem-sage-200: #cfe4d0;
  --color-sirem-sage-300: #a5d2a4;
  --color-sirem-sage-400: #8cb396;
  --color-sirem-sage-500: #5f8a72;
  --color-sirem-sage-700: #37624a;
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
| Superficie | `--sirem-page-bg`, `--sirem-surface`, `--sirem-surface-alt`, `--sirem-surface-hover`, `--sirem-surface-panel`, `--sirem-surface-glass`, `--sirem-surface-glass-strong`, `--sirem-surface-muted`, `--sirem-surface-sage`, `--sirem-surface-accent-soft` |
| Patrones | `--sirem-hatch` (rayado diagonal de disponibilidad, se adapta al tema) |
| Texto | `--sirem-text`, `--sirem-text-soft`, `--sirem-text-muted`, `--sirem-text-faint` |
| Borde | `--sirem-border`, `--sirem-border-soft`, `--sirem-border-strong` |
| Primario | `--sirem-primary`, `--sirem-primary-hover`, `--sirem-primary-active`, `--sirem-primary-text`, `--sirem-focus-ring`, `--sirem-control-accent` (tinta en claro, lima en oscuro) |
| Acento | `--sirem-accent`, `--sirem-accent-strong`, `--sirem-accent-ink`, `--sirem-accent-tint-bg`, `--sirem-accent-tint-text`, `--sirem-sage` |
| Tintes | `--sirem-tint-bg`, `--sirem-tint-text`, `--sirem-tint-strong-bg`, `--sirem-tint-strong-text`, `--sirem-tint-{success,warning,danger,neutral}-{bg,text}` |
| Radios | Contenedores `--sirem-radius-lg` (24px); interiores `--sirem-radius-md` (16px); redondos `--sirem-radius-pill`. `sm`/`xl`/`2xl` quedan en la escala para el consumidor, la librería no los usa (ver «Radios» en AGENTS.md §10) |
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
