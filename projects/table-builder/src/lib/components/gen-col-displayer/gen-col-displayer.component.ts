import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { DisplayCol } from '../../classes/display-col';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'tb-col-displayer',
  templateUrl: './gen-col-displayer.component.html',
  styleUrls: ['./gen-col-displayer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenColDisplayerComponent {

  displayCols$: Observable<DisplayCol[]>;
  @Output() update: EventEmitter<string[]> = new EventEmitter();
  @Input() set cols(c: Observable<string[]>) {
    this.displayCols$ = c.pipe(
      map(cols => cols.map(col => {
        return { name: col, isVisible: true };
      }))
    );
  }

  stopClickPropagate(event: any) {
    event.stopPropagation();
    event.preventDefault();
  }

  reset(displayCols: DisplayCol[]) {
    displayCols.forEach(c => c.isVisible = true);
    this.emit(displayCols);
  }

  unset(displayCols: DisplayCol[]) {
    displayCols.forEach(c => c.isVisible = false);
    this.emit(displayCols);
  }

  emit(displayCols: DisplayCol[]) {
    this.update.emit(displayCols.filter(col => col.isVisible).map(col => col.name));
  }
}
