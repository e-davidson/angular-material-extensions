import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { FieldType, MetaData } from '../../interfaces/report-def';
import { FilterType } from '../../enums/filterTypes';
import { FilterInfo } from '../../classes/filter-info';
import { TableStore } from '../../classes/table-store';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'tb-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderMenuComponent {
  FieldType = FieldType;
  FilterType = FilterType;
  myFilterType: FilterType;
  myFilterValue: any;

  @Input() filter: FilterInfo;

  @Input() metaData: MetaData;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  constructor( public tableState: TableStore) {}

  hideField(key) {
    this.tableState.hideColumn(key);
  }

  ngOnInit() {
    this.resetFilterType();
  }

  resetFilterType() {
    if(this.metaData.additional?.FilterOptions?.FilterableValues) {
      this.myFilterType = FilterType.Or;
      return;
    }
    switch (this.metaData.fieldType) {
      case FieldType.String:
      case FieldType.PhoneNumber:
      case FieldType.Array:
      case FieldType.Unknown:
        this.myFilterType = FilterType.StringContains;
        break;
      case FieldType.Currency:
      case FieldType.Number:
        this.myFilterType = FilterType.NumberEquals;
        break;
      case FieldType.Boolean:
          this.myFilterType = FilterType.BooleanEquals;
          break;
      case FieldType.Date:
          this.myFilterType = FilterType.DateIsOn;
          break;
      case FieldType.Enum:
        this.myFilterType = FilterType.In;
        break;
    }
  }

  setStringFilterType() {
    this.myFilterType = this.myFilterType === FilterType.StringContains ? FilterType.StringDoesNotContain : FilterType.StringContains;
  }

  setFilterType(filterType: FilterType) {
    if (filterType === this.myFilterType) {
      this.resetFilterType();
    } else {
      this.myFilterType = filterType;
    }
  }

  onEnter(filter: FilterInfo) {
    if (filter.filterValue != undefined && filter.filterType) {
      this.tableState.addFilter(filter);
      this.trigger.closeMenu();
    }
  }
}
