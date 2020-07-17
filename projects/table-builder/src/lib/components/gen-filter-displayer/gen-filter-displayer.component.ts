import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MetaData, FieldType } from '../../interfaces/report-def';
import { Observable } from 'rxjs';
import { TableStateManager } from '../../classes/table-state-manager';
import { FilterInfo } from '../../classes/filter-info';
import { map } from 'rxjs/operators';

@Component({
    selector: 'tb-filter-displayer',
    templateUrl: './gen-filter-displayer.component.html',
    styleUrls: ['./gen-filter-displayer.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenFilterDisplayerComponent {

  constructor( public tableState: TableStateManager) {
    this.filterCols$ = tableState.metaDatas$.pipe(
      map(md => md.filter(m => (m.fieldType !== FieldType.Hidden) && (!m.noFilter))),
    );
  }

    filterCols$: Observable<MetaData[]>;
    currentFilters: FilterInfo[] = [];


    deleteByIndex(index: number) {
      this.currentFilters.splice(index, 1);
    }

    clearAll() {
        this.currentFilters = [];
    }

    addFilter(metaData: MetaData) {
      this.currentFilters.push({key: metaData.key, fieldType: metaData.fieldType});
    }
}
