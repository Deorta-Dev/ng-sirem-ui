import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiremOverlayViewport } from '@deorta-dev/ng-sirem-ui';
import { DynamicToastViewportComponent } from 'ngx-dynamic-toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DynamicToastViewportComponent, SiremOverlayViewport],
  templateUrl: './app.html',
})
export class App {}
