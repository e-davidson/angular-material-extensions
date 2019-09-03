import { Component, Input, ViewChild, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FieldType, MetaData } from '../../interfaces/report-def';
import { MatColumnDef } from '@angular/material/table';
import { Observable } from 'rxjs';
import { CustomCellDirective } from '../../directives';
import { FilterInfo } from '../../classes/filter-info';
import { FilterType } from '../../enums/filterTypes';
import { debounceTime } from 'rxjs/operators';


@Component({
  selector: 'tb-column-builder',
  templateUrl: './column-builder.component.html',
  styleUrls: ['./column-builder.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnBuilderComponent {
  FieldType = FieldType;
  FilterType = FilterType;

  filter: FilterInfo;

  @Input() metaData: MetaData;
  @Input() customCell: CustomCellDirective;
  @Input() data$: Observable<any[]>;
  @Input() displayFilter = false;
  change$  = new EventEmitter();
  @Output() filter$ = this.change$.pipe(debounceTime(250));

  @ViewChild(MatColumnDef, { static: false}) columnDef: MatColumnDef;

  constructor() {}

  ngOnInit() {
    this.filter = new FilterInfo(this.metaData);
    switch (this.metaData.fieldType) {
      case FieldType.String:
      case FieldType.Array:
      case FieldType.Unknown:
        this.filter.filterType = FilterType.StringContains;
        break;
      case FieldType.Currency:
      case FieldType.Number:
        this.filter.filterType = FilterType.NumberEquals;
    }
  }

  setFilterType(filterType: FilterType) {
    if (filterType === this.filter.filterType) {
      switch (this.metaData.fieldType) {
        case FieldType.String:
        case FieldType.Array:
        case FieldType.Unknown:
          this.filter.filterType = FilterType.StringContains;
          break;
        case FieldType.Currency:
        case FieldType.Number:
          this.filter.filterType = FilterType.NumberEquals;
      }
    } else {
      this.filter.filterType = filterType;
    }
    this.change$.emit();
  }

}
