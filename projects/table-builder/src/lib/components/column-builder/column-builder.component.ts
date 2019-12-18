import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChildren, QueryList } from '@angular/core';
import { MetaData, FieldType } from '../../interfaces/report-def';
import { MatColumnDef } from '@angular/material/table';
import { Observable } from 'rxjs';
import { CustomCellDirective } from '../../directives';
import { FilterInfo } from '../../classes/filter-info';


@Component({
  selector: 'tb-column-builder',
  templateUrl: './column-builder.component.html',
  styleUrls: ['./column-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnBuilderComponent {
  FieldType = FieldType;
  filter: FilterInfo;
  @Input() metaData: MetaData;
  @Input() customCell: CustomCellDirective;
  @Input() data$: Observable<any[]>;

  @ViewChildren(MatColumnDef) columnDefs: QueryList<MatColumnDef> ;

  ngOnInit() {
    this.filter = {key: this.metaData.key, fieldType: this.metaData.fieldType};
  }
}
