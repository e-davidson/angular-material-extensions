import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChildren, QueryList, TemplateRef, ViewChild } from '@angular/core';
import { MetaData, FieldType } from '../../interfaces/report-def';
import { MatColumnDef } from '@angular/material/table';
import { Observable } from 'rxjs';
import { CustomCellDirective } from '../../directives';
import { FilterInfo } from '../../classes/filter-info';

export interface TemplateHolder {
  metaData: MetaData;
  customTemplate?: TemplateRef<any>;
  template?: TemplateRef<any>;
}

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

  @ViewChild(MatColumnDef) columnDef: MatColumnDef;

  @ViewChild('body', {static: true}) bodyTemplate: TemplateRef<any>;
  @ViewChild('customCellWrapper') customCellWrapper: TemplateRef<any>;

  template: TemplateRef<any>;

  getTemplate() {
      if (this.customCell?.columnDef?.cell) {
        return this.customCell.columnDef.cell.template;
      }
      if (this.customCell) {
        return this.customCellWrapper;
      }
      return this.bodyTemplate;
    }

  ngOnInit() {
    this.filter = {key: this.metaData.key, fieldType: this.metaData.fieldType};
  }

  ngAfterViewInit() {
    this.template = this.getTemplate();
  }

  getFormatType(datePipeFormat: string): string {
    return datePipeFormat ? datePipeFormat : 'shortDate';
  }

}
