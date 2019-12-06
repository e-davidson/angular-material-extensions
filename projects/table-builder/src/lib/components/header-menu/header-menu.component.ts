import { ChangeDetectionStrategy, Component, Input, EventEmitter, Output } from '@angular/core';
import { FieldType, MetaData } from '../../interfaces/report-def';
import { FilterType } from '../../enums/filterTypes';
import { FilterInfo } from '../../classes/filter-info';
import { debounceTime } from 'rxjs/operators';
import { TableStateManager } from '../../classes/table-state-manager';

@Component({
  selector: 'tb-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderMenuComponent {
  FieldType = FieldType;
  FilterType = FilterType;

  @Input() filter: FilterInfo;

  @Input() metaData: MetaData;
  change$  = new EventEmitter();
  @Output() filter$ = this.change$.pipe(debounceTime(250));

  constructor( private tableState: TableStateManager) {}

  hideField(key) {
    this.tableState.hideColumn(key);
  }

  ngOnInit() {
    this.resetFilterType();
  }

  resetFilterType() {
    switch (this.metaData.fieldType) {
      case FieldType.String:
      case FieldType.Array:
      case FieldType.Unknown:
        this.filter.filterType = FilterType.StringContains;
        break;
      case FieldType.Currency:
      case FieldType.Number:
        this.filter.filterType = FilterType.NumberEquals;
        break;
      case FieldType.Boolean:
          this.filter.filterType = FilterType.BooleanEquals;
          break;
      case FieldType.Date:
          this.filter.filterType = FilterType.DateIsOn;
          break;
    }
  }

  saveFilter() {
    this.tableState.addFilter(this.filter);
  }

  setFilterType(filterType: FilterType) {
    if (filterType === this.filter.filterType) {
      this.resetFilterType();
    } else {
      this.filter.filterType = filterType;
    }
    this.change$.emit();
  }

  stopClickPropagate(event: any) {
    event.stopPropagation();
    event.preventDefault();
  }
}
