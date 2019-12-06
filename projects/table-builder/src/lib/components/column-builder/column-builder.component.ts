import { Component, Input, ViewChild, Output, EventEmitter, ChangeDetectionStrategy, ViewChildren, QueryList } from '@angular/core';
import { MetaData, FieldType } from '../../interfaces/report-def';
import { MatColumnDef } from '@angular/material/table';
import { Observable } from 'rxjs';
import { CustomCellDirective } from '../../directives';
import { HeaderMenuComponent } from '../header-menu/header-menu.component';
import { FilterInfo } from '../../classes/filter-info';


@Component({
  selector: 'tb-column-builder',
  templateUrl: './column-builder.component.html',
  styleUrls: ['./column-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnBuilderComponent {
  filter: FilterInfo;
  @Input() metaData: MetaData;
  @Input() customCell: CustomCellDirective;
  @Input() data$: Observable<any[]>;

  @Output() filter$ = new EventEmitter();

  @ViewChildren(MatColumnDef) columnDefs: QueryList<MatColumnDef> ;

  ngOnInit() {
    this.filter = {key: this.metaData.key, fieldType: this.metaData.fieldType};
  }

  hasFilter(): boolean {
    if ( this.metaData.fieldType === FieldType.Boolean ) {
      return this.filter.filterValue !== undefined && this.filter.filterValue !== null;
    }
    return this.filter.filterValue;
  }
}
