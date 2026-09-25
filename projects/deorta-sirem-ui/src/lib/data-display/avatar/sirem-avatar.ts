import { Component, computed, input } from '@angular/core';

export type SiremAvatarSize = 'xs' | 'sm' | 'md' | 'lg';
export type SiremPresenceTone = 'success' | 'warning' | 'danger' | 'neutral' | null;

/**
 * Avatar con imagen o iniciales + punto de presencia/estado.
 * (Listas de pacientes, terceros, usuarios.)
 */
@Component({
  selector: 'sirem-avatar',
  standalone: true,
  styleUrl: './sirem-avatar.scss',
  template: `
    <span class="sirem-avatar" [attr.aria-label]="label() ?? null" role="img">
      @if (src()) {
        <img [src]="src()" [alt]="name()" [class]="box()" />
      } @else {
        <span [class]="box() + ' sirem-avatar__initials'" aria-hidden="true">
          {{ initials() }}
        </span>
      }
      @if (presence()) {
        <span [class]="'sirem-avatar__dot ' + dot() + ' ' + presenceClass()" aria-hidden="true"></span>
      }
    </span>
  `,
})
export class SiremAvatar {
  readonly name = input('');
  readonly src = input<string | null>(null);
  readonly size = input<SiremAvatarSize>('md');
  readonly presence = input<SiremPresenceTone>(null);
  readonly label = input<string | null>(null);

  private readonly boxes: Record<SiremAvatarSize, string> = {
    xs: 'sirem-avatar__box sirem-avatar__box--xs',
    sm: 'sirem-avatar__box sirem-avatar__box--sm',
    md: 'sirem-avatar__box sirem-avatar__box--md',
    lg: 'sirem-avatar__box sirem-avatar__box--lg',
  };

  private readonly tones: Record<Exclude<SiremPresenceTone, null>, string> = {
    success: 'sirem-avatar__dot--success',
    warning: 'sirem-avatar__dot--warning',
    danger: 'sirem-avatar__dot--danger',
    neutral: 'sirem-avatar__dot--neutral',
  };

  readonly box = computed(() => this.boxes[this.size()]);
  readonly dot = computed(() =>
    this.size() === 'lg' ? 'sirem-avatar__dot--lg' : 'sirem-avatar__dot--sm',
  );
  readonly presenceClass = computed(() => this.tones[this.presence() ?? 'neutral']);

  readonly initials = computed(() =>
    this.name()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('') || '•',
  );
}
