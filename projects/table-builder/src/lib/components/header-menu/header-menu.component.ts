import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FieldType, MetaData } from '../../interfaces/report-def';
import { FilterType } from '../../enums/filterTypes';
import { FilterInfo } from '../../classes/filter-info';
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
  myFilterType: FilterType;
  myFilterValue: any;

  @Input() filter: FilterInfo;

  @Input() metaData: MetaData;

  constructor( public tableState: TableStateManager) {}

  hideField(key) {
    this.tableState.hideColumn(key);
  }

  ngOnInit() {
    this.resetFilterType();
  }

  resetFilterType() {
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

  stopClickPropagate(event: any) {
    event.stopPropagation();
    event.preventDefault();
  }

}
