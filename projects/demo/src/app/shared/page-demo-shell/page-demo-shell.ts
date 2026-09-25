import { Component, ElementRef, computed, input, signal, viewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiremButton, SiremModal } from 'deorta-sirem-ui';
import { CodeViewer } from '../code-viewer/code-viewer';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

export type DemoCodeLanguage = 'html' | 'typescript' | 'json';

export interface DemoCodeFile {
  name: string;
  language: DemoCodeLanguage;
  code: string;
}

/**
 * Presentación a pantalla completa para los ejemplos de la sección Páginas.
 * La página ocupa toda la ventana y el código se abre desde una barra fija
 * compacta, con un archivo por pestaña dentro de un modal tipo IDE.
 */
@Component({
  selector: 'app-page-demo-shell',
  standalone: true,
  imports: [CodeViewer, RouterLink, SiremButton, SiremModal, ThemeToggle],
  template: `
    <div class="min-h-[100dvh] bg-slate-100 dark:bg-slate-950">
      <div class="min-h-[100dvh] pb-12">
        <ng-content />
      </div>

      <footer
        class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-1.5 shadow-[0_-8px_24px_rgb(15_23_42/0.08)] backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95"
        style="padding-bottom: calc(0.375rem + env(safe-area-inset-bottom))"
      >
        <div class="mx-auto flex min-h-8 max-w-screen-2xl items-center gap-2">
          <a
            routerLink="/"
            class="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sirem-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Volver al catálogo"
          >
            <span aria-hidden="true">←</span>
            <span class="hidden sm:inline">Catálogo</span>
          </a>

          <span
            class="hidden truncate text-xs font-medium text-slate-500 sm:inline dark:text-slate-400"
          >
            {{ label() }}
          </span>

          <span class="ml-auto">
            <app-theme-toggle />
          </span>

          <sirem-button size="sm" (pressed)="codeOpen.set(true)">
            <i slot="icon" class="fi fi-rr-eye" aria-hidden="true"></i>
            Ver código
          </sirem-button>
        </div>
      </footer>

      <sirem-modal [(open)]="codeOpen" [title]="modalTitle()" size="xl">
        <div
          class="flex h-[62dvh] min-h-[18rem] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
        >
          <div
            class="flex min-h-11 items-end overflow-hidden border-b border-slate-700 bg-slate-900"
          >
            <div
              role="tablist"
              class="flex min-w-0 flex-1 overflow-x-auto"
              [attr.aria-label]="'Archivos de ' + label()"
              (keydown)="onTabKeydown($event)"
            >
              @for (file of files(); track file.name; let index = $index) {
                <button
                  #fileTab
                  type="button"
                  role="tab"
                  class="flex h-10 min-w-[9rem] items-center gap-2 border-r border-t-2 border-slate-700 px-3 text-left text-xs transition-colors hover:bg-slate-800 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sirem-500"
                  [class.border-t-transparent]="activeIndex() !== index"
                  [class.bg-slate-900]="activeIndex() !== index"
                  [class.text-slate-400]="activeIndex() !== index"
                  [class.border-t-sirem-500]="activeIndex() === index"
                  [class.bg-slate-800]="activeIndex() === index"
                  [class.text-white]="activeIndex() === index"
                  [style.box-shadow]="
                    activeIndex() === index ? 'inset 0 -2px 0 0 var(--color-sirem-500)' : null
                  "
                  [attr.id]="tabId(index)"
                  [attr.aria-selected]="activeIndex() === index"
                  [attr.aria-controls]="panelId"
                  [attr.tabindex]="activeIndex() === index ? 0 : -1"
                  (click)="activeIndex.set(index)"
                >
                  <span
                    class="flex h-5 w-7 shrink-0 items-center justify-center rounded text-[9px] font-extrabold tracking-wide text-white"
                    [class.bg-orange-500]="file.language === 'html'"
                    [class.bg-sky-500]="file.language === 'typescript'"
                    [class.bg-amber-500]="file.language === 'json'"
                  >
                    {{ fileType(file.language) }}
                  </span>
                  <span class="truncate font-medium">{{ file.name }}</span>
                </button>
              }
            </div>
          </div>

          @if (activeFile(); as file) {
            <div
              [id]="panelId"
              role="tabpanel"
              class="min-h-0 flex-1 bg-slate-950"
              [attr.aria-labelledby]="tabId(activeIndex())"
            >
              <app-code-viewer
                class="block h-full w-full"
                [code]="file.code"
                [language]="file.language"
                [fill]="true"
              />
            </div>
          }
        </div>
      </sirem-modal>
    </div>
  `,
})
export class PageDemoShell {
  readonly label = input.required<string>();
  readonly files = input.required<DemoCodeFile[]>();

  readonly codeOpen = signal(false);
  readonly activeIndex = signal(0);
  readonly modalTitle = computed(() => `Código · ${this.label()}`);
  readonly activeFile = computed(() => this.files()[this.activeIndex()] ?? this.files()[0]);

  readonly panelId = 'page-demo-code-panel';
  private readonly tabs = viewChildren<ElementRef<HTMLButtonElement>>('fileTab');

  fileType(language: DemoCodeLanguage): string {
    return language === 'typescript' ? 'TS' : language.toUpperCase();
  }

  tabId(index: number): string {
    return `page-demo-code-tab-${index}`;
  }

  onTabKeydown(event: KeyboardEvent): void {
    const count = this.files().length;
    if (!count) return;

    let next = this.activeIndex();
    switch (event.key) {
      case 'ArrowRight':
        next = (next + 1) % count;
        break;
      case 'ArrowLeft':
        next = (next - 1 + count) % count;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.activeIndex.set(next);
    queueMicrotask(() => this.tabs()[next]?.nativeElement.focus());
  }
}
