import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  effect,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';

export type SiremCodeLanguage = 'html' | 'typescript' | 'javascript' | 'json' | 'css';

/**
 * Editor de código con CodeMirror 6. Sigue el tema con `dark`
 * (igual que `sirem-chart`): claro por defecto, One Dark en oscuro.
 *
 * Uso:
 * ```html
 * <sirem-code-editor [(code)]="fuente" language="typescript" [dark]="esOscuro()" />
 * ```
 */
@Component({
  selector: 'sirem-code-editor',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './sirem-code-editor.scss',
  template: `
    <div class="sirem-codeed">
      @if (label()) {
        <label class="sirem-codeed__label">{{ label() }}</label>
      }
      <div class="sirem-codeed__bar" aria-hidden="true">
        <span class="sirem-codeed__dot"></span>
        <span class="sirem-codeed__dot"></span>
        <span class="sirem-codeed__dot"></span>
        <span class="sirem-codeed__lang">{{ language() }}</span>
      </div>
      <div #editor class="sirem-codeed__editor" [style.height.px]="height()"></div>
      @if (hint()) {
        <span class="sirem-codeed__hint">{{ hint() }}</span>
      }
    </div>
  `,
})
export class SiremCodeEditor implements AfterViewInit {
  /** Código fuente (doble vía). */
  readonly code = model('');
  readonly language = input<SiremCodeLanguage>('typescript');
  readonly label = input('');
  readonly hint = input('');
  /** Tema oscuro One Dark; en claro usa el tema base de CodeMirror. */
  readonly dark = input(false);
  readonly readonly = input(false);
  /** Alto del editor en px. */
  readonly height = input(240);

  private readonly editorRef = viewChild<ElementRef<HTMLDivElement>>('editor');
  private readonly destroyRef = inject(DestroyRef);
  private view: EditorView | null = null;
  private syncing = false;

  constructor() {
    // Reconstruye ante cambios de lenguaje/tema/modo; el doc se conserva.
    effect(() => {
      this.language();
      this.dark();
      this.readonly();
      if (this.editorRef()) this.build();
    });
    // Sincroniza ediciones externas (p. ej. reset del formulario).
    effect(() => {
      const next = this.code();
      const view = this.view;
      if (!view || this.syncing) return;
      if (view.state.doc.toString() === next) return;
      this.syncing = true;
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } });
      this.syncing = false;
    });
    this.destroyRef.onDestroy(() => this.view?.destroy());
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.build());
  }

  private langExt() {
    switch (this.language()) {
      case 'html':
        return html();
      case 'json':
        return json();
      case 'css':
        return css();
      default:
        return javascript({ typescript: true });
    }
  }

  private build(): void {
    const host = this.editorRef()?.nativeElement;
    if (!host) return;
    this.view?.destroy();
    const exts = [basicSetup, this.langExt(), EditorView.editable.of(!this.readonly())];
    if (this.dark()) exts.push(oneDark);
    exts.push(
      EditorView.updateListener.of((u) => {
        if (!u.docChanged || this.syncing) return;
        this.code.set(u.state.doc.toString());
      }),
    );
    this.view = new EditorView({
      parent: host,
      state: EditorState.create({ doc: this.code(), extensions: exts }),
    });
  }
}
