import { Component, ChangeDetectionStrategy} from '@angular/core';
import { DisplayCol } from '../../classes/display-col';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TableStore } from '../../classes/table-store';
import { FieldType } from '../../interfaces/report-def';
import {CdkDragDrop} from '@angular/cdk/drag-drop';

@Component({
  selector: 'tb-col-displayer',
  templateUrl: './gen-col-displayer.component.html',
  styleUrls: ['./gen-col-displayer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenColDisplayerComponent {
  columns$: Observable< DisplayCol[]>;
  constructor( private tableState: TableStore ) {
    this.columns$ = this.tableState.state$.pipe(
      map( state =>
        tableState.orderMetaData
          (state.metaData)
          .filter( md => md.fieldType !== FieldType.Hidden )
          .map( md => ({
            key: md.key,
            displayName: md.displayName,
            isVisible: !state.hiddenKeys.includes(md.key)
          }))
      ),
    );
  }

  reset(displayCols: DisplayCol[]) {
    displayCols.forEach(c => c.isVisible = true);
    this.emit(displayCols);
  }
  drop(event: CdkDragDrop<string[]>) {
    this.tableState.setUserDefinedOrder({key:event.item.data.key,newOrder:event.currentIndex})
  }
  unset(displayCols: DisplayCol[]) {
    displayCols.forEach(c => c.isVisible = false);
    this.emit(displayCols);
  }

  emit(displayCols: DisplayCol[]) {
    this.tableState.setHiddenColumns(displayCols.map( c => ({key: c.key, visible: c.isVisible})));
  }
}
