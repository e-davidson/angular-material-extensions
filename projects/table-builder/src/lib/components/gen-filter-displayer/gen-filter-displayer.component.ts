import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { MetaData } from '../../interfaces/report-def';
import { FilterInfo } from '../../classes/filter-info';
import { Observable } from 'rxjs';

@Component({
    selector: 'tb-filter-displayer',
    templateUrl: './gen-filter-displayer.component.html',
    styleUrls: ['./gen-filter-displayer.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenFilterDisplayerComponent {

    @Input() filterCols$: Observable<MetaData[]>;
    @Output() filters$ = new EventEmitter<FilterInfo[]>();
    currentFilters: FilterInfo[] = [];

    RefreshFilters() {
      this.filters$.next(
        this.currentFilters.filter(f => f.filterValue !== undefined )
      );
    }

    deleteByIndex(index: number) {
      this.currentFilters.splice(index, 1);
      this.RefreshFilters();
    }

    clearAll() {
        this.currentFilters = [];
        this.RefreshFilters();
    }

    addFilter(filter: MetaData) {
      this.currentFilters.push( {key: filter.key, fieldType: filter.fieldType});
      this.RefreshFilters();
    }
}
