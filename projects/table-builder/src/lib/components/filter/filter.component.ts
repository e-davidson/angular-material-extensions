import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { filterTypeMap, FilterInfo, UnmappedTypes, mappedFieldTypes, PartialFilter } from '../../classes/filter-info';
import { TableStore } from '../../classes/table-store';
import { FilterType } from '../../enums/filterTypes';
import { FieldType } from '../../interfaces/report-def';


type thingy = Omit<FieldType,UnmappedTypes>

@Component({
    selector: 'tb-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent<T extends mappedFieldTypes = any> {
  filterTypes = filterTypeMap;
  FilterType = FilterType;
  FieldType = FieldType;
  @Input() filter!: PartialFilter;;
  @Output() close = new EventEmitter();
  currentFilterType?: FilterType;
  constructor( public state: TableStore) { }

  ngOnInit() {
    this.currentFilterType = this.filter.filterType;
  }
  onEnter(filter: FilterInfo, event: any) {
    event.preventDefault();
    if (filter.filterValue != null && filter.filterType) {
      this.state.addFilter(filter);
      this.close.emit();
    }
  }
}
