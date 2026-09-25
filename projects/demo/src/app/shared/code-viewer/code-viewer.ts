import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { themeMode } from '../theme/theme';

/**
 * Visor de código solo-lectura con CodeMirror 6.
 * Sigue el tema global de la demo: claro con el tema base de
 * CodeMirror, oscuro con One Dark (persistido en localStorage).
 *
 * ```html
 * <app-code-viewer [code]="htmlCode" language="html" />
 * <app-code-viewer [code]="tsCode" language="typescript" />
 * ```
 */
@Component({
  selector: 'app-code-viewer',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="cm-host">
      <div class="cm-bar">
        <span class="cm-lang">{{ language() }}</span>
        <button type="button" class="cm-copy" (click)="copy()">{{ copied() ? 'Copiado ✓' : 'Copiar' }}</button>
      </div>
      <div #editor class="cm-editor"></div>
    </div>
  `,
  styles: [
    `
      .cm-host {
        border: 1px solid #e2e8f0;
        border-radius: 0.6rem;
        overflow: hidden;
        background: #ffffff;
      }
      .cm-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.35rem 0.7rem;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
      }
      .cm-lang {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #1d64f1;
      }
      .cm-copy {
        font-size: 0.72rem;
        padding: 0.15rem 0.6rem;
        border-radius: 0.4rem;
        background: #e2e8f0;
        color: #0f172a;
        cursor: pointer;
      }
      .cm-copy:hover {
        background: #cbd5e1;
      }
      .cm-editor .cm-editor {
        background: #ffffff;
      }
      .cm-editor .cm-scroller {
        max-height: 300px;
        overflow: auto;
      }
      :root[data-theme='dark'] .cm-host {
        border-color: #1e293b;
        background: #0f172a;
      }
      :root[data-theme='dark'] .cm-bar {
        background: #020617;
        border-bottom-color: #1e293b;
      }
      :root[data-theme='dark'] .cm-lang {
        color: #93c5fd;
      }
      :root[data-theme='dark'] .cm-copy {
        background: #1e293b;
        color: #e2e8f0;
      }
      :root[data-theme='dark'] .cm-copy:hover {
        background: #334155;
      }
      :root[data-theme='dark'] .cm-editor .cm-editor {
        background: #0f172a;
      }
    `,
  ],
})
export class CodeViewer implements AfterViewInit, OnChanges {
  readonly code = input<string>('');
  readonly language = input<'html' | 'typescript' | 'json'>('html');

  private readonly editorRef = viewChild<ElementRef<HTMLDivElement>>('editor');
  private view: EditorView | null = null;
  readonly copied = signal(false);

  constructor() {
    // Reconstruye el editor al cambiar el tema global.
    effect(() => {
      themeMode();
      if (this.editorRef()) this.build();
    });
  }

  private langExt() {
    if (this.language() === 'html') return html();
    return javascript({ typescript: true });
  }

  private isDark() {
    return themeMode() === 'dark';
  }

  private build() {
    const host = this.editorRef()?.nativeElement;
    if (!host) return;
    this.view?.destroy();
    const extensions = [basicSetup, this.langExt(), EditorView.editable.of(false)];
    if (this.isDark()) extensions.push(oneDark);
    this.view = new EditorView({
      parent: host,
      state: EditorState.create({ doc: this.code(), extensions }),
    });
  }

  ngAfterViewInit() {
    // Pequeño defer para que el DOM del host exista.
    queueMicrotask(() => this.build());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.view) return;
    if (changes['code'] || changes['language']) this.build();
  }

  async copy() {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      /* portapapeles no disponible */
    }
  }
}
