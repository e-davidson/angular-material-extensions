import { Directive } from '@angular/core';
import { Subject } from 'rxjs';

@Directive({
  selector: 'button[clickSubject]',
  exportAs: 'clickSubject',
  host: {
    '(click)': 'next(true)'
  }
}) export class DialogOpenDirective extends Subject<any> {
  // TODO: add explicit constructor
}
