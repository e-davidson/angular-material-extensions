import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MetaData } from '../../interfaces/report-def';
import { Observable } from 'rxjs';
import { TableStateManager } from '../../classes/table-state-manager';
import { FilterInfo } from '../../classes/filter-info';

@Component({
    selector: 'tb-filter-displayer',
    templateUrl: './gen-filter-displayer.component.html',
    styleUrls: ['./gen-filter-displayer.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenFilterDisplayerComponent {

  constructor( public tableState: TableStateManager) {
  }

    @Input() filterCols$: Observable<MetaData[]>;
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
