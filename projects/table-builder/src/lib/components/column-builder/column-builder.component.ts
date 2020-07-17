import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChildren, QueryList, TemplateRef, ViewChild, Inject, OnInit } from '@angular/core';
import { MetaData, FieldType } from '../../interfaces/report-def';
import { MatColumnDef } from '@angular/material/table';
import { Observable } from 'rxjs';
import { CustomCellDirective } from '../../directives';
import { FilterInfo } from '../../classes/filter-info';
import { TableBuilderConfig, TableBuilderConfigToken } from '../../classes/TableBuilderConfig';

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
export class ColumnBuilderComponent implements OnInit {
  FieldType = FieldType;
  filter: FilterInfo;
  dateFormat: string;
  @Input() metaData: MetaData;
  @Input() customCell: CustomCellDirective;
  @Input() data$: Observable<any[]>;

  @ViewChild(MatColumnDef) columnDef: MatColumnDef;

  @ViewChild('body', {static: true}) bodyTemplate: TemplateRef<any>;
  @ViewChild('customCellWrapper') customCellWrapper: TemplateRef<any>;

  template: TemplateRef<any>;

  constructor(@Inject(TableBuilderConfigToken) private config: TableBuilderConfig) { }

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
    console.log('column builder on init');
    this.filter = {key: this.metaData.key, fieldType: this.metaData.fieldType};
    this.dateFormat = this.metaData.additional?.dateFormat ?? this.config.defaultSettings?.dateFormat ?? 'shortDate';
  }

  ngAfterViewInit() {
    console.log('column builder after view init', this.columnDef );
    this.template = this.getTemplate();
  }

  ngAfterViewChecked() {
    console.log('column builder after view checked', this.columnDef );
  }

  ngOnDestroy() {
    console.log('column builder on destroy', this.columnDef );
  }
}
