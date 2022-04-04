import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'pr1s0nart-big-input',
  templateUrl: './big-input.component.html',
  styleUrls: ['./big-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BigInputComponent {
  @Input()
  placeholder = '';

  @Input()
  value = '';

  @Input()
  disabled = false;

  hasFocus = false;
}
