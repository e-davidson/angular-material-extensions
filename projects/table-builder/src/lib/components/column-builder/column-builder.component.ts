import { Component, Input, ViewChild, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FieldType, MetaData } from '../../interfaces/report-def';
import { MatColumnDef } from '@angular/material/table';
import { Observable } from 'rxjs';
import { CustomCellDirective } from '../../directives';

@Component({
  selector: 'tb-column-builder',
  templateUrl: './column-builder.component.html',
  styleUrls: ['./column-builder.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnBuilderComponent {
  FieldType = FieldType;

  @Input() metaData: MetaData;
  @Input() customCell: CustomCellDirective;
  @Input() data$: Observable<any[]>;
  @Input() displayFilter = false;

  @Output() emitFilter = new EventEmitter<{value: string, metaData: MetaData}>();

  @ViewChild(MatColumnDef, { static: false}) columnDef: MatColumnDef;

  constructor() {}

}
