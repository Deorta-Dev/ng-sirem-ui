# @deorta-dev/ng-sirem-ui

**SIREM Angular component library** · 🇪🇸 [Versión en español](./README.es.md)

**Angular 21 standalone** component library built with **Tailwind CSS v4**, Flaticon UIcons, duotone icons (Phosphor) and a registry for Streamline Ultimate Duotone icons. Light/dark theming is driven by design tokens, and every component ships with a live demo page (`npm start`).

🌐 **Live demo:** https://deorta-dev.github.io/ng-sirem-ui/

## Install

### Using it in another project

The library ships no CSS: the consuming app defines the SIREM tokens. Minimal `styles.css`:

```bash
npm i @deorta-dev/ng-sirem-ui @flaticon/flaticon-uicons echarts
```

```css
/* consuming app: styles.css */
@import 'tailwindcss';
@import '@flaticon/flaticon-uicons/css/regular/all.css';
@import '@flaticon/flaticon-uicons/css/bold/all.css';
@import '@flaticon/flaticon-uicons/css/solid/all.css';
@import '@flaticon/flaticon-uicons/css/brands/all.css';
@import '@deorta-dev/ng-sirem-ui/src/lib/theme/sirem-theme.css';
```

```ts
// app.config.ts — only if you use optionsEndpoint (remote options)
import { provideHttpClient } from '@angular/common/http';
providers: [provideHttpClient()];
```

### Semantic tokens

Library styles use **only** `--sirem-*` tokens. The shortest way to get them all (including the dark overrides) is importing the theme file:

```css
@import '@deorta-dev/ng-sirem-ui/src/lib/theme/sirem-theme.css';
```

### Dark mode

Enabled with `document.documentElement.dataset.theme = 'dark'` (`light` by default). Every `--sirem-*` token is overridden under `:root[data-theme='dark']`; radii do not depend on the theme.

## API reference

Every documented member of every artifact: type, default value, what it is for, accepted values and what each output emits. The schemas, types and interfaces each artifact uses are listed underneath.

### Contents

- **Components**
    - [`SiremAdminLayout`](#siremadminlayout)
    - [`SiremAgenda`](#siremagenda)
    - [`SiremAvatar`](#siremavatar)
    - [`SiremBadge`](#sirembadge)
    - [`SiremBreadcrumbs`](#sirembreadcrumbs)
    - [`SiremButton`](#sirembutton)
    - [`SiremCalendar`](#siremcalendar)
    - [`SiremCard`](#siremcard)
    - [`SiremCardList`](#siremcardlist)
    - [`SiremChart`](#siremchart)
    - [`SiremCheckbox`](#siremcheckbox)
    - [`SiremCodeEditor`](#siremcodeeditor)
    - [`SiremCollapsible`](#siremcollapsible)
    - [`SiremCollapsibleGroup`](#siremcollapsiblegroup)
    - [`SiremConfirmDialog`](#siremconfirmdialog)
    - [`SiremDataTable`](#siremdatatable)
    - [`SiremDate`](#siremdate)
    - [`SiremDateChip`](#siremdatechip)
    - [`SiremDatepicker`](#siremdatepicker)
    - [`SiremDrawer`](#siremdrawer)
    - [`SiremDuotoneIcon`](#siremduotoneicon)
    - [`SiremDynamicForm`](#siremdynamicform)
    - [`SiremEmptyState`](#sirememptystate)
    - [`SiremFiIcon`](#siremfiicon)
    - [`SiremFieldGroup`](#siremfieldgroup)
    - [`SiremImageUpload`](#siremimageupload)
    - [`SiremInput`](#sireminput)
    - [`SiremInvoiceEditor`](#sireminvoiceeditor)
    - [`SiremList`](#siremlist)
    - [`SiremModal`](#siremmodal)
    - [`SiremMultiSelect`](#siremmultiselect)
    - [`SiremNavbar`](#siremnavbar)
    - [`SiremOverlayViewport`](#siremoverlayviewport)
    - [`SiremPageHeader`](#sirempageheader)
    - [`SiremPopupCard`](#sirempopupcard)
    - [`SiremRadioGroup`](#siremradiogroup)
    - [`SiremRichText`](#siremrichtext)
    - [`SiremSearchField`](#siremsearchfield)
    - [`SiremSearchPalette`](#siremsearchpalette)
    - [`SiremSegmented`](#siremsegmented)
    - [`SiremSelect`](#siremselect)
    - [`SiremSheet`](#siremsheet)
    - [`SiremSidebar`](#siremsidebar)
    - [`SiremSparkline`](#siremsparkline)
    - [`SiremStatCard`](#siremstatcard)
    - [`SiremStreamlineIcon`](#siremstreamlineicon)
    - [`SiremSwitch`](#siremswitch)
    - [`SiremTextarea`](#siremtextarea)
    - [`SiremTimeline`](#siremtimeline)
    - [`SiremTopbar`](#siremtopbar)
    - [`SiremUserMenu`](#siremusermenu)
- **Directives**
    - [`SiremAutofocusDirective`](#siremautofocusdirective)
    - [`SiremClickOutsideDirective`](#siremclickoutsidedirective)
    - [`SiremNumbersOnlyDirective`](#siremnumbersonlydirective)
    - [`SiremOverlayTrigger`](#siremoverlaytrigger)
    - [`SiremSticky`](#siremsticky)
    - [`SiremTooltipDirective`](#siremtooltipdirective)
- **Pipes**
    - [`SiremAgePipe`](#siremagepipe)
    - [`SiremMoneyPipe`](#siremmoneypipe)
    - [`SiremPhonePipe`](#siremphonepipe)

## Components

Standalone components with a `sirem-*` selector.

### `SiremAdminLayout`

Selector: `sirem-admin-layout`

Master container of the authenticated app (equivalent to `lo-admin-layout`)…

#### Inputs

- **`fullscreen`** · `boolean` · _default `false`_
    Hides the chrome (sidebar, topbar, navbar) to fill the window; two-way.
- **`mainPadding`** · `'none' | 'sm' | 'md'` · _default `'md'`_
    Content area padding: `md` (default), `sm` or `none` for full-bleed content (the facade manages its own padding).
    - **Values:**
      - `none` — No padding: the content is full bleed.
      - `sm` — Short padding.
      - `md` — Base padding. This is the default value.
- **`mainInsetLeft`** · `string | null`
    Left offset of the main when the sidebar is out of flow (`pinned`/fixed, e.g. `15.75rem` = margin + floating rail width or `4.75rem` collapsed). This way the header and content start where the navbar ends. Only applies on desktop; on mobile the sidebar is an off-canvas drawer and the main does not shift.

### `SiremAgenda`

Selector: `sirem-agenda` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/agenda)

Google Calendar-style multi-view agenda (`sirem-agenda`).

#### Inputs

- **`events`** · `SiremAgendaEvent[]` · _default `[]`_
    Agenda events.
- **`mode`** · `SiremAgendaMode` · _default `'week'`_
    Active view (two-way).
    - **Values:**
      - `day` — One day, with the hours in columns.
      - `week` — The full week, with all 7 days.
      - `month` — Month grid.
      - `list` — Chronological list without grid.
- **`date`** · `Date` · _default `new Date()`_
    Focused day (two-way); governs the visible week and month.
- **`modes`** · `SiremAgendaMode[]` · _default `['day', 'week', 'month', 'list']`_
    Views offered; the order is that of the picker.
- **`locale`** · `string` · _default `'es-ES'`_
    Language of the labels.
- **`weekStartsOn`** · `0 | 1` · _default `1`_
    First day of the week (`1` = Monday).
- **`startHour`** · `number` · _default `7`_
    First visible hour of the grid.
- **`endHour`** · `number` · _default `21`_
    Grid end hour (exclusive).
- **`hourHeight`** · `number` · _default `64`_
    Height in px of each hour cell (1 h of the grid).
- **`maxPerDay`** · `number` · _default `2`_
    Events shown per day in the month before «+N more».
- **`listDays`** · `number` · _default `30`_
    Days covered by the list view.
- **`now`** · `Date | null`
    Fixed clock (tests and screenshots); `null` uses the real time.
- **`responsive`** · `boolean` · _default `true`_
    Adapts views and density to the container width.
- **`sticky`** · `SiremAgendaSticky` · _default `'none'`_
    Which headers stick when the page scrolls.
    - **Values:**
      - `none` — Nothing fixed on scroll.
      - `toolbar` — The toolbar stays fixed.
      - `days` — The days row stays fixed.
      - `both` — Bar and days stay fixed.
- **`stickyOffset`** · `string` · _default `'0px'`_
    Spacing from the top edge, in any CSS unit (`'4rem'`).
- **`stickyGap`** · `number` · _default `0`_
    Extra spacing in px between the two sticky headers.
- **`toolbarBackground`** · `string` · _default `''`_
    Bar background at rest (any CSS color).
- **`toolbarBackgroundStuck`** · `string` · _default `''`_
    Background of the stuck bar; if missing, it uses `toolbarBackground`.
- **`toolbarBlur`** · `number | null`
    Background blur of the bar at rest, in px (`null` = none).
- **`toolbarBlurStuck`** · `number | null`
    Blur of the sticky bar; `null` inherits `toolbarBlur`.
- **`toolbarStickyHeight`** · `number` · _default `0`_
    Height of the bar while it is stuck, in px (`0` = natural height).
- **`daysBackground`** · `string` · _default `''`_
    Background of the days row at rest (any CSS color).
- **`daysBackgroundStuck`** · `string` · _default `''`_
    Background of the stuck days row; if missing, it uses `daysBackground`.
- **`daysBlur`** · `number | null`
    Background blur of the days row at rest, in px.
- **`daysBlurStuck`** · `number | null`
    Blur of the sticky days row; `null` inherits `daysBlur`.
- **`daysStickyHeight`** · `number` · _default `0`_
    Height of the days row while it is stuck, in px (`0` = natural).

#### Outputs

- **`eventPressed`** · `SiremAgendaEvent`
    Pressed event (original, unnormalized).
    - **Returns:**
      - `id?` · `string | number` — Stable identifier; if missing, the position in the array is used.
      - `title` · `string` — Visible title.
      - `start` · `Date | string` — Start (`Date` or ISO text).
      - `end?` · `Date | string` — End (`Date` or ISO text). Without an end it lasts 30 minutes.
      - `allDay?` · `boolean` — Takes the whole day and goes to the top lane.
      - `tone?` · `SiremAgendaTone` — Semantic color; `brand` by default.
      - `location?` · `string` — Place or room, on the second line.
      - `meta?` · `string` — Short label on the right (professional, status…).
- **`slotPressed`** · `SiremAgendaSlot`
    Pressed grid slot.
    - **Returns:**
      - `date` · `Date` — Slot day.
      - `hour` · `number` — Hour (0–23).
      - `minute` · `number` — Minute (0–59).
- **`dayPressed`** · `Date`
    Day chosen by the user.
    - **Returns:** Pressed day, at local midnight.

#### Types & schemas

- **`SiremAgendaEvent`** · _interface_
    Agenda event.
    - **Fields:**
        - `id?` · `string | number` — Stable identifier; if missing, the position in the array is used.
        - `title` · `string` — Visible title.
        - `start` · `Date | string` — Start (`Date` or ISO text).
        - `end?` · `Date | string` — End (`Date` or ISO text). Without an end it lasts 30 minutes.
        - `allDay?` · `boolean` — Takes the whole day and goes to the top lane.
        - `tone?` · `SiremAgendaTone` — Semantic color; `brand` by default.
        - `location?` · `string` — Place or room, on the second line.
        - `meta?` · `string` — Short label on the right (professional, status…).
- **`SiremAgendaMode`** · _union_
    Agenda views.
    - **Definition:** `'day' | 'week' | 'month' | 'list'`
    - `day` — One day, with the hours in columns.
    - `week` — The full week, with all 7 days.
    - `month` — Month grid.
    - `list` — Chronological list without grid.
- **`SiremAgendaSticky`** · _union_
    Headers that stay stuck (`position: sticky`) when scrolling. - `toolbar`: the navigation bar (title + view selector). - `days`: the days/week row or the list group header. - `both`: both, stacked (the second under the first).
    - **Definition:** `'none' | 'toolbar' | 'days' | 'both'`
    - `none` — Nothing fixed on scroll.
    - `toolbar` — The toolbar stays fixed.
    - `days` — The days row stays fixed.
    - `both` — Bar and days stay fixed.
- **`SiremAgendaTone`** · _union_
    Color semantics of an event.
    - **Definition:** `'brand' | 'sage' | 'accent' | 'success' | 'warning' | 'danger' | 'muted'`
    - `brand`
    - `sage`
    - `accent`
    - `success`
    - `warning`
    - `danger`
    - `muted`
- **`SiremAgendaSlot`** · _interface_
    Pressed slot in the hourly grid.
    - **Fields:**
        - `date` · `Date` — Slot day.
        - `hour` · `number` — Hour (0–23).
        - `minute` · `number` — Minute (0–59).

### `SiremAvatar`

Selector: `sirem-avatar` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/avatar)

Avatar with image or initials + presence/status dot. (Lists of patients, third parties, users.)

#### Inputs

- **`name`** · `string` · _default `''`_
    Person's name; source of the initials.
- **`src`** · `string | null`
    Photo URL. If missing or the load fails, the initials are shown.
- **`size`** · `SiremAvatarSize` · _default `'md'`_
    Size: `xs`, `sm`, `md` or `lg`.
    - **Values:**
      - `xs` — Very small, 1.5 rem. For dense lists.
      - `sm` — Small, 2 rem. For table rows.
      - `md` — Base, 2.5 rem. It is the default value.
      - `lg` — Large, 3.5 rem. For profile chips.
- **`presence`** · `SiremPresenceTone`
    Status dot (`success`, `warning`, `danger`, `neutral`); `null` hides it.
    - **Values:**
      - `success` — Online or available.
      - `warning` — Busy or with a warning.
      - `danger` — Absent or unavailable.
      - `neutral` — No semantics (unknown status).
      - `null` — No status dot. It is the default value.
- **`label`** · `string | null`
    Accessible name when the initials are not enough.

#### Types & schemas

- **`SiremAvatarSize`** · _union_
    Avatar size.
    - **Definition:** `'xs' | 'sm' | 'md' | 'lg'`
    - `xs` — Very small, 1.5 rem. For dense lists.
    - `sm` — Small, 2 rem. For table rows.
    - `md` — Base, 2.5 rem. It is the default value.
    - `lg` — Large, 3.5 rem. For profile chips.
- **`SiremPresenceTone`** · _union_
    Presence dot color (user status).
    - **Definition:** `'success' | 'warning' | 'danger' | 'neutral' | null`
    - `success` — Online or available.
    - `warning` — Busy or with a warning.
    - `danger` — Absent or unavailable.
    - `neutral` — No semantics (unknown status).
    - `null` — No status dot. It is the default value.

### `SiremBadge`

Selector: `sirem-badge` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/badge)

Status pill (last visit, CUFE/DIAN status, appointment status, Xubio sync…). With or without a dot.

#### Inputs

- **`tone`** · `SiremBadgeTone` · _default `'neutral'`_
    Color semantics: `neutral`, `info`, `accent`, `success`, `warning` or `danger`.
    - **Values:**
      - `neutral` — No color semantics. For informative labels.
      - `info` — Informative, with brand blue tint.
      - `accent` — Brand accent (lime). It stands out without state semantics.
      - `success` — Correct or confirmed.
      - `warning` — Pending or with attention.
      - `danger` — Error, expired or blocked.
- **`dot`** · `boolean` · _default `false`_
    Adds a colored dot to the left of the text.
- **`label`** · `string | null`
    Accessible name when the badge's own text is not enough.

#### Types & schemas

- **`SiremBadgeTone`** · _union_
    Color semantics of the badge.
    - **Definition:** `'neutral' | 'info' | 'accent' | 'success' | 'warning' | 'danger'`
    - `neutral` — No color semantics. For informative labels.
    - `info` — Informative, with brand blue tint.
    - `accent` — Brand accent (lime). It stands out without state semantics.
    - `success` — Correct or confirmed.
    - `warning` — Pending or with attention.
    - `danger` — Error, expired or blocked.

### `SiremBreadcrumbs`

Selector: `sirem-breadcrumbs` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/breadcrumbs)

Hierarchical location (e.g. Home › Clinic › Patients).

#### Inputs

- **`items`** · `SiremCrumb[]` · _required_
    Breadcrumbs to show; the last one is rendered as the current page.

#### Types & schemas

- **`SiremCrumb`** · _interface_
    Breadcrumb level. Missing `link` = current level (not clickable).
    - **Fields:**
        - `label` · `string`
        - `link?` · `string | any[]`

### `SiremButton`

Selector: `sirem-button` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/button)

Base button of the SIREM design system (Bento aesthetic: fully rounded corner pills, diffuse shadows and color semantics; compact scale: the md size is h-10 (40px) like the fields)…

#### Inputs

- **`variant`** · `SiremButtonVariant` · _default `'primary'`_
    Visual style: `primary`, `secondary`, `success`, `warning`, `ghost` or `danger`.
    - **Values:**
      - `primary` — Primary action. Brand background with the theme contrast text.
      - `accent` — Brand accent (lime). Highlighted action without being the primary one.
      - `secondary` — Secondary action. Surface background with border.
      - `success` — Confirmation or successful result.
      - `warning` — Warning or state that requires attention.
      - `ghost` — No background or border; it only gains a background on hover.
      - `danger` — Destructive or error action.
- **`size`** · `SiremButtonSize` · _default `'md'`_
    Size: `sm` (2 rem), `md` (2.5 rem, same as the fields) or `lg` (3 rem).
    - **Values:**
      - `sm` — Compact, 2rem high. For bars, headers and tables.
      - `md` — Base, 2.5rem. As high as the form fields.
      - `lg` — Large, 3rem. For highlighted actions.
- **`disabled`** · `boolean` · _default `false`_
    Blocks the button: it does not emit `pressed` nor run `action`.
- **`action`** · `SiremButtonAction | null`
    Action to run on click (may return an Observable/Promise).
- **`iconOnly`** · `boolean` · _default `false`_
    Icon only (square button with no label). Requires `aria-label`.
- **`loading`** · `boolean` · _default `false`_
    Progress state; managed by `action` or controlled from outside.
- **`bordered`** · `boolean` · _default `true`_
    Draws the border (default). `false` suppresses it without changing the rest.

#### Outputs

- **`pressed`** · `void`
    Emitted on press, before resolving `action`.
    - **Returns:** Emits no data: the event carries no payload.
- **`finished`** · `unknown`
    Last value emitted when `action` completes successfully.
    - **Returns:** Value returned by `action` when it completes.
- **`failed`** · `unknown`
    Error emitted if `action` fails.
    - **Returns:** Error with which `action` fails.

#### Types & schemas

- **`SiremButtonVariant`** · _union_
    Visual style of the button (color semantics).
    - **Definition:** `'primary' | 'accent' | 'secondary' | 'success' | 'warning' | 'ghost' | 'danger'`
    - `primary` — Primary action. Brand background with the theme contrast text.
    - `accent` — Brand accent (lime). Highlighted action without being the primary one.
    - `secondary` — Secondary action. Surface background with border.
    - `success` — Confirmation or successful result.
    - `warning` — Warning or state that requires attention.
    - `ghost` — No background or border; it only gains a background on hover.
    - `danger` — Destructive or error action.
- **`SiremButtonSize`** · _union_
    Button size; `md` matches the height of the fields.
    - **Definition:** `'sm' | 'md' | 'lg'`
    - `sm` — Compact, 2rem high. For bars, headers and tables.
    - `md` — Base, 2.5rem. As high as the form fields.
    - `lg` — Large, 3rem. For highlighted actions.
- **`SiremButtonAction`** · _alias_
    Async action of the button: it runs on click and the button shows the progress state until it finishes.
    - **Definition:** `() => Observable<unknown> | Promise<unknown> | void`

### `SiremCalendar`

Selector: `sirem-calendar` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/calendar)

Single monthly schedule calendar (`ScheduleListComponent`) with three sizes: - `small`: compact for popups (e.g. `sirem-date-field`) and dense views. - `medium`: normal view with status dots per day…

#### Inputs

- **`events`** · `SiremCalendarEvent[]` · _default `[]`_
    Events to render (ISO date, label and color).
- **`legend`** · `unknown`
    Status → color legend (e.g. Confirmada, Pendiente, Cancelada).
- **`size`** · `SiremCalendarSize` · _default `'medium'`_
    Size: small (popups), medium (normal), large (Google Calendar style).
    - **Values:**
      - `small` — Compact, for popups and cards.
      - `medium` — Base, like a desktop calendar.
      - `large` — Large, Google Calendar style.
- **`variant`** · `SiremCalendarVariant` · _default `'card'`_
    Visual variant: `card` (default, with frame and header) or `plain` (no frame or background, days in a circle, for a coloured card).
    - **Values:**
      - `card` — With frame, background and header. This is the default value.
      - `plain` — No frame or background, with the days in a circle.
- **`stripedDays`** · `string[]` · _default `[]`_
    Unavailable days (`yyyy-MM-dd`): rendered with the hatched pattern (`--sirem-hatch`), like the Bento dashboard reference.
- **`selected`** · `string | null`
    Selected day in ISO.

#### Outputs

- **`dayPressed`** · `string`
    Emitted with the ISO date of the clicked day.
    - **Returns:** ISO date `yyyy-MM-dd` of the pressed day.

#### Types & schemas

- **`SiremCalendarEvent`** · _interface_
    Agenda event. `color` accepts any CSS color (e.g. `#26272b`).
    - **Fields:**
        - `date` · `string` — Day in ISO `yyyy-MM-dd`.
        - `label` · `string`
        - `color?` · `string`
- **`SiremCalendarSize`** · _union_
    Day in ISO `yyyy-MM-dd`.
    - **Definition:** `'small' | 'medium' | 'large'`
    - `small` — Compact, for popups and cards.
    - `medium` — Base, like a desktop calendar.
    - `large` — Large, Google Calendar style.
- **`SiremCalendarVariant`** · _union_
    Visual variant of the calendar.
    - **Definition:** `'card' | 'plain'`
    - `card` — With frame, background and header. This is the default value.
    - `plain` — No frame or background, with the days in a circle.

### `SiremCard`

Selector: `sirem-card` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/card)

Generic container card (patient records, inventory cards, settings panels…). Optional header + projected content.

#### Inputs

- **`title`** · `string` · _default `''`_
    Header title. Without `title` or `subtitle` the header is not rendered.
- **`subtitle`** · `string` · _default `''`_
    Secondary line under the title.
- **`surface`** · `SiremSurface` · _default `'solid'`_
    Solid surface (default) or dashboard-style translucent.
    - **Values:**
      - `solid` — Opaque surface.
      - `glass` — Translucent surface with blur.
- **`tone`** · `'default' | 'brand' | 'sage' | 'accent' | 'muted'` · _default `'default'`_
    Card tone: - `brand`: brand color with light text (featured banners). - `sage`: sage tint, for secondary dashboard blocks. - `accent`: soft lime tint, for the hero block. - `muted`: panel grey, for neutral data.
    - **Values:**
      - `default` — Normal surface. It is the default value.
      - `brand` — Brand color with contrast text.
      - `sage` — Sage tint, for secondary blocks.
      - `accent` — Soft lime tint, for the hero block.
      - `muted` — Panel gray, for neutral data.
- **`padding`** · `SiremCardPadding` · _default `'md'`_
    Padding shortcut for `body` and `footer`. Use `none` for content that touches the edges (tables, images, maps).
    - **Values:**
      - `none` — No padding. For tables, images or maps that touch the edge.
      - `sm` — Short padding, 0.75rem / 1rem. For headers and footers.
      - `md` — Base padding, 1rem / 1.25rem. This is the default value.
      - `lg` — Wide padding, 1.5rem / 2rem. For little content and plenty of white space.
- **`headerPadding`** · `SiremCardPadding` · _default `'sm'`_
    Header padding. Default `sm`.
    - **Values:**
      - `none` — No padding. For tables, images or maps that touch the edge.
      - `sm` — Short padding, 0.75rem / 1rem. For headers and footers.
      - `md` — Base padding, 1rem / 1.25rem. This is the default value.
      - `lg` — Wide padding, 1.5rem / 2rem. For little content and plenty of white space.
- **`bodyPadding`** · `SiremCardPadding | null`
    Body padding; if `null` it inherits `padding`.
- **`footerPadding`** · `SiremCardPadding | null`
    Footer padding; if `null` it inherits `padding`.
- **`showHeader`** · `boolean` · _default `true`_
    Shows the header if there is a title or subtitle.
- **`showFooter`** · `boolean` · _default `true`_
    Shows the footer. If nothing is projected into `slot="footer"`, the footer is hidden by CSS (`:empty`), so it adds no phantom padding.

#### Types & schemas

- **`SiremCardPadding`** · _union_
    Padding scale of each card area.
    - **Definition:** `'none' | 'sm' | 'md' | 'lg'`
    - `none` — No padding. For tables, images or maps that touch the edge.
    - `sm` — Short padding, 0.75rem / 1rem. For headers and footers.
    - `md` — Base padding, 1rem / 1.25rem. This is the default value.
    - `lg` — Wide padding, 1.5rem / 2rem. For little content and plenty of white space.

### `SiremCardList`

Selector: `sirem-card-list` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/card-list)

Card list: visual alternative to the table for records with several data points (patients, invoices, equipment…). Usage:

#### Inputs

- **`items`** · `Record<string, unknown>[]` · _required_
    Rows to display; each object is rendered as a card.
- **`titleKey`** · `string` · _default `'title'`_
    Key of the title of each card.
- **`subtitleKey`** · `string | null`
    Key whose value is rendered as the card subtitle.
- **`badgeKey`** · `string | null`
    Key whose value is rendered as a badge in the corner.
- **`badgeTones`** · `Record<string, SiremBadgeTone>`
    Badge color according to its value (e.g. `{ Activo: 'success' }`).
- **`avatarKey`** · `string | null`
    Key with the name (or `{ name, src }`) for the avatar.
- **`fields`** · `SiremCardListField[]` · _default `[]`_
    Extra rows key → value.
- **`minWidth`** · `string` · _default `'17rem'`_
    Minimum width of each card (it defines the columns).
- **`rowClickable`** · `boolean` · _default `true`_
    Makes cards clickable (cursor, focus and emission of `itemPressed`).
- **`selectable`** · `boolean` · _default `false`_
    Adds a checkbox per card for multiple selection.
- **`selection`** · `number[]` · _default `[]`_
    Selected indices.
- **`emptyText`** · `string` · _default `'Sin registros.'`_
    Text shown when `items` is empty.

#### Outputs

- **`itemPressed`** · `Record<string, unknown>`
    Emitted with the clicked row (with `rowClickable`).
    - **Returns:** Object of the clicked row, as-is (its keys).

#### Types & schemas

- **`SiremBadgeTone`** · _union_
    Color semantics of the badge.
    - **Definition:** `'neutral' | 'info' | 'accent' | 'success' | 'warning' | 'danger'`
    - `neutral` — No color semantics. For informative labels.
    - `info` — Informative, with brand blue tint.
    - `accent` — Brand accent (lime). It stands out without state semantics.
    - `success` — Correct or confirmed.
    - `warning` — Pending or with attention.
    - `danger` — Error, expired or blocked.
- **`SiremCardListField`** · _interface_
    Extra field of the card (key → value rows).
    - **Fields:**
        - `key` · `string`
        - `label?` · `string`
        - `icon?` · `string` — CSS class of the icon (e.g. `fi fi-rr-phone`).

### `SiremChart`

Selector: `sirem-chart` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/chart)

Statistical chart with Apache ECharts (simple bars, multiple series, donut…). It takes the ECharts option as-is, so it serves simple and compound cases without changing component…

#### Inputs

- **`option`** · `EChartsCoreOption`
    Full ECharts option (title, axes, series…).
- **`height`** · `number | string` · _default `320`_
    Height: number in px (320 by default) or CSS length (`'100%'`).
- **`loading`** · `boolean` · _default `false`_
    Loading layer over the chart.
- **`dark`** · `boolean` · _default `false`_
    Built-in ECharts dark theme.
- **`renderer`** · `'canvas' | 'svg'` · _default `'svg'`_
    Renderer: svg (sharp, test-friendly) or canvas (thousands of points).
    - **Values:**
      - `svg` — Sharp at any zoom and readable in tests. It is the default value.
      - `canvas` — Better with thousands of points, at the cost of sharpness.

#### Outputs

- **`ready`** · `ECharts`
    Emits the ECharts instance once the chart is initialized.
    - **Returns:** ECharts instance (`setOption`, `resize`, `dispose`…).

### `SiremCheckbox`

Selector: `sirem-checkbox-field` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/checkbox)

Checkbox with label and optional description.

#### Inputs

- **`checked`** · `boolean` · _default `false`_
    Checked state, with two-way binding.
- **`label`** · `string` · _default `''`_
    Text of the checkbox.
- **`description`** · `string` · _default `''`_
    Secondary line under the label.
- **`required`** · `boolean` · _default `false`_
    Marks the field as required (`aria-required` and visual indicator).
- **`disabled`** · `boolean` · _default `false`_
    Disables the checkbox: it cannot be checked or focused.

### `SiremCodeEditor`

Selector: `sirem-code-editor` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/code-editor)

Code editor with CodeMirror 6. Follows the theme with `dark` (same as `sirem-chart`): light by default, One Dark in dark. Usage:

#### Inputs

- **`code`** · `string` · _default `''`_
    Source code (two-way).
- **`language`** · `SiremCodeLanguage` · _default `'typescript'`_
    Highlighted language: `html`, `typescript`, `javascript`, `json` or `css`.
    - **Values:**
      - `html` — HTML markup (useful for component examples).
      - `typescript` — TypeScript. It is the default value.
      - `javascript` — JavaScript.
      - `json` — JSON, with collapsible keys.
      - `css` — Style sheets.
- **`label`** · `string` · _default `''`_
    Label visible above the editor.
- **`hint`** · `string` · _default `''`_
    Help note under the editor.
- **`dark`** · `boolean` · _default `false`_
    One Dark dark theme; in light it uses the base CodeMirror theme.
- **`readonly`** · `boolean` · _default `false`_
    Read only: it can be selected and copied, but not edited.
- **`height`** · `number` · _default `240`_
    Height of the editor in px.

#### Types & schemas

- **`SiremCodeLanguage`** · _union_
    Language used to highlight the code.
    - **Definition:** `'html' | 'typescript' | 'javascript' | 'json' | 'css'`
    - `html` — HTML markup (useful for component examples).
    - `typescript` — TypeScript. It is the default value.
    - `javascript` — JavaScript.
    - `json` — JSON, with collapsible keys.
    - `css` — Style sheets.

### `SiremCollapsible`

Selector: `sirem-collapsible` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/collapsible)

Collapsible section with clickable header and projected content. - `variant="card"` (default) draws the Bento frame: border, radius and shadow. `variant="plain"` leaves only the header and the content, with no frame…

#### Inputs

- **`title`** · `string` · _required_
    Header text.
- **`subtitle`** · `string | null`
    Secondary line under the title.
- **`icon`** · `string | null`
    Icon CSS class (e.g. `fi fi-rr-user`).
- **`open`** · `boolean` · _default `false`_
    Open state (two-way).
- **`variant`** · `SiremCollapsibleVariant` · _default `'card'`_
    With card frame (`card`) or without it (`plain`).
    - **Values:**
      - `card` — With frame, card background and divided header.
      - `plain` — No frame: only the header and the body.
- **`background`** · `boolean` · _default `true`_
    Own surface; `false` leaves the body transparent.
- **`disabled`** · `boolean` · _default `false`_
    Blocks opening and closing the section.

#### Outputs

- **`opened`** · `void`
    Emitted when it opens.
    - **Returns:** Emits no data: the event carries no payload.
- **`closed`** · `void`
    Emitted when it closes.
    - **Returns:** Emits no data: the event carries no payload.

#### Types & schemas

- **`SiremCollapsibleVariant`** · _union_
    Visual frame of the collapsible section.
    - **Definition:** `'card' | 'plain'`
    - `card` — With frame, card background and divided header.
    - `plain` — No frame: only the header and the body.

### `SiremCollapsibleGroup`

Selector: `sirem-collapsible-group` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/collapsible)

Grouper of `sirem-collapsible` sections. - With `[accordion]="true"` (default) only **one section stays open**: opening one, the group closes the others…

#### Inputs

- **`accordion`** · `boolean` · _default `true`_
    Only one section open at a time (accordion behavior).

### `SiremConfirmDialog`

Selector: `sirem-confirm-dialog` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/confirm-dialog)

Yes/no confirmation dialog (equivalent to `BoolModalFormDynamicComponent`): delete patient, void invoice, confirm bulk send… Usage:

#### Inputs

- **`open`** · `boolean` · _default `false`_
    Controls the visibility of the dialog, with two-way binding.
- **`title`** · `string` · _default `'Confirmar acción'`_
    Dialog title.
- **`message`** · `string` · _default `'¿Deseas continuar?'`_
    Main question.
- **`detail`** · `string` · _default `''`_
    Clarification or consequence below the message; empty hides it.
- **`confirmLabel`** · `string` · _default `'Confirmar'`_
    Confirmation button text.
- **`cancelLabel`** · `string` · _default `'Cancelar'`_
    Text of the cancel button.
- **`variant`** · `'primary' | 'danger'` · _default `'primary'`_
    Style of the main button: `primary` or `danger`.
    - **Values:**
      - `primary` — Primary action. It is the default value.
      - `danger` — Destructive action, in red.

#### Outputs

- **`confirmed`** · `void`
    Emitted on confirm; the dialog closes.
    - **Returns:** Emits no data: the event carries no payload.
- **`cancelled`** · `void`
    Emitted on cancel or close without confirming.
    - **Returns:** Emits no data: the event carries no payload.

### `SiremDataTable`

Selector: `sirem-data-table` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/data-table)

Standardized listing table (patients, third parties, invoices, products, amortizations…). Sortable, with optional selection, horizontal scroll on mobile and typed cells (avatar, badge, currency…). Usage:

#### Inputs

- **`columns`** · `SiremTableColumn[]` · _required_
    Column definition (key, title, type, alignment…).
- **`rows`** · `Record<string, unknown>[]` · _required_
    Rows to display; values are read by the key of each column.
- **`trackKey`** · `string` · _default `'id'`_
    Key that identifies each row (tracking and selection).
- **`selectable`** · `boolean` · _default `false`_
    Adds a checkbox column for multiple selection.
- **`sortable`** · `boolean` · _default `true`_
    Allows sorting by pressing a column header.
- **`rowClickable`** · `boolean` · _default `true`_
    Highlights the rows and emits `rowClicked` when they are pressed.
- **`emptyText`** · `string` · _default `'Sin registros.'`_
    Text shown when `rows` is empty.
- **`currencyCode`** · `string` · _default `'COP'`_
    Currency of columns of type `currency` (`COP`, `EUR`…).
- **`selection`** · `unknown[]` · _default `[]`_
    Keys (`trackKey`) of the selected rows.

#### Outputs

- **`rowClicked`** · `Record<string, unknown>`
    Emitted with the clicked row (with `rowClickable`).
    - **Returns:** Object of the clicked row, as-is (its keys).

#### Types & schemas

- **`SiremTableColumn`** · _interface_
    How a table column value is rendered.
    - **Fields:**
        - `key` · `string`
        - `label` · `string`
        - `kind?` · `SiremColumnKind`
        - `align?` · `'left' | 'center' | 'right'`
        - `badgeTones?` · `Record<string, SiremBadgeTone>` — Value → tone map (for kind 'badge').
        - `subKey?` · `string` — Optional key for a faint second line under the value (text/number/date/currency).
- **`SiremColumnKind`** · _union_
    How a table column value is rendered.
    - **Definition:** `'text' | 'number' | 'badge' | 'avatar' | 'date' | 'currency'`
    - `text` — Text as is. It is the default value.
    - `number` — Numeric, with thousands separator.
    - `badge` — Label with the tone of the column.
    - `avatar` — Name with avatar.
    - `date` — Formatted date.
    - `currency` — Amount in the currency indicated by the column.
- **`SiremBadgeTone`** · _union_
    Color semantics of the badge.
    - **Definition:** `'neutral' | 'info' | 'accent' | 'success' | 'warning' | 'danger'`
    - `neutral` — No color semantics. For informative labels.
    - `info` — Informative, with brand blue tint.
    - `accent` — Brand accent (lime). It stands out without state semantics.
    - `success` — Correct or confirmed.
    - `warning` — Pending or with attention.
    - `danger` — Error, expired or blocked.

### `SiremDate`

Selector: `sirem-date-field` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/date)

Date field with pop-up calendar (ISO value `yyyy-MM-dd`). Shows the date in local format, accepts typing (`dd/mm/aaaa` or ISO) and opens `sirem-calendar` in `small` size to pick the day. Usage:

#### Inputs

- **`value`** · `string | null`
    Date in ISO `yyyy-MM-dd`.
- **`label`** · `string` · _default `''`_
    Label visible above the control.
- **`placeholder`** · `string` · _default `'dd/mm/aaaa'`_
    Help text when there is no date (`dd/mm/aaaa`).
- **`hint`** · `string` · _default `''`_
    Help note under the field; replaced by `error` when present.
- **`error`** · `string` · _default `''`_
    Error message. With text, the field is marked in red and announced.
- **`min`** · `string | null`
    Minimum selectable date, in ISO `yyyy-MM-dd`.
- **`max`** · `string | null`
    Maximum selectable date, in ISO `yyyy-MM-dd`.
- **`required`** · `boolean` · _default `false`_
    Marks the field as required (`aria-required` and visual indicator).
- **`disabled`** · `boolean` · _default `false`_
    Disables the control: it cannot be focused or edited.

### `SiremDateChip`

Selector: `sirem-date-chip` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/date-chip)

Large date chip (Bento reference): initial of the weekday on top and the number highlighted below. Used in a row, as a quick day selector…

#### Inputs

- **`day`** · `string | number` · _required_
    Day number (text or number; accepts suffixes like `12+`).
- **`weekday`** · `string | null`
    Week initial/abbreviation (`L`, `Ma`, `Mié`…).
- **`active`** · `boolean` · _default `false`_
    Selected day.
- **`dot`** · `boolean` · _default `false`_
    Status dot (day with events or reminder).
- **`size`** · `SiremDateChipSize` · _default `'md'`_
    Size: `md` (default) or `lg`.
    - **Values:**
      - `md` — Base. It is the default value.
      - `lg` — Highlighted: taller and with the day in a large size.
- **`ariaLabel`** · `string | null`
    Accessible name when `day` and `weekday` are not enough.

#### Outputs

- **`pressed`** · `void`
    Emitted when pressing the chip.
    - **Returns:** Emits no data: the event carries no payload.

#### Types & schemas

- **`SiremDateChipSize`** · _union_
    Date chip size.
    - **Definition:** `'md' | 'lg'`
    - `md` — Base. It is the default value.
    - `lg` — Highlighted: taller and with the day in a large size.

### `SiremDatepicker`

Selector: `sirem-datepicker-field` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/datepicker)

Date picker (appointments, birth, due dates…). ISO value `yyyy-MM-dd`.

#### Inputs

- **`value`** · `string | null`
    Selected date in ISO `yyyy-MM-dd`, with two-way binding.
- **`label`** · `string` · _default `''`_
    Label visible above the control.
- **`hint`** · `string` · _default `''`_
    Help note under the field; replaced by `error` when present.
- **`error`** · `string` · _default `''`_
    Error message. With text, the field is marked in red and announced.
- **`min`** · `string | null`
    Minimum selectable date, in ISO `yyyy-MM-dd`.
- **`max`** · `string | null`
    Maximum selectable date, in ISO `yyyy-MM-dd`.
- **`required`** · `boolean` · _default `false`_
    Marks the field as required (`aria-required` and visual indicator).
- **`disabled`** · `boolean` · _default `false`_
    Disables the control: it cannot be focused or edited.

### `SiremDrawer`

Selector: `sirem-drawer` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/drawer)

Sliding side panel (schedule navigation, patient detail, advanced filters…). On mobile it takes up almost the full width.

#### Inputs

- **`open`** · `boolean` · _default `false`_
    Open state, with two-way binding.
- **`title`** · `string` · _default `''`_
    Header title.
- **`side`** · `'left' | 'right'` · _default `'right'`_
    Side the panel enters from: `left` or `right`.
    - **Values:**
      - `left` — Enters from the left edge.
      - `right` — Enters from the right edge. It is the default value.

#### Outputs

- **`closed`** · `void`
    Emitted when it closes.
    - **Returns:** Emits no data: the event carries no payload.

### `SiremDuotoneIcon`

Selector: `sirem-duotone-icon` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/duotone-icon)

Generic duotone icon (two-layer inline SVG). Duotone pattern (same in Streamline Ultimate Duotone and Phosphor Duotone): - Layer 1 with `opacity="0.2"` (faint fill). - Layer 2 solid (main stroke/shape)…

#### Inputs

- **`svg`** · `string` · _required_
    Full SVG of the icon (must use fill="currentColor" + an opacity="0.2" layer).
- **`size`** · `number` · _default `24`_
    Icon size in px.
- **`label`** · `string | null`
    Accessible name; without it the icon is decorative (`aria-hidden`).

### `SiremDynamicForm`

Selector: `sirem-dynamic-form` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/dynamic-form)

Configuration-driven dynamic form (equivalent to `lo-form-dynamic`, compatible with the Lion form-builder JSON)…

#### Inputs

- **`fields`** · `SiremFormNode[]` · _required_
    Form node tree (fields, groups, tables and HTML).
- **`values`** · `Record<string, unknown>`
    Values by key, with two-way binding.
- **`autosave`** · `boolean` · _default `false`_
    Emits values with ~400 ms debounce (autosaveable histories).
- **`showActions`** · `boolean` · _default `true`_
    Shows the footer with the submit and cancel buttons.
- **`submitLabel`** · `string` · _default `'Guardar'`_
    Submit button text.
- **`cancelLabel`** · `string` · _default `'Cancelar'`_
    Text of the cancel button.

#### Outputs

- **`submitted`** · `Record<string, unknown>`
    Emits the values on pressing submit (only if the form is valid).
    - **Returns:** `values` of the form, already validated.
- **`cancelled`** · `void`
    Emitted when pressing cancel.
    - **Returns:** Emits no data: the event carries no payload.
- **`valueChanged`** · `Record<string, unknown>`
    Emits the values on every change (debounced if `autosave`).
    - **Returns:** Current `values` of the form.

#### Types & schemas

- **`SiremFormNode`** · _alias_
    Cell rows: `html` headers or fields (flat keys, may contain dots).
    - **Definition:** `SiremFieldConfig | SiremGroupConfig | SiremTableConfig | SiremHtmlConfig`
- **`SiremFieldConfig`** · _interface_
    Control type of the dynamic form.
    - **Fields:**
        - `key` · `string`
        - `type` · `SiremFieldType`
        - `label?` · `string`
        - `placeholder?` · `string`
        - `hint?` · `string`
        - `span?` · `number` — Legacy: columns 1-12 (use `column` instead).
        - `column?` · `string[]` — Lion-style width: `["md-4"]`, `["md-6","lg-4"]`, `["md-12"]`…
        - `required?` · `boolean`
        - `isRequired?` · `boolean` — Lion alias of `required`.
        - `disabled?` · `boolean`
        - `options?` · `SiremSelectOption[]` — Static options (with `type: "text"` → autocomplete).
        - `strictOptions?` · `boolean` — Only accepts values from the list → it behaves as a select.
        - `isStrict?` · `boolean` — Alias of `strictOptions`.
        - `multiple?` · `boolean` — Multi-select with chips (`value` is an array).
        - `isMultiple?` · `boolean` — Alias of `multiple`.
        - `optionsEndpoint?` · `string` — GET URL that returns `{ objects: [...] }`.
        - `endpointOptions?` · `string` — Alias of `optionsEndpoint`.
        - `optionsParams?` · `Record<string, unknown>` — Query params of the endpoint.
        - `optionsEndpointParams?` · `Record<string, unknown>` — Lion alias: `optionsEndpointParams`.
        - `optionsMapper?` · `SiremOptionsMapper` — Converts each remote element into `{ value, label }`.
        - `prefixIcon?` · `string` — Leading icon (class `fi fi-rr-user`).
        - `suffixIcon?` · `string` — Trailing icon (class `fi fi-rr-eye`).
        - `rows?` · `number`
        - `min?` · `number | string`
        - `max?` · `number | string`
- **`SiremGroupConfig`** · _interface_
    HTML of the cell/header (sanitized on render).
    - **Fields:**
        - `type` · `'group'`
        - `key?` · `string`
        - `label?` · `string`
        - `description?` · `string`
        - `column?` · `string[]`
        - `children` · `SiremFormNode[]`
- **`SiremTableConfig`** · _interface_
    HTML of the cell/header (sanitized on render).
    - **Fields:**
        - `type` · `'table'`
        - `key` · `string`
        - `column?` · `string[]`
        - `tableChildren` · `SiremTableCell[][]` — Cell rows: `html` headers or fields (flat keys, may contain dots).
- **`SiremHtmlConfig`** · _interface_
    Trailing icon (class `fi fi-rr-eye`).
    - **Fields:**
        - `type` · `'html'`
        - `label` · `string` — HTML of the cell/header (sanitized on render).
- **`SiremFieldType`** · _union_
    Control type of the dynamic form.
    - **Definition:** `'text' | 'number' | 'email' | 'password' | 'tel' | 'textarea' | 'select' | 'date' | 'switch' | 'checkbox' | 'radio' | 'image' | 'search'`
    - `text` — Free text. It is the default value.
    - `number` — Numeric.
    - `email` — Email.
    - `password` — Password.
    - `tel` — Phone.
    - `textarea` — Long text on several lines.
    - `select` — Strict list: only accepts one value from `options`.
    - `date` — Date.
    - `switch` — Boolean switch.
    - `checkbox` — Boolean checkbox.
    - `radio` — Single option.
    - `image` — Image upload.
    - `search` — Search field with filtering.
- **`SiremSelectOption`** · _interface_
    Dropdown option: internal value and visible text.
    - **Fields:**
        - `value` · `string | number`
        - `label` · `string`
- **`SiremOptionsMapper`** · _alias_
    Converts each element of `objects` into a listing option.
    - **Definition:** `(item: unknown) => SiremSelectOption`
- **`SiremTableCell`** · _alias_
    Cell rows: `html` headers or fields (flat keys, may contain dots).
    - **Definition:** `SiremFieldConfig | SiremHtmlConfig`

### `SiremEmptyState`

Selector: `sirem-empty-state` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/empty-state)

Empty state for listings (no patients, no filter results…).

#### Inputs

- **`title`** · `string` · _default `'Sin resultados'`_
    Empty state heading.
- **`description`** · `string` · _default `''`_
    Supporting text below the headline; it may be left empty.

### `SiremFiIcon`

Selector: `sirem-fi-icon` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/fi-icon)

Wrapper for Flaticon UIcons (icon font)…

#### Inputs

- **`name`** · `string` · _required_
    Icon suffix without the `fi-` prefix. E.g.: `rr-user`, `sr-book`, `brands-facebook`.
- **`size`** · `number` · _default `20`_
    Size in px (font-size of the icon font).
- **`label`** · `string | null`
    If provided, the icon is decorative→accessible (role="img").

### `SiremFieldGroup`

Selector: `sirem-field-group` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/field-group)

Field group with a title (equivalent to `lib-group-field-dynamic`): groups related fields inside a form and lays them out in the 12-column grid using the `span` of each field (see `sirem-dynamic-…

#### Inputs

- **`title`** · `string` · _default `''`_
    Title of the field group.
- **`description`** · `string` · _default `''`_
    Supporting text below the title.

### `SiremImageUpload`

Selector: `sirem-image-upload-field` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/image-upload)

Image upload with preview (patient photo, logo, QR…). The value is the image as a data-URL ready to preview/send.

#### Inputs

- **`value`** · `string | null`
    Chosen image (data URL or path), with two-way binding.
- **`label`** · `string` · _default `''`_
    Label visible above the control.
- **`placeholder`** · `string` · _default `'Toca para subir una imagen'`_
    Empty state text of the upload area.
- **`hint`** · `string` · _default `'PNG o JPG'`_
    Help note under the field; replaced by `error` when present.
- **`error`** · `string` · _default `''`_
    Error message. With text, the field is marked in red and announced.
- **`accept`** · `string` · _default `'image/*'`_
    Types accepted by the file picker (`image/*`, `.png`…).
- **`required`** · `boolean` · _default `false`_
    Marks the field as required (`aria-required` and visual indicator).
- **`disabled`** · `boolean` · _default `false`_
    Disables the control: it cannot be focused or edited.

### `SiremInput`

Selector: `sirem-input-field` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/input)

Text field with built-in autocomplete (two-way with `[(value)]`). - Without `options`: normal input…

#### Inputs

- **`value`** · `string | number | (string | number)[] | null`
    Field value (text, number or array in multi-select), with two-way binding.
- **`type`** · `SiremInputType` · _default `'text'`_
    Native control type: `text`, `number`, `email`, `password`, `tel` or `url`.
    - **Values:**
      - `text` — Free text. It is the default value.
      - `number` — Numeric: uses `min`/`max` and the numeric keypad.
      - `email` — Email: keyboard and browser validation.
      - `password` — Password: the text is hidden.
      - `tel` — Phone: numeric keypad.
      - `url` — Web address with basic validation.
- **`label`** · `string` · _default `''`_
    Label visible above the control.
- **`placeholder`** · `string` · _default `''`_
    Help text that appears while the field is empty.
- **`hint`** · `string` · _default `''`_
    Help note under the field; replaced by `error` when present.
- **`error`** · `string` · _default `''`_
    Error message. With text, the field is marked in red and announced.
- **`required`** · `boolean` · _default `false`_
    Marks the field as required (`aria-required` and visual indicator).
- **`disabled`** · `boolean` · _default `false`_
    Disables the control: it cannot be focused or edited.
- **`readonly`** · `boolean` · _default `false`_
    Read only: it can be focused and copied, but not edited.
- **`min`** · `number | null`
    Minimum value with `type="number"`.
- **`max`** · `number | null`
    Maximum value with `type="number"`.
- **`options`** · `SiremSelectOption[]` · _default `[]`_
    Static autocomplete options.
- **`optionsEndpoint`** · `string | null`
    GET URL that returns `{ objects: [...] }` (or a plain array).
- **`endpointOptions`** · `string | null`
    Alias of `optionsEndpoint`.
- **`optionsParams`** · `Record<string, unknown>`
    Query params of the endpoint.
- **`optionsEndpointParams`** · `Record<string, unknown> | null`
    Alias of `optionsParams` (Lion format: `optionsEndpointParams`).
- **`optionsResponsePath`** · `string | null`
    Dot path to the array inside the response (e.g. `"items"`, `"result.objects"`, `"data.items"`). Undefined accepts a direct array or `{ objects: [...] }`.
- **`optionsMapper`** · `SiremOptionsMapper | null`
    Converts each remote element into `{ value, label }`.
- **`strictOptions`** · `boolean` · _default `false`_
    Only accepts values from the list → it behaves as a select.
- **`isStrict`** · `boolean` · _default `false`_
    Alias of `strictOptions`.
- **`multiple`** · `boolean` · _default `false`_
    Multi-select with chips (`value` is an array).
- **`isMultiple`** · `boolean` · _default `false`_
    Alias of `multiple`.
- **`prefixIcon`** · `string` · _default `''`_
    Leading icon (class `fi fi-rr-user`). Reserves space on the left.
- **`suffixIcon`** · `string` · _default `''`_
    Trailing icon (class `fi fi-rr-eye`). Reserves space on the right.

#### Types & schemas

- **`SiremInputType`** · _union_
    Native type of the field (`type` attribute of the HTML input).
    - **Definition:** `'text' | 'number' | 'email' | 'password' | 'tel' | 'url'`
    - `text` — Free text. It is the default value.
    - `number` — Numeric: uses `min`/`max` and the numeric keypad.
    - `email` — Email: keyboard and browser validation.
    - `password` — Password: the text is hidden.
    - `tel` — Phone: numeric keypad.
    - `url` — Web address with basic validation.
- **`SiremSelectOption`** · _interface_
    Dropdown option: internal value and visible text.
    - **Fields:**
        - `value` · `string | number`
        - `label` · `string`
- **`SiremOptionsMapper`** · _alias_
    Converts each element of `objects` into a listing option.
    - **Definition:** `(item: unknown) => SiremSelectOption`

### `SiremInvoiceEditor`

Selector: `sirem-invoice-editor` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/invoice-editor)

Sales invoice editor: header (customer, number, dates, notes), editable lines with VAT and per-line discount, and totals summary.

#### Inputs

- **`draft`** · `SiremInvoiceDraft` · _default `siremEmptyInvoice()`_
    Editable state of the invoice (two-way with `[(draft)]`).
- **`customers`** · `SiremInvoiceCustomer[]` · _default `[]`_
    Customers available in the header select.
- **`nextNumber`** · `string` · _default `''`_
    Suggested sequential number when there is no number.
- **`taxRates`** · `number[]` · _default `[0, 5, 19]`_
    VAT rates offered per line.
- **`currency`** · `string` · _default `'COP'`_
    ISO code of the currency format (`siremMoney`).
- **`status`** · `SiremInvoiceStatus` · _default `'draft'`_
    Tax status shown in the pill.
    - **Values:**
      - `draft` — Draft: still editable.
      - `issued` — Emitted: it stops being editable.
      - `void` — Cancelled.
- **`loading`** · `boolean` · _default `false`_
    Blocks the Save button while it persists.

#### Outputs

- **`saved`** · `SiremInvoiceDraft`
    Valid invoice ready to persist.
    - **Returns:**
      - `number` · `string` — Invoice number.
      - `customerId` · `string | number | null` — Selected customer (`value` of `customers`).
      - `issueDate` · `string` — Issue date `yyyy-mm-dd`.
      - `dueDate` · `string` — Due date `yyyy-mm-dd`.
      - `notes` · `string` — Free-form footer notes.
      - `lines` · `SiremInvoiceLine[]` — Invoice lines.
- **`cancelled`** · `void`
    Changes are discarded (the draft goes back to empty).
    - **Returns:** Emits no data: the event carries no payload.

#### Types & schemas

- **`SiremInvoiceDraft`** · _interface_
    Header + invoice line items (what the component edits and emits).
    - **Fields:**
        - `number` · `string` — Invoice number.
        - `customerId` · `string | number | null` — Selected customer (`value` of `customers`).
        - `issueDate` · `string` — Issue date `yyyy-mm-dd`.
        - `dueDate` · `string` — Due date `yyyy-mm-dd`.
        - `notes` · `string` — Free-form footer notes.
        - `lines` · `SiremInvoiceLine[]` — Invoice lines.
- **`SiremInvoiceCustomer`** · _interface_
    Customer / third party being invoiced. `value` is the id from your domain.
    - **Fields:**
        - `value` · `string | number`
        - `label` · `string`
        - `taxId?` · `string` — Secondary NIT / CC / company name.
- **`SiremInvoiceStatus`** · _union_
    Tax status of the document.
    - **Definition:** `'draft' | 'issued' | 'void'`
    - `draft` — Draft: still editable.
    - `issued` — Emitted: it stops being editable.
    - `void` — Cancelled.
- **`SiremInvoiceLine`** · _interface_
    Invoice line item.
    - **Fields:**
        - `id` · `string` — Line identifier.
        - `description` · `string` — Invoiced line item.
        - `quantity` · `number` — Quantity.
        - `unitPrice` · `number` — Unit price before taxes.
        - `discount` · `number` — Per-line discount as a percentage (0–100).
        - `taxRate` · `number` — VAT rate as a percentage (0, 5, 19…).

### `SiremList`

Selector: `sirem-list` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/list)

Simple list of rows (title + subtitle + icon/avatar + badge). Lightweight alternative to the table for mobile and panels. Usage:

#### Inputs

- **`items`** · `SiremListItem[]` · _required_
    Elements to show (title, subtitle, icon, avatar…).
- **`dividers`** · `boolean` · _default `true`_
    Separators between rows.
- **`emptyText`** · `string` · _default `'Sin elementos.'`_
    Text shown when `items` is empty.

#### Outputs

- **`itemPressed`** · `SiremListItem`
    Emitted with the clicked element.
    - **Returns:**
      - `title` · `string` — Main text of the row.
      - `subtitle?` · `string` — Secondary line under the title.
      - `meta?` · `string` — Text on the right (time, value…).
      - `icon?` · `string` — CSS class of the leading icon (e.g. `fi fi-rr-user`).
      - `svg?` · `string` — Leading inline SVG (duotone / streamline). Precedence over `icon`.
      - `avatarName?` · `string` — Shows an avatar with these initials instead of an icon.
      - `avatarSrc?` · `string | null` — Avatar URL, used together with `avatarName`.
      - `badge?` · `string` — Text of the badge on the right.
      - `badgeTone?` · `SiremBadgeTone` — Badge color (`neutral` if omitted).
      - `chevron?` · `boolean` — Shows chevron › on the right.
      - `disabled?` · `boolean` — Dims the row and blocks the press.
      - `value?` · `any` — Free-form data returned in `itemPressed`.

#### Types & schemas

- **`SiremListItem`** · _interface_
    List row.
    - **Fields:**
        - `title` · `string` — Main text of the row.
        - `subtitle?` · `string` — Secondary line under the title.
        - `meta?` · `string` — Text on the right (time, value…).
        - `icon?` · `string` — CSS class of the leading icon (e.g. `fi fi-rr-user`).
        - `svg?` · `string` — Leading inline SVG (duotone / streamline). Precedence over `icon`.
        - `avatarName?` · `string` — Shows an avatar with these initials instead of an icon.
        - `avatarSrc?` · `string | null` — Avatar URL, used together with `avatarName`.
        - `badge?` · `string` — Text of the badge on the right.
        - `badgeTone?` · `SiremBadgeTone` — Badge color (`neutral` if omitted).
        - `chevron?` · `boolean` — Shows chevron › on the right.
        - `disabled?` · `boolean` — Dims the row and blocks the press.
        - `value?` · `any` — Free-form data returned in `itemPressed`.
- **`SiremBadgeTone`** · _union_
    Color semantics of the badge.
    - **Definition:** `'neutral' | 'info' | 'accent' | 'success' | 'warning' | 'danger'`
    - `neutral` — No color semantics. For informative labels.
    - `info` — Informative, with brand blue tint.
    - `accent` — Brand accent (lime). It stands out without state semantics.
    - `success` — Correct or confirmed.
    - `warning` — Pending or with attention.
    - `danger` — Error, expired or blocked.

### `SiremModal`

Selector: `sirem-modal` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/modal)

Generic modal dialog (CRUD without reloading the page: equivalent to `ElementModalFormDynamicComponent`)…

#### Inputs

- **`open`** · `boolean` · _default `false`_
    Open state, with two-way binding.
- **`title`** · `string` · _default `''`_
    Dialog title and accessible name of the panel.
- **`size`** · `SiremModalSize` · _default `'md'`_
    Maximum width: `sm`, `md` (default), `lg` or `xl`.
    - **Values:**
      - `sm` — 28 rem maximum width. Confirmations.
      - `md` — 36 rem. Short forms. It is the default value.
      - `lg` — 48 rem. Wide content or tables.
      - `xl` — 64 rem. Very dense views.
- **`persistent`** · `boolean` · _default `false`_
    If true, the backdrop and Escape do not close it.
- **`backdropClose`** · `boolean` · _default `true`_
    Close on click outside the panel (the backdrop). Independent of `persistent`: with `false` the backdrop does not close but Escape still works, unless it is also `persistent`.
- **`actions`** · `SiremModalAction[]` · _default `[]`_
    Footer buttons (support N actions with variant, icon and loading).
- **`actionsAlign`** · `SiremModalActionsAlign` · _default `'end'`_
    Alignment of the declarative buttons.
    - **Values:**
      - `start` — Buttons on the left.
      - `center` — Centered buttons.
      - `end` — Buttons on the right. This is the default value.
      - `stretch` — Buttons spread across the width of the footer.

#### Outputs

- **`closed`** · `void`
    Emitted when it closes.
    - **Returns:** Emits no data: the event carries no payload.
- **`actionPressed`** · `SiremModalAction`
    Emitted with the clicked button of the declarative footer.
    - **Returns:**
      - `label` · `string` — Button text.
      - `variant?` · `SiremButtonVariant` — Visual variant (default `secondary`).
      - `size?` · `SiremButtonSize` — Size (default `sm`).
      - `icon?` · `string` — CSS class of the icon in `slot="icon"` (e.g. `fi fi-rr-check`).
      - `disabled?` · `boolean` — Disables the button.
      - `loading?` · `boolean` — Shows the button's loading state.
      - `value?` · `any` — Free-form data returned in `actionPressed`.

#### Types & schemas

- **`SiremModalSize`** · _union_
    Maximum width of the dialog.
    - **Definition:** `'sm' | 'md' | 'lg' | 'xl'`
    - `sm` — 28 rem maximum width. Confirmations.
    - `md` — 36 rem. Short forms. It is the default value.
    - `lg` — 48 rem. Wide content or tables.
    - `xl` — 64 rem. Very dense views.
- **`SiremModalAction`** · _interface_
    Declarative footer button of the modal.
    - **Fields:**
        - `label` · `string` — Button text.
        - `variant?` · `SiremButtonVariant` — Visual variant (default `secondary`).
        - `size?` · `SiremButtonSize` — Size (default `sm`).
        - `icon?` · `string` — CSS class of the icon in `slot="icon"` (e.g. `fi fi-rr-check`).
        - `disabled?` · `boolean` — Disables the button.
        - `loading?` · `boolean` — Shows the button's loading state.
        - `value?` · `any` — Free-form data returned in `actionPressed`.
- **`SiremModalActionsAlign`** · _union_
    Alignment of the declarative buttons in the modal footer.
    - **Definition:** `'start' | 'center' | 'end' | 'stretch'`
    - `start` — Buttons on the left.
    - `center` — Centered buttons.
    - `end` — Buttons on the right. This is the default value.
    - `stretch` — Buttons spread across the width of the footer.
- **`SiremButtonVariant`** · _union_
    Visual style of the button (color semantics).
    - **Definition:** `'primary' | 'accent' | 'secondary' | 'success' | 'warning' | 'ghost' | 'danger'`
    - `primary` — Primary action. Brand background with the theme contrast text.
    - `accent` — Brand accent (lime). Highlighted action without being the primary one.
    - `secondary` — Secondary action. Surface background with border.
    - `success` — Confirmation or successful result.
    - `warning` — Warning or state that requires attention.
    - `ghost` — No background or border; it only gains a background on hover.
    - `danger` — Destructive or error action.
- **`SiremButtonSize`** · _union_
    Button size; `md` matches the height of the fields.
    - **Definition:** `'sm' | 'md' | 'lg'`
    - `sm` — Compact, 2rem high. For bars, headers and tables.
    - `md` — Base, 2.5rem. As high as the form fields.
    - `lg` — Large, 3rem. For highlighted actions.

### `SiremMultiSelect`

Selector: `sirem-multi-select` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/multi-select)

Multiple-option selector with a search box, groups and icons. Ideal for features, permissions and roles. Usage:

#### Inputs

- **`options`** · `SiremMultiSelectOption[]` · _required_
    Selectable options (value, text and optional icon).
- **`value`** · `(string | number)[]` · _default `[]`_
    Selected values (two-way).
- **`label`** · `string` · _default `''`_
    Label visible above the control.
- **`searchPlaceholder`** · `string` · _default `'Buscar opciones…'`_
    Placeholder text of the internal search box.
- **`emptyText`** · `string` · _default `'Sin coincidencias.'`_
    Message when no option matches the filter.
- **`hint`** · `string` · _default `''`_
    Help note under the field; replaced by `error` when present.
- **`error`** · `string` · _default `''`_
    Error message. With text, the field is marked in red and announced.
- **`disabled`** · `boolean` · _default `false`_
    Disables the control: it cannot be focused or edited.
- **`selectAll`** · `boolean` · _default `true`_
    Shows the select/deselect all button.
- **`maxHeight`** · `number` · _default `280`_
    Maximum height of the list with scroll.
- **`ungroupedTitle`** · `string` · _default `''`_
    Title for the group without a group.

#### Types & schemas

- **`SiremMultiSelectOption`** · _interface_
    Selectable option (permission, role, feature…).
    - **Fields:**
        - `value` · `string | number`
        - `label` · `string`
        - `hint?` · `string`
        - `icon?` · `string` — CSS class of the icon (e.g. `fi fi-rr-eye`).
        - `svg?` · `string` — Inline SVG (duotone / streamline). Precedence over `icon`.
        - `group?` · `string` — Group it belongs to (for grouping and searching).
        - `disabled?` · `boolean`

### `SiremNavbar`

Selector: `sirem-navbar` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/navbar)

Navigation bar with four layouts: - `vertical`: list stacked in a panel (modules, settings). - `horizontal`: top row with dropdown submenus. - `minibar`: icon-only rail with floating submenus…

#### Inputs

- **`items`** · `SiremNavItem[]` · _required_
    Navigation tree (icons, children, permissions, separators…).
- **`layout`** · `SiremNavbarLayout` · _default `'vertical'`_
    Layout: `vertical`, `horizontal`, `minibar` or `floating`.
    - **Values:**
      - `vertical` — Side rail with items in a column.
      - `horizontal` — Top bar with the items in a row.
      - `minibar` — Narrow rail: icons only, with tooltip.
      - `floating` — Floating piece separated from the edges.
- **`permissions`** · `Set<string> | string[] | null`
    User permissions; hides items with missing `permission`.
- **`stickyAppearance`** · `'auto' | SiremStickyAppearance` · _default `'auto'`_
    Appearance **while the `siremSticky` directive keeps it pinned**. `auto` (default) keeps the one from `appearance`; `elevated`, `glass` or `flat` change the skin when it pins.
- **`appearance`** · `SiremStickyAppearance` · _default `'default'`_
    Normal appearance: `default`, `elevated`, `glass` or `flat`.
    - **Values:**
      - `default` — The component own look.
      - `elevated` — Surface with shadow: it lifts off the content.
      - `glass` — Translucent surface with backdrop blur (glass effect).
      - `flat` — No background, border or shadow: it blends into the page.
- **`blur`** · `boolean` · _default `false`_
    Translucent background with backdrop blur (ideal with `siremSticky`).
- **`submenu`** · `SiremSubmenuConfig`
    Gesture and placement of submenus, per screen width band. - `[submenu]="{ trigger: 'hover' }"` → the same gesture in all bands. - `[submenu]="{ breakpoint: 1024, desktop: { trigger: 'hover' }, mobile: { trigger: 'click' } }"` → hover above 1024 px and click below. Unconfigured: `hover` on desktop, `click` on mobile and `breakpoint` 768.

#### Outputs

- **`itemPressed`** · `SiremNavItem`
    Emitted when pressing an item.
    - **Returns:**
      - `label` · `string` — Item text.
      - `icon?` · `string` — CSS class of the icon (e.g. `fi fi-rr-users`).
      - `svg?` · `string` — Inline SVG (duotone/streamline). Takes precedence over `icon`.
      - `route?` · `string | any[]` — Angular route it navigates to.
      - `href?` · `string` — External link (`href`); alternative to `route` for URLs outside the app.
      - `img?` · `string` — Round image as icon (e.g. logo); takes precedence over `svg`/`icon`.
      - `badge?` · `string | number` — Text or number of the badge on the right.
      - `permission?` · `string` — Required permission; hidden if not in `permissions`.
      - `tooltip?` · `string` — Text of the floating tooltip on hover with the collapsed sidebar (icons only). Uses `label` by default.
      - `children?` · `SiremNavItem[]` — Subitems; with children the item becomes expandable.

#### Types & schemas

- **`SiremNavItem`** · _interface_
    Hierarchical navigation item of the sidebar / navbar.
    - **Fields:**
        - `label` · `string` — Item text.
        - `icon?` · `string` — CSS class of the icon (e.g. `fi fi-rr-users`).
        - `svg?` · `string` — Inline SVG (duotone/streamline). Takes precedence over `icon`.
        - `route?` · `string | any[]` — Angular route it navigates to.
        - `href?` · `string` — External link (`href`); alternative to `route` for URLs outside the app.
        - `img?` · `string` — Round image as icon (e.g. logo); takes precedence over `svg`/`icon`.
        - `badge?` · `string | number` — Text or number of the badge on the right.
        - `permission?` · `string` — Required permission; hidden if not in `permissions`.
        - `tooltip?` · `string` — Text of the floating tooltip on hover with the collapsed sidebar (icons only). Uses `label` by default.
        - `children?` · `SiremNavItem[]` — Subitems; with children the item becomes expandable.
- **`SiremNavbarLayout`** · _union_
    Layout of the navigation bar.
    - **Definition:** `'vertical' | 'horizontal' | 'minibar' | 'floating'`
    - `vertical` — Side rail with items in a column.
    - `horizontal` — Top bar with the items in a row.
    - `minibar` — Narrow rail: icons only, with tooltip.
    - `floating` — Floating piece separated from the edges.
- **`SiremStickyAppearance`** · _union_
    Appearance a bar (topbar, navbar or page-header) can adopt: - `default`: the component own look. - `elevated`: surface + shadow, lifted off the content. - `glass`: translucent surface with backdrop blur. - `flat`: no background, border or shadow; it blends into the page. Used by `appearance` (normal look) and `stickyAppearance` (when stuck), so a bar can change skin as it pins.
    - **Definition:** `'default' | 'elevated' | 'glass' | 'flat'`
    - `default` — The component own look.
    - `elevated` — Surface with shadow: it lifts off the content.
    - `glass` — Translucent surface with backdrop blur (glass effect).
    - `flat` — No background, border or shadow: it blends into the page.
- **`SiremSubmenuConfig`** · _interface_
    Configuration of the submenus of a navigation component. Each setting resolves with this priority: active band (`mobile`/`desktop`) → common value → default.
    - **Fields:**
        - `breakpoint?` · `number` — Width in px that separates the bands: `≤ breakpoint` is mobile. Default `768`.
        - `mobile?` · `SiremSubmenuBand` — Settings only on narrow screens (≤ `breakpoint`).
        - `desktop?` · `SiremSubmenuBand` — Settings only on wide screens (> `breakpoint`).
- **`SiremSubmenuBand`** · _interface_
    Submenu overlay settings for a specific width band.
    - **Fields:**
        - `trigger?` · `SiremOverlayTriggerType` — Event that opens the panel: `hover`, `click`, `dblclick`, `contextmenu`, `longpress` or `manual`.
        - `placement?` · `SiremOverlayPlacement` — Side of the item the panel opens from and its alignment (`bottom-start`, `right-start`…).
        - `offset?` · `number` — Spacing in px between the item and the panel.
        - `hoverDelayMs?` · `number` — Wait with the pointer over it before opening (`hover`).
        - `hoverHideDelayMs?` · `number` — Wait after leaving the panel before closing (`hover`); gives time to reach it.
- **`SiremOverlayTriggerType`** · _union_
    Event that opens the overlay.
    - **Definition:** `'click' | 'dblclick' | 'contextmenu' | 'longpress' | 'hover' | 'manual'`
    - `click` — A single click. It is the default value and the most common one.
    - `dblclick` — Double click. Prevents opening the menu on the first press.
    - `contextmenu` — Right click. The panel appears under the pointer and the browser menu does not appear.
    - `longpress` — Hold for the duration of `siremOverlayLongPressMs`.
    - `hover` — The pointer enters and stays `siremOverlayHoverDelayMs` over the element.
    - `manual` — Ignores mouse events; it only responds to `[(open)]` from code.
- **`SiremOverlayPlacement`** · _alias_
    Allowed combination of side and alignment.
    - **Definition:** `SiremOverlaySide | 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end' | 'left-start' | 'left-center' | 'left-end' | 'right-start' | 'right-center' | 'right-end'`
- **`SiremOverlaySide`** · _union_
    Side of the trigger the panel opens from.
    - **Definition:** `'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end'`
    - `top`
    - `bottom`
    - `left`
    - `right`
    - `inline-start`
    - `inline-end`

### `SiremOverlayViewport`

Selector: `sirem-overlay-viewport` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/overlay)

Optional configurator of the overlays layer. **You do not need to mount it**: `[siremOverlay]` creates the layer on its own the first time it is used, with default styles and `z-index`…

#### Inputs

- **`zIndex`** · `number` · _default `1200`_
    z-index of the overlay layer.

### `SiremPageHeader`

Selector: `sirem-page-header` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/page-header)

Standardized listing header (`lo-resource-set-list`): title + descriptive subtitle + projected actions.

#### Inputs

- **`title`** · `string` · _required_
    Page title.
- **`subtitle`** · `string` · _default `''`_
    Context line under the title.
- **`appearance`** · `SiremStickyAppearance` · _default `'default'`_
    Normal appearance: `default` (transparent), `elevated`, `glass` or `flat`.
    - **Values:**
      - `default` — The component own look.
      - `elevated` — Surface with shadow: it lifts off the content.
      - `glass` — Translucent surface with backdrop blur (glass effect).
      - `flat` — No background, border or shadow: it blends into the page.
- **`stickyAppearance`** · `'auto' | SiremStickyAppearance` · _default `'elevated'`_
    Appearance **while the `siremSticky` directive keeps it pinned**. `auto` inherits `appearance`; defaults to `elevated`, so content is not visible behind the title.

#### Types & schemas

- **`SiremStickyAppearance`** · _union_
    Appearance a bar (topbar, navbar or page-header) can adopt: - `default`: the component own look. - `elevated`: surface + shadow, lifted off the content. - `glass`: translucent surface with backdrop blur. - `flat`: no background, border or shadow; it blends into the page. Used by `appearance` (normal look) and `stickyAppearance` (when stuck), so a bar can change skin as it pins.
    - **Definition:** `'default' | 'elevated' | 'glass' | 'flat'`
    - `default` — The component own look.
    - `elevated` — Surface with shadow: it lifts off the content.
    - `glass` — Translucent surface with backdrop blur (glass effect).
    - `flat` — No background, border or shadow: it blends into the page.

### `SiremPopupCard`

Selector: `sirem-popup-card` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/popup-card)

Light floating card for map popups (GPS telemetry: speed, battery, last position…)…

#### Inputs

- **`title`** · `string` · _default `'Dispositivo'`_
    Device identifier (e.g. plate or short IMEI).
- **`rows`** · `SiremPopupRow[]` · _default `[]`_
    Rows `label → value`, with optional badge tone.
- **`closable`** · `boolean` · _default `true`_
    Shows the header close button.

#### Outputs

- **`closed`** · `void`
    Emitted when pressing close.
    - **Returns:** Emits no data: the event carries no payload.

#### Types & schemas

- **`SiremPopupRow`** · _interface_
    Telemetry row key → value (speed, battery…).
    - **Fields:**
        - `label` · `string`
        - `value` · `string`
        - `tone?` · `SiremBadgeTone`
- **`SiremBadgeTone`** · _union_
    Color semantics of the badge.
    - **Definition:** `'neutral' | 'info' | 'accent' | 'success' | 'warning' | 'danger'`
    - `neutral` — No color semantics. For informative labels.
    - `info` — Informative, with brand blue tint.
    - `accent` — Brand accent (lime). It stands out without state semantics.
    - `success` — Correct or confirmed.
    - `warning` — Pending or with attention.
    - `danger` — Error, expired or blocked.

### `SiremRadioGroup`

Selector: `sirem-radio-group-field` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/radio-group)

Group of mutually exclusive options (person type, regime…).

#### Inputs

- **`value`** · `string | number | null`
    Selected option, with two-way binding.
- **`options`** · `SiremSelectOption[]` · _default `[]`_
    Group options (value and text).
- **`label`** · `string` · _default `''`_
    Group title; it is associated with the `fieldset` as a legend.
- **`hint`** · `string` · _default `''`_
    Help note under the group.
- **`groupName`** · `string` · _default `'sirem-radio'`_
    Name shared by the radios to group them in the DOM.
- **`orientation`** · `'horizontal' | 'vertical'` · _default `'horizontal'`_
    `horizontal` (row) or `vertical` (column).
    - **Values:**
      - `horizontal` — Options in a row. This is the default value.
      - `vertical` — Options in a column.
- **`required`** · `boolean` · _default `false`_
    Marks the field as required (`aria-required` and visual indicator).
- **`disabled`** · `boolean` · _default `false`_
    Disables all options.

#### Types & schemas

- **`SiremSelectOption`** · _interface_
    Dropdown option: internal value and visible text.
    - **Fields:**
        - `value` · `string | number`
        - `label` · `string`

### `SiremRichText`

Selector: `sirem-rich-text` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/rich-text)

Lightweight rich text editor (contenteditable + formatting bar). Returns HTML two-way; no external dependencies. Usage:

#### Inputs

- **`value`** · `string` · _default `''`_
    HTML of the content (two-way).
- **`label`** · `string` · _default `''`_
    Label visible above the editor.
- **`placeholder`** · `string` · _default `'Escribe aquí…'`_
    Help text while the content is empty.
- **`hint`** · `string` · _default `''`_
    Help note under the editor.
- **`error`** · `string` · _default `''`_
    Error message. With text, the field is marked in red and announced.
- **`minHeight`** · `number` · _default `140`_
    Minimum height of the area in px.

### `SiremSearchField`

Selector: `sirem-search-field` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/search-field)

Search field with magnifier and clear button (listing filters).

#### Inputs

- **`value`** · `string` · _default `''`_
    Search text, with two-way binding.
- **`label`** · `string` · _default `''`_
    Search field label (often accessible only).
- **`placeholder`** · `string` · _default `'Buscar…'`_
    Placeholder text inside the field.
- **`disabled`** · `boolean` · _default `false`_
    Disables the control: it cannot be focused or edited.
- **`error`** · `string` · _default `''`_
    Error message. With text, the field is marked in red and announced.

### `SiremSearchPalette`

Selector: `sirem-search-palette` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/search-palette)

Global command-palette-style search (equivalent to `SearchPalettesComponent`). Opens with `Ctrl+K` / `Cmd+K` from any view; filters by text, navigates with ↑↓ + Enter and closes with Escape. Usage:

#### Inputs

- **`items`** · `SiremPaletteItem[]` · _default `[]`_
    Searchable entries (title, section, icon, route).
- **`placeholder`** · `string` · _default `'Buscar pacientes, facturas, placas…'`_
    Placeholder text of the search box.
- **`open`** · `boolean` · _default `false`_
    Controls the visibility of the palette, with two-way binding.

#### Outputs

- **`selected`** · `SiremPaletteItem`
    Emitted with the chosen entry.
    - **Returns:**
      - `label` · `string` — Main text of the result.
      - `hint?` · `string` — Secondary context (route, type, site…).
      - `group?` · `string` — Section the result belongs to.

#### Types & schemas

- **`SiremPaletteItem`** · _interface_
    Selectable result of the palette (patient, invoice, plate, action…).
    - **Fields:**
        - `label` · `string` — Main text of the result.
        - `hint?` · `string` — Secondary context (route, type, site…).
        - `group?` · `string` — Section the result belongs to.

### `SiremSegmented`

Selector: `sirem-segmented` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/segmented)

Segmented pill control (Bento reference): a group of mutually exclusive options where the active one is highlighted with a chip that **slides** to the chosen option…

#### Inputs

- **`items`** · `SiremSegmentedItem[] | null`
    Options to show. With `null` (default) the control is the fixed **Table ⇄ Cards** switch (`table` / `cards`).
- **`value`** · `string | null`
    Active value (two-way).
- **`size`** · `SiremSegmentedSize` · _default `'md'`_
    Height of the control: `sm`, `md` (default) or `lg`.
    - **Values:**
      - `sm` — Compact, 0.75 rem text. For bars and tables.
      - `md` — Base. It is the default value.
      - `lg` — Large, 0.9375 rem text and more air.
- **`tone`** · `'default' | 'accent'` · _default `'default'`_
    `accent` paints the active card with the lime accent.
    - **Values:**
      - `default` — Active chip in ink. It is the default value.
      - `accent` — Active chip with the lime accent.
- **`stretch`** · `boolean` · _default `false`_
    Takes up 100% of the width, spreading the options.
- **`ariaLabel`** · `string | null`
    Accessible name of the button group.

#### Types & schemas

- **`SiremSegmentedItem`** · _interface_
    Option of the segmented control.
    - **Fields:**
        - `value` · `string`
        - `label` · `string`
        - `icon?` · `string` — Optional icon CSS class (e.g. `fi fi-rr-grid`).
        - `hint?` · `string` — Small text under the label (e.g. the date in a day picker).
- **`SiremSegmentedSize`** · _union_
    Small text under the label (e.g. the date in a day picker).
    - **Definition:** `'sm' | 'md' | 'lg'`
    - `sm` — Compact, 0.75 rem text. For bars and tables.
    - `md` — Base. It is the default value.
    - `lg` — Large, 0.9375 rem text and more air.

### `SiremSelect`

Selector: `sirem-select-field` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/select)

Dropdown selector (specialty, marital status, document type…) over a native `<select>`…

#### Inputs

- **`value`** · `string | number | null`
    Selected value, with two-way binding.
- **`options`** · `SiremSelectOption[]` · _default `[]`_
    Dropdown options (value and text).
- **`label`** · `string` · _default `''`_
    Label visible above the control.
- **`placeholder`** · `string` · _default `'Seleccionar…'`_
    Text shown while there is no selection.
- **`hint`** · `string` · _default `''`_
    Help note under the field; replaced by `error` when present.
- **`error`** · `string` · _default `''`_
    Error message. With text, the field is marked in red and announced.
- **`required`** · `boolean` · _default `false`_
    Marks the field as required (`aria-required` and visual indicator).
- **`disabled`** · `boolean` · _default `false`_
    Disables the control: it cannot be focused or edited.

#### Types & schemas

- **`SiremSelectOption`** · _interface_
    Dropdown option: internal value and visible text.
    - **Fields:**
        - `value` · `string | number`
        - `label` · `string`

### `SiremSheet`

Selector: `sirem-sheet` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/sheet)

Resizable bottom sheet with presets and full screen.

#### Inputs

- **`open`** · `boolean` · _default `false`_
    Open state (two-way).
- **`size`** · `SiremSheetSize` · _default `'md'`_
    Active default height (two-way).
    - **Values:**
      - `sm` — 42 % of the window height.
      - `md` — 62 % of the height. It is the default value.
      - `lg` — 85 % of the height.
      - `full` — 100 % of the height: full screen.
- **`title`** · `string | null`
    Header title and accessible name of the panel.
- **`subtitle`** · `string | null`
    Secondary line under the title.
- **`ariaLabel`** · `string | null` · _default `'Panel'`_
    Accessible name when there is no `title`.
- **`closable`** · `boolean` · _default `true`_
    Shows the close button.
- **`resizable`** · `boolean` · _default `true`_
    Allows dragging the drag handle to change the height.
- **`gestureResize`** · `boolean` · _default `false`_
    Allows changing the height with vertical gestures **inside the content** (mobile and mouse). Up expands to `full`; down shrinks, and only if the content is at the top (`scrollTop === 0`) so as not to steal the scroll. Disabled by default: the content scrolls normally.
- **`maximizable`** · `boolean` · _default `true`_
    Allows reaching full screen.
- **`minimizable`** · `boolean` · _default `true`_
    Allows shrinking. With `false` the sheet always stays at `full` and neither the drag handle nor the restore button is shown.
- **`backdropClose`** · `boolean` · _default `true`_
    Close on backdrop click.
- **`closeOnEscape`** · `boolean` · _default `true`_
    Close with `Escape`.
- **`defaultSize`** · `SiremSheetSize` · _default `'md'`_
    Size that «restore» returns to if no other has been chosen yet.
    - **Values:**
      - `sm` — 42 % of the window height.
      - `md` — 62 % of the height. It is the default value.
      - `lg` — 85 % of the height.
      - `full` — 100 % of the height: full screen.
- **`maxWidth`** · `string` · _default `'100%'`_
    Maximum width of the panel (any CSS unit).

#### Outputs

- **`closed`** · `void`
    Emitted when it closes, before the exit animation.
    - **Returns:** Emits no data: the event carries no payload.
- **`resized`** · `SiremSheetSize`
    Emitted with the new size when the height changes (drag handle, gesture or button).
    - **Values:**
      - `sm` — 42 % of the window height.
      - `md` — 62 % of the height. It is the default value.
      - `lg` — 85 % of the height.
      - `full` — 100 % of the height: full screen.

#### Types & schemas

- **`SiremSheetSize`** · _union_
    Default heights of the sheet.
    - **Definition:** `'sm' | 'md' | 'lg' | 'full'`
    - `sm` — 42 % of the window height.
    - `md` — 62 % of the height. It is the default value.
    - `lg` — 85 % of the height.
    - `full` — 100 % of the height: full screen.

### `SiremSidebar`

Selector: `sirem-sidebar` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/sidebar)

Hierarchical, collapsible and responsive side menu…

#### Inputs

- **`items`** · `SiremNavItem[]` · _required_
    Navigation tree (icons, children, permissions, separators…).
- **`permissions`** · `Set<string> | string[] | null`
    User permissions; items with missing `permission` are hidden.
- **`layout`** · `'vertical' | 'horizontal'` · _default `'vertical'`_
    Layout: classic side or top horizontal.
    - **Values:**
      - `vertical` — Side rail with items in a column.
      - `horizontal` — Top bar with the items in a row.
- **`fixed`** · `boolean` · _default `false`_
    Pins the bar on scroll (`position: sticky`).
- **`pinned`** · `boolean` · _default `false`_
    Keeps the vertical sidebar fixed full screen on desktop.
- **`centerNav`** · `boolean` · _default `false`_
    Vertically centers the navigation items when there is space.
- **`blur`** · `boolean` · _default `false`_
    Translucent background with blur (ideal with `fixed`).
- **`floating`** · `boolean` · _default `false`_
    Floating panel: separated from the edges with margin and radius (dashboard).
- **`collapsed`** · `boolean` · _default `false`_
    Full collapse (desktop): icons only. Ideal for maps.
- **`mobileOpen`** · `boolean` · _default `false`_
    Drawer on mobile.
- **`brand`** · `string` · _default `'SIREM UI'`_
    Brand name in the sidebar header.
- **`submenu`** · `SiremSubmenuConfig`
    Gesture and placement of submenus, per screen width band. - `[submenu]="{ trigger: 'hover' }"` → the same gesture in all bands. - `[submenu]="{ breakpoint: 1024, desktop: { trigger: 'hover' }, mobile: { trigger: 'click' } }"` → hover above 1024 px and click below. Unconfigured: `hover` on desktop, `click` on mobile and `breakpoint` 768.

#### Outputs

- **`itemPressed`** · `SiremNavItem`
    Emitted when pressing an item (for routes or telemetry).
    - **Returns:**
      - `label` · `string` — Item text.
      - `icon?` · `string` — CSS class of the icon (e.g. `fi fi-rr-users`).
      - `svg?` · `string` — Inline SVG (duotone/streamline). Takes precedence over `icon`.
      - `route?` · `string | any[]` — Angular route it navigates to.
      - `href?` · `string` — External link (`href`); alternative to `route` for URLs outside the app.
      - `img?` · `string` — Round image as icon (e.g. logo); takes precedence over `svg`/`icon`.
      - `badge?` · `string | number` — Text or number of the badge on the right.
      - `permission?` · `string` — Required permission; hidden if not in `permissions`.
      - `tooltip?` · `string` — Text of the floating tooltip on hover with the collapsed sidebar (icons only). Uses `label` by default.
      - `children?` · `SiremNavItem[]` — Subitems; with children the item becomes expandable.

#### Types & schemas

- **`SiremNavItem`** · _interface_
    Hierarchical navigation item of the sidebar / navbar.
    - **Fields:**
        - `label` · `string` — Item text.
        - `icon?` · `string` — CSS class of the icon (e.g. `fi fi-rr-users`).
        - `svg?` · `string` — Inline SVG (duotone/streamline). Takes precedence over `icon`.
        - `route?` · `string | any[]` — Angular route it navigates to.
        - `href?` · `string` — External link (`href`); alternative to `route` for URLs outside the app.
        - `img?` · `string` — Round image as icon (e.g. logo); takes precedence over `svg`/`icon`.
        - `badge?` · `string | number` — Text or number of the badge on the right.
        - `permission?` · `string` — Required permission; hidden if not in `permissions`.
        - `tooltip?` · `string` — Text of the floating tooltip on hover with the collapsed sidebar (icons only). Uses `label` by default.
        - `children?` · `SiremNavItem[]` — Subitems; with children the item becomes expandable.
- **`SiremSubmenuConfig`** · _interface_
    Configuration of the submenus of a navigation component. Each setting resolves with this priority: active band (`mobile`/`desktop`) → common value → default.
    - **Fields:**
        - `breakpoint?` · `number` — Width in px that separates the bands: `≤ breakpoint` is mobile. Default `768`.
        - `mobile?` · `SiremSubmenuBand` — Settings only on narrow screens (≤ `breakpoint`).
        - `desktop?` · `SiremSubmenuBand` — Settings only on wide screens (> `breakpoint`).
- **`SiremSubmenuBand`** · _interface_
    Submenu overlay settings for a specific width band.
    - **Fields:**
        - `trigger?` · `SiremOverlayTriggerType` — Event that opens the panel: `hover`, `click`, `dblclick`, `contextmenu`, `longpress` or `manual`.
        - `placement?` · `SiremOverlayPlacement` — Side of the item the panel opens from and its alignment (`bottom-start`, `right-start`…).
        - `offset?` · `number` — Spacing in px between the item and the panel.
        - `hoverDelayMs?` · `number` — Wait with the pointer over it before opening (`hover`).
        - `hoverHideDelayMs?` · `number` — Wait after leaving the panel before closing (`hover`); gives time to reach it.
- **`SiremOverlayTriggerType`** · _union_
    Event that opens the overlay.
    - **Definition:** `'click' | 'dblclick' | 'contextmenu' | 'longpress' | 'hover' | 'manual'`
    - `click` — A single click. It is the default value and the most common one.
    - `dblclick` — Double click. Prevents opening the menu on the first press.
    - `contextmenu` — Right click. The panel appears under the pointer and the browser menu does not appear.
    - `longpress` — Hold for the duration of `siremOverlayLongPressMs`.
    - `hover` — The pointer enters and stays `siremOverlayHoverDelayMs` over the element.
    - `manual` — Ignores mouse events; it only responds to `[(open)]` from code.
- **`SiremOverlayPlacement`** · _alias_
    Allowed combination of side and alignment.
    - **Definition:** `SiremOverlaySide | 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end' | 'left-start' | 'left-center' | 'left-end' | 'right-start' | 'right-center' | 'right-end'`
- **`SiremOverlaySide`** · _union_
    Side of the trigger the panel opens from.
    - **Definition:** `'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end'`
    - `top`
    - `bottom`
    - `left`
    - `right`
    - `inline-start`
    - `inline-end`

### `SiremSparkline`

Selector: `sirem-sparkline` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/sparkline)

Axis-less mini chart (sparkline) for KPIs inside a card. - `variant="bar"` (default): pill-style bars, ideal for the Bento. - `variant="line"`: smooth polyline, for trends…

#### Inputs

- **`data`** · `number[]` · _required_
    Series of values (positive).
- **`variant`** · `SiremSparklineVariant` · _default `'bar'`_
    Bars (default) or line.
    - **Values:**
      - `bar` — Vertical bars.
      - `line` — Line with filled area.
- **`tone`** · `SiremSparklineTone` · _default `'neutral'`_
    Color of the highlighted value.
    - **Values:**
      - `neutral` — Neutral, no brand color.
      - `accent` — Brand accent (lime).
      - `sage` — Sage green, for calm trends.
      - `danger` — Red, for drops or alerts.
- **`highlight`** · `number | null`
    Highlighted index; `null` leaves them all dim.
- **`height`** · `number` · _default `40`_
    Height in px.
- **`label`** · `string | null`
    Accessible label; without it the chart is decorative.

#### Types & schemas

- **`SiremSparklineVariant`** · _union_
    Sparkline shape (area, line or bars).
    - **Definition:** `'bar' | 'line'`
    - `bar` — Vertical bars.
    - `line` — Line with filled area.
- **`SiremSparklineTone`** · _union_
    Semantic color of the sparkline.
    - **Definition:** `'neutral' | 'accent' | 'sage' | 'danger'`
    - `neutral` — Neutral, no brand color.
    - `accent` — Brand accent (lime).
    - `sage` — Sage green, for calm trends.
    - `danger` — Red, for drops or alerts.

### `SiremStatCard`

Selector: `sirem-stat-card` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/stat-card)

KPI card (total patients, month's billing, overdue receivables…). - `variant="soft"` (default): the usual light card. - `variant="tint"`: pastel background of the `color` tone with the icon in a chip…

#### Inputs

- **`label`** · `string` · _required_
    Metric title (e.g. “Active patients”).
- **`value`** · `string | number` · _required_
    Main value, already formatted (`'1.248'`, `'98 %'`…).
- **`delta`** · `number | null`
    Percentage variation; null hides it.
- **`deltaLabel`** · `string` · _default `'vs. periodo anterior'`_
    Text accompanying the variation (`+12.4 % vs. previous period`). Empty leaves only the percentage.
- **`size`** · `'md' | 'sm'` · _default `'md'`_
    `md` (default) or `sm`: compact, for KPI rows.
    - **Values:**
      - `md` — Base size. It is the default value.
      - `sm` — Compact, for KPI rows.
- **`variant`** · `SiremStatVariant` · _default `'soft'`_
    `soft` (light), `tint` (pastel) or `solid` (full colour).
    - **Values:**
      - `soft` — Light card, white with border. Default value.
      - `tint` — Pastel background of the `color` tone, with the icon in a chip.
      - `solid` — Solid color with white text, for strong accents.
- **`surface`** · `SiremSurface` · _default `'solid'`_
    Solid surface (default) or translucent.
    - **Values:**
      - `solid` — Opaque surface.
      - `glass` — Translucent surface with blur.
- **`color`** · `'brand' | 'accent' | 'info' | 'success' | 'warning' | 'danger'` · _default `'brand'`_
    Color for `variant="solid"` or `variant="tint"`.
    - **Values:**
      - `brand` — Brand color. This is the default value.
      - `accent` — Lime accent.
      - `info` — Informative, blue tint.
      - `success` — Success, sage green.
      - `warning` — Warning, amber.
      - `danger` — Error, red.

### `SiremStreamlineIcon`

Selector: `sirem-streamline-icon` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/streamline-icon)

Streamline icon (inline SVG registered by name). Designed for Streamline Ultimate Duotone: it respects the two layers of the SVG (fill `opacity="0.2"` + solid shape) and inherits `currentColor`…

#### Inputs

- **`name`** · `string | null`
    Name registered via `provideStreamlineIcons()`.
- **`svg`** · `string | null`
    Direct SVG (takes precedence over `name`).
- **`size`** · `number` · _default `24`_
    Icon size in px.
- **`label`** · `string | null`
    Accessible name; without it the icon is decorative (`aria-hidden`).

### `SiremSwitch`

Selector: `sirem-switch-field` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/switch)

Boolean switch (Xubio sync, active state…).

#### Inputs

- **`checked`** · `boolean` · _default `false`_
    Enabled state, with two-way binding.
- **`label`** · `string` · _default `''`_
    Switch text.
- **`description`** · `string` · _default `''`_
    Secondary line under the label.
- **`disabled`** · `boolean` · _default `false`_
    Disables the switch.

### `SiremTextarea`

Selector: `sirem-textarea-field` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/textarea)

Multiline text area (observations, clinical notes…).

#### Inputs

- **`value`** · `string | null`
    Area text, with two-way binding.
- **`label`** · `string` · _default `''`_
    Label visible above the control.
- **`placeholder`** · `string` · _default `''`_
    Help text that appears while the field is empty.
- **`hint`** · `string` · _default `''`_
    Help note under the field; replaced by `error` when present.
- **`error`** · `string` · _default `''`_
    Error message. With text, the field is marked in red and announced.
- **`rows`** · `number` · _default `3`_
    Number of visible lines (initial height).
- **`required`** · `boolean` · _default `false`_
    Marks the field as required (`aria-required` and visual indicator).
- **`disabled`** · `boolean` · _default `false`_
    Disables the control: it cannot be focused or edited.

### `SiremTimeline`

Selector: `sirem-timeline` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/timeline)

Vertical timeline (patient history, document traceability, events from a GPS device…).

#### Inputs

- **`items`** · `SiremTimelineItem[]` · _default `[]`_
    Milestones to display (title, description, time and tone).

#### Types & schemas

- **`SiremTimelineItem`** · _interface_
    A milestone of the timeline.
    - **Fields:**
        - `title` · `string`
        - `description?` · `string`
        - `time?` · `string`
        - `tone?` · `SiremBadgeTone`
- **`SiremBadgeTone`** · _union_
    Color semantics of the badge.
    - **Definition:** `'neutral' | 'info' | 'accent' | 'success' | 'warning' | 'danger'`
    - `neutral` — No color semantics. For informative labels.
    - `info` — Informative, with brand blue tint.
    - `accent` — Brand accent (lime). It stands out without state semantics.
    - `success` — Correct or confirmed.
    - `warning` — Pending or with attention.
    - `danger` — Error, expired or blocked.

### `SiremTopbar`

Selector: `sirem-topbar` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/topbar)

Top bar: hamburger (mobile), workspace on the left, global search (Ctrl+K), special actions and full screen. The user menu is projected into `slot="user"`.

#### Inputs

- **`spaceLabel`** · `string` · _default `'Mi espacio'`_
    Current workspace or site. Emits `spacePressed` to open its picker.
- **`spaceAriaLabel`** · `string` · _default `'workspace'`_
    Workspace text when it is not shown as a button (mobile).
- **`pageTitle`** · `string` · _default `''`_
    Title of the current page (chip next to the workspace).
- **`pageSupTitle`** · `string` · _default `''`_
    Subtitle of the page chip (optional, in small caps).
- **`stickyAppearance`** · `'auto' | SiremTopbarAppearance` · _default `'auto'`_
    Appearance **while the `siremSticky` directive keeps it pinned**. `auto` (default) keeps the one from `appearance`; `elevated`, `glass` or `flat` change the skin when it pins.
- **`blur`** · `boolean` · _default `false`_
    Translucent background with backdrop blur (ideal with `siremSticky`).
- **`transparent`** · `boolean` · _default `false`_
    Transparent background: the app shell shows through the bar. It can be combined with `blur` (transparent + `backdrop-filter`, the classic glass header) or with `floating`/`appearance="cards"`.
- **`shadowOnScroll`** · `boolean` · _default `false`_
    Shows the shadow while scrolling (`shadowOnScroll`): the bar gains elevation as content passes underneath (useful with `siremSticky`).
- **`showSpace`** · `boolean` · _default `true`_
    Shows the workspace/branch button.
- **`floating`** · `boolean` · _default `false`_
    Floating bar: it separates from the edges with margin and radius, with a transparent background (the shell is visible; border + blur give legibility). The left margin can be set by the shell with `--sirem-topbar-inset-left`.
- **`appearance`** · `SiremTopbarAppearance` · _default `'default'`_
    Overall look: `default`, `cards`, `elevated`, `glass` or `flat`.
    - **Values:**
      - `default` — Continuous bar across the full width. This is the default.
      - `cards` — Floating pieces: search box and actions as cards.
      - `elevated` — Surface with shadow: the bar lifts off the content.
      - `glass` — Translucent surface with backdrop blur (glass effect).
      - `flat` — No background, border or shadow: it blends into the page.
- **`searchAlign`** · `SiremTopbarSearchAlign` · _default `'start'`_
    Alignment of the search box; `center` keeps it centered in the bar.
    - **Values:**
      - `start` — Aligned to the start, next to the rest of the elements.
      - `center` — Centered in the bar.
- **`searchPlaceholder`** · `string` · _default `'Buscar pacientes, facturas, placas…'`_
    Muted text of the search box.
- **`searchHighlight`** · `string` · _default `''`_
    Part of the placeholder shown in bold.
- **`searchHint`** · `string` · _default `'Ctrl K'`_
    Suggested key; an empty string hides it.
- **`showFullscreen`** · `boolean` · _default `true`_
    Shows the fullscreen button.
- **`showMenu`** · `boolean` · _default `true`_
    Shows the menu (hamburger) button in responsive mode (< 768 px); on desktop it is always hidden by CSS. Set it to `false` if the mobile menu is opened by another shell control, so you don't leave a button without an action.
- **`showSpaceDot`** · `boolean` · _default `true`_
    Shows the decorative dot next to the workspace.
- **`showSpaceChevron`** · `boolean` · _default `true`_
    Shows the workspace arrow (indicates it opens a selector).

#### Outputs

- **`menuPressed`** · `void`
    Emitted when pressing the menu button (opens the sidebar on mobile).
    - **Returns:** Emits no data: the event carries no payload.
- **`searchPressed`** · `void`
    Emitted when pressing the search box (opens the search palette).
    - **Returns:** Emits no data: the event carries no payload.
- **`spacePressed`** · `void`
    Emitted when pressing the workspace (opens its selector).
    - **Returns:** Emits no data: the event carries no payload.
- **`fullscreenPressed`** · `void`
    Emitted when pressing the fullscreen button.
    - **Returns:** Emits no data: the event carries no payload.

#### Types & schemas

- **`SiremTopbarAppearance`** · _alias_
    Overall bar styling (including the `sticky` looks).
    - **Definition:** `'cards' | SiremStickyAppearance`
- **`SiremTopbarSearchAlign`** · _union_
    How the search box is aligned inside the bar.
    - **Definition:** `'start' | 'center'`
    - `start` — Aligned to the start, next to the rest of the elements.
    - `center` — Centered in the bar.
- **`SiremStickyAppearance`** · _union_
    Appearance a bar (topbar, navbar or page-header) can adopt: - `default`: the component own look. - `elevated`: surface + shadow, lifted off the content. - `glass`: translucent surface with backdrop blur. - `flat`: no background, border or shadow; it blends into the page. Used by `appearance` (normal look) and `stickyAppearance` (when stuck), so a bar can change skin as it pins.
    - **Definition:** `'default' | 'elevated' | 'glass' | 'flat'`
    - `default` — The component own look.
    - `elevated` — Surface with shadow: it lifts off the content.
    - `glass` — Translucent surface with backdrop blur (glass effect).
    - `flat` — No background, border or shadow: it blends into the page.

### `SiremUserMenu`

Selector: `sirem-user-menu` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/user-menu)

Profile dropdown menu (user data + actions). Actions can be declared with `groups` (grouped and with icons) or projected freely; any click inside the panel closes it. Usage:

#### Inputs

- **`userName`** · `string` · _required_
    User's name; source of the avatar initials.
- **`userDetail`** · `string` · _default `''`_
    Secondary line under the name (position, site…).
- **`avatarSrc`** · `string | null`
    Profile photo URL; if missing, the initials are used.
- **`avatarBg`** · `string` · _default `''`_
    Background color of the initials (optional; uses the primary by default).
- **`avatarText`** · `string` · _default `''`_
    Forced avatar text (e.g. initials `JP` from a short name); if empty they are derived from `userName`.
- **`groups`** · `SiremUserMenuGroup[]` · _default `[]`_
    Action groups with icons (alternative to projecting content).

#### Outputs

- **`actionPressed`** · `SiremUserMenuAction`
    Emitted with the chosen menu action.
    - **Returns:**
      - `label` · `string` — Text of the action.
      - `icon?` · `string` — CSS class of the icon (e.g. `fi fi-rr-user`).
      - `svg?` · `string` — Inline SVG (duotone / streamline). Takes precedence over `icon`.
      - `danger?` · `boolean` — Marks the action as dangerous (e.g. log out).
      - `disabled?` · `boolean` — Disables the action.
      - `value?` · `any` — Free-form data returned in `actionPressed`.

#### Types & schemas

- **`SiremUserMenuGroup`** · _interface_
    Optional group of actions (with title and automatic separator).
    - **Fields:**
        - `title?` · `string`
        - `actions` · `SiremUserMenuAction[]`
- **`SiremUserMenuAction`** · _interface_
    Action of the user menu.
    - **Fields:**
        - `label` · `string` — Text of the action.
        - `icon?` · `string` — CSS class of the icon (e.g. `fi fi-rr-user`).
        - `svg?` · `string` — Inline SVG (duotone / streamline). Takes precedence over `icon`.
        - `danger?` · `boolean` — Marks the action as dangerous (e.g. log out).
        - `disabled?` · `boolean` — Disables the action.
        - `value?` · `any` — Free-form data returned in `actionPressed`.

## Directives

Standalone directives applied to existing elements.

### `SiremAutofocusDirective`

Selector: `[siremAutofocus]` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/autofocus)

Focuses the host element when it comes into view. Usage:

#### Inputs

- **`siremAutofocus`** · `boolean` · _default `true`_
    Enables/disables autofocus (default true).
- **`siremAutofocusDelay`** · `number` · _default `0`_
    Delay in ms before focusing (default 0).

### `SiremClickOutsideDirective`

Selector: `[siremClickOutside]` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/click-outside)

Emits when the user clicks outside the host element. Ideal for closing menus, palettes and dropdowns. Usage:

#### Outputs

- **`siremClickOutside`** · `PointerEvent`
    Emitted with the `PointerEvent` when clicked outside the host.
    - **Returns:** Native pointer event.

### `SiremNumbersOnlyDirective`

Selector: `input[siremNumbersOnly]` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/numbers-only)

Restricts an `<input>` to digits (optionally one decimal). Useful for documents, phones and numeric values. Usage:

#### Inputs

- **`siremNumbersAllowDecimal`** · `boolean` · _default `false`_
    Allows a decimal point (default false).

### `SiremOverlayTrigger`

Selector: `[siremOverlay]` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/overlay)

Opens an overlay (context menu, option list, detail card, sidebar/navbar sub-items) in an **upper layer**, so no ancestor `overflow: hidden` clips it.

#### Inputs

- **`siremOverlay`** · `TemplateRef<unknown> | null`
    Template with the panel content. `null` disables the directive.
- **`siremOverlayData`** · `unknown`
    Context that the template receives when instantiated.
- **`siremOverlayTrigger`** · `SiremOverlayTriggerType` · _default `'click'`_
    Event that opens the panel.
    - **Values:**
      - `click` — A single click. It is the default value and the most common one.
      - `dblclick` — Double click. Prevents opening the menu on the first press.
      - `contextmenu` — Right click. The panel appears under the pointer and the browser menu does not appear.
      - `longpress` — Hold for the duration of `siremOverlayLongPressMs`.
      - `hover` — The pointer enters and stays `siremOverlayHoverDelayMs` over the element.
      - `manual` — Ignores mouse events; it only responds to `[(open)]` from code.
- **`siremOverlayPlacement`** · `SiremOverlayPlacement` · _default `'bottom-start'`_
    Desired side and alignment.
    - **Values:**
      - `top` — Above the trigger, centered.
      - `top-start` — Above, aligned to its start.
      - `top-end` — Above, aligned to its end.
      - `bottom` — Below the trigger, centered.
      - `bottom-start` — Below, aligned to its start. Default value.
      - `bottom-end` — Below, aligned to its end.
      - `left` — To the left, vertically centered.
      - `right` — To the right, vertically centered.
      - `inline-start` — At the start of the line: left in LTR, right in RTL.
      - `inline-end` — At the end of the line: right in LTR, left in RTL.
- **`siremOverlayOffset`** · `number` · _default `8`_
    Spacing in px from the trigger.
- **`siremOverlayViewportPadding`** · `number` · _default `8`_
    Margin the panel always leaves against the viewport edges.
- **`siremOverlayLongPressMs`** · `number` · _default `500`_
    Milliseconds to hold (`longpress`).
- **`siremOverlayHoverDelayMs`** · `number` · _default `250`_
    Wait with the pointer over it before opening (`hover`).
- **`siremOverlayHoverHideDelayMs`** · `number` · _default `200`_
    Wait after the pointer leaves the trigger before closing (`hover`). Gives time to enter the panel, which lives outside the element.
- **`siremOverlayClickDelayMs`** · `number` · _default `0`_
    Delay before opening with `click`; useful as a debounce. `0` opens right away.
- **`siremOverlayFlip`** · `boolean` · _default `true`_
    Flips to the opposite side when the preferred one does not fit.
- **`siremOverlayShift`** · `boolean` · _default `true`_
    Offsets on the cross axis so it does not invade the opposite border.
- **`siremOverlayMatchTriggerWidth`** · `boolean` · _default `false`_
    Matches the panel width to the trigger (combos and selectors).
- **`siremOverlayCloseOnOutsideClick`** · `boolean` · _default `true`_
    Closes on click outside the panel.
- **`siremOverlayCloseOnEscape`** · `boolean` · _default `true`_
    Closes with the Escape key.
- **`siremOverlayRepositionOnScroll`** · `boolean` · _default `true`_
    Repositions on scroll or resize; with `false`, it closes.
- **`open`** · `boolean` · _default `false`_
    Opening state, controllable with two-way binding.

#### Outputs

- **`opened`** · `void`
    Emitted when the panel opens.
    - **Returns:** Emits no data: the event carries no payload.
- **`closed`** · `void`
    Emitted when the panel closes.
    - **Returns:** Emits no data: the event carries no payload.

#### Types & schemas

- **`SiremOverlayTriggerType`** · _union_
    Event that opens the overlay.
    - **Definition:** `'click' | 'dblclick' | 'contextmenu' | 'longpress' | 'hover' | 'manual'`
    - `click` — A single click. It is the default value and the most common one.
    - `dblclick` — Double click. Prevents opening the menu on the first press.
    - `contextmenu` — Right click. The panel appears under the pointer and the browser menu does not appear.
    - `longpress` — Hold for the duration of `siremOverlayLongPressMs`.
    - `hover` — The pointer enters and stays `siremOverlayHoverDelayMs` over the element.
    - `manual` — Ignores mouse events; it only responds to `[(open)]` from code.
- **`SiremOverlayPlacement`** · _alias_
    Allowed combination of side and alignment.
    - **Definition:** `SiremOverlaySide | 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end' | 'left-start' | 'left-center' | 'left-end' | 'right-start' | 'right-center' | 'right-end'`
- **`SiremOverlaySide`** · _union_
    Side of the trigger the panel opens from.
    - **Definition:** `'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end'`
    - `top`
    - `bottom`
    - `left`
    - `right`
    - `inline-start`
    - `inline-end`

### `SiremSticky`

Selector: `[siremSticky]` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/sticky)

Turns any element or component into **sticky** (`position: sticky`), either open or bounded by a limit…

#### Inputs

- **`siremSticky`** · `boolean` · _default `true`_
    Enables pinning (`position: sticky`).
- **`siremStickyOffset`** · `number` · _default `0`_
    Gap to the top edge of the scroll container, in px.
- **`siremStickyLimit`** · `number | null, unknown`
    Maximum pinned travel, in px, before releasing. `null` (default) = no limit. Example: `[siremStickyLimit]="160"`.
- **`siremStickyBoundary`** · `SiremStickyBoundary | null`
    Element whose **bottom edge** limits pinning: the piece detaches up to it and then follows it. Accepts an element, `ElementRef` or CSS selector (`'#fin'`). `null` (default) = no component limit.
- **`siremStickyZIndex`** · `number` · _default `30`_
    `z-index` while pinned.

#### Outputs

- **`siremStickyChange`** · `boolean`
    Emitted when it pins (`true`) and releases (`false`).

#### Types & schemas

- **`SiremStickyBoundary`** · _alias_
    Element that limits pinning (or a CSS selector that resolves it).
    - **Definition:** `HTMLElement | ElementRef<HTMLElement> | string`

### `SiremTooltipDirective`

Selector: `[siremTooltip]` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/tooltip)

Dark floating tooltip with an arrow (Bento reference). It appears on hover or when the element is focused and is announced to screen readers via `aria-describedby` + `role="tooltip"`…

#### Inputs

- **`siremTooltip`** · `string | null`
    Balloon text. `null`/empty shows nothing.
- **`siremTooltipPlacement`** · `SiremTooltipPlacement` · _default `'top'`_
    Side of the element where it is placed.
    - **Values:**
      - `top` — Above the element.
      - `bottom` — Below the element.
      - `left` — To the left.
      - `right` — To the right.
- **`siremTooltipDelay`** · `number` · _default `120`_
    Appearance delay in ms (0 = immediate).
- **`siremTooltipDisabled`** · `boolean` · _default `false`_
    Disables the tooltip without removing the attribute.

#### Types & schemas

- **`SiremTooltipPlacement`** · _union_
    Side the tooltip appears on.
    - **Definition:** `'top' | 'bottom' | 'left' | 'right'`
    - `top` — Above the element.
    - `bottom` — Below the element.
    - `left` — To the left.
    - `right` — To the right.

## Pipes

Standalone template pipes.

### `SiremAgePipe`

Selector: `pipe siremAge` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/age)

Computes the age in years from an ISO birth date. Usage: `{{ '1990-05-01' | siremAge }}` → `35 años`

#### Parameters

- **`value`** · `string | Date | null | undefined` · _required_
    Birth date, in ISO `yyyy-MM-dd` or as `Date`.

### `SiremMoneyPipe`

Selector: `pipe siremMoney` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/money)

Formats a value as es-CO currency without decimals. Usage: `{{ 250000 | siremMoney }}` → `$ 250.000`

#### Parameters

- **`value`** · `number | string | null | undefined` · _required_
    Amount, as a number or text (`'250000'`).
- **`currencyCode`** · `string` · _default `'COP'`_
    ISO 4217 currency of the format (`COP` by default).

### `SiremPhonePipe`

Selector: `pipe siremPhone` · [Demo](https://deorta-dev.github.io/ng-sirem-ui/demo/phone)

Formats a 10-digit Colombian phone into 3-3-4 blocks. Usage: `{{ '3001112233' | siremPhone }}` → `300 111 2233`

#### Parameters

- **`value`** · `string | number | null | undefined` · _required_
    10-digit phone; separators are ignored.

## HTTP interceptors

`HttpInterceptorFn` functions registered with
`provideHttpClient(withInterceptors([...]))`.

### `siremAuthInterceptor`

Adds `Authorization: Bearer <token>` to every request when the configured
provider returns a token. Configure it with
`provideSiremAuth(() => string | null)` (no token by default).

```ts
providers: [
  provideHttpClient(withInterceptors([siremAuthInterceptor])),
  provideSiremAuth(() => localStorage.getItem('token')),
]
```

### `siremBaseUrlInterceptor`

Prefixes relative requests (`/api/...`) with the base URL; absolute URLs
(`http…`) pass through untouched. It is the natural companion of the
`optionsEndpoint` remote fields. Configure it with
`provideSiremApiUrl('https://api.sirem.com')`.

```ts
providers: [
  provideHttpClient(withInterceptors([siremBaseUrlInterceptor])),
  provideSiremApiUrl('https://api.sirem.com'),
]
```

## Development

Repo commands (library + demo):

```bash
npm start            # demo catalogue → http://localhost:4200
npm run build:lib    # ng build deorta-sirem-ui → dist/
npm run build        # library + demo
npm test             # vitest (library + demo)
```

## Publishing to npm

```bash
npm login            # once per machine (browser; OTP if 2FA is on)
npm run publish:lib  # build, bump the version (patch) and publish dist/
```

`publish:lib` bumps the version automatically before publishing (`0.1.2` →
`0.1.3`). If the build or the publish fails, the version is restored, so no
number is wasted. To choose the bump:

```bash
npm run publish:lib -- minor        # 0.1.2 → 0.2.0
npm run publish:lib -- major        # 0.1.2 → 1.0.0
npm run publish:lib -- 1.0.0-rc.1   # exact version
npm run publish:lib -- --dry-run    # rehearsal: builds, does not publish
npm run publish:lib -- --no-bump    # republish the current version
```

Shortcuts `npm run publish:lib:minor` and `npm run publish:lib:major` are also
available. The script creates no commit or tag: after publishing, commit the
library `package.json` (and tag `vX.Y.Z` if you use tags).

The package is published as `@deorta-dev/ng-sirem-ui` and contains the library only
(`dist/deorta-sirem-ui`), not the demo. It ships the token stylesheet at
`src/lib/theme/sirem-theme.css` (short alias: `@deorta-dev/ng-sirem-ui/theme.css`);
Angular, `codemirror`, `rxjs` and `echarts` are `peerDependencies`, so a
consumer only installs the package plus its peers. To inspect the tarball
before publishing: `npm run pack:lib`.

## Attribution

When you ship an app using the library: `Uicons by [Flaticon](https://www.flaticon.com/uicons)` plus the Streamline credit required by the set you use (see `docs/STREAMLINE.md`).
