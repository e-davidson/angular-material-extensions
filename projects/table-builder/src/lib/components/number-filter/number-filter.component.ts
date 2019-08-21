import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FilterInfo } from '../../classes/filter-info';
import { debounceTime } from 'rxjs/operators';
import { FilterType } from '../../enums/filterTypes';


@Component({
  selector: 'tb-number-filter',
  templateUrl: './number-filter.component.html',
  styleUrls: ['./number-filter.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumberFilterComponent implements OnInit {
  @Input() info: FilterInfo;
  change$ = new EventEmitter();
  @Output() filter$ = this.change$.pipe(debounceTime(250));
  FilterType = FilterType;

  @Input() set CurrentFilterType(ft: FilterType) {
    if (ft === FilterType.NumberBetween) {
      this.info.filterValue = {};
    }
  }

  constructor() { }

  ngOnInit() {
  }

}
