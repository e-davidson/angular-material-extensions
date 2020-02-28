import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChildren, QueryList } from '@angular/core';
import { MetaData, FieldType } from '../../interfaces/report-def';
import { MatColumnDef } from '@angular/material/table';
import { Observable } from 'rxjs';
import { CustomCellDirective } from '../../directives';
import { FilterInfo } from '../../classes/filter-info';
import { TableStateManager } from '../../classes/table-state-manager';
import { map } from 'rxjs/operators';


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
  data$: Observable<any[]>;

  @ViewChildren(MatColumnDef) columnDefs: QueryList<MatColumnDef> ;

  constructor(private tableState: TableStateManager) {
    this.data$ = this.tableState.state$.pipe(map( state => state.data ));
  }

  ngOnInit() {
    this.filter = {key: this.metaData.key, fieldType: this.metaData.fieldType};
  }
}
