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
