import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { filterTypeMap, FilterInfo } from '../../classes/filter-info';
import { FilterType } from '../../enums/filterTypes';
import { FieldType } from '../../interfaces/report-def';
import { TableStateManager } from '../../classes/table-state-manager';

@Component({
    selector: 'tb-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent {
  filterTypes = filterTypeMap;
  FilterType = FilterType;
  FieldType = FieldType;
  @Input() filter: FilterInfo;
  @Output() close = new EventEmitter();
  currentFilterType: FilterType;
  constructor( public state: TableStateManager) { }

  ngOnInit() {
    this.currentFilterType = this.filter.filterType;
  }
  onEnter(filter: FilterInfo, event) {
    event.preventDefault();
    if (filter.filterValue && filter.filterType) {
      this.state.addFilter(filter);
    }
  }
}
