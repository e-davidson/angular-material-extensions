import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MetaData, FieldType } from '../../interfaces/report-def';
import { Observable } from 'rxjs';
import { TableStore } from '../../classes/table-store';
import { FilterInfo } from '../../classes/filter-info';
import { map } from 'rxjs/operators';

@Component({
    selector: 'tb-filter-displayer',
    templateUrl: './gen-filter-displayer.component.html',
    styleUrls: ['./gen-filter-displayer.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenFilterDisplayerComponent {

  constructor( public tableState: TableStore) {
    this.filterCols$ =  tableState.metaDataArray$.pipe(
      map(md => Object.values( md ).filter(m => (m.fieldType !== FieldType.Hidden) && (!m.noFilter))),
    );
  }

    filterCols$: Observable<MetaData[]>;
    filters$ = this.tableState.filters$.pipe(map( filters => Object.values(filters)));
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
