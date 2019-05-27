import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { FilterInfo } from '../../classes/filter-info';
import { FilterType } from '../../enums/filterTypes';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'tb-date-filter',
    templateUrl: './date-filter.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateFilterComponent {
    @Input() info: FilterInfo;
    change$  = new EventEmitter();
    @Output() filter$ = this.change$.pipe(debounceTime(250));
    FilterType = FilterType;
    filterType: FilterType;
    @Input() set  CurrentFilterType(ft: FilterType) {
      this.filterType = ft;
      if (ft === FilterType.DateBetween) {
        this.info.filterValue = {};
      }
    }
}
