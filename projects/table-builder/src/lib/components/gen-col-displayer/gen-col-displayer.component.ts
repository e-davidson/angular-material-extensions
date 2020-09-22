import { Component, ChangeDetectionStrategy} from '@angular/core';
import { DisplayCol } from '../../classes/display-col';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TableStateManager } from '../../classes/table-state-manager';
import { FieldType } from '../../interfaces/report-def';

@Component({
  selector: 'tb-col-displayer',
  templateUrl: './gen-col-displayer.component.html',
  styleUrls: ['./gen-col-displayer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenColDisplayerComponent {
  columns$: Observable< DisplayCol[]>;
  constructor( private tableState: TableStateManager) {
    this.columns$ = this.tableState.state$.pipe(
      map( state =>
        state.metaData
          .filter( md => md.fieldType !== FieldType.Hidden )
          .map( md => ({
            key: md.key,
            displayName: md.displayName,
            isVisible: !state.hiddenKeys.includes(md.key)
          }))
      ),
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
    this.tableState.setHiddenColumns(displayCols.map( c => ({key: c.key, visible: c.isVisible})));
  }
}
