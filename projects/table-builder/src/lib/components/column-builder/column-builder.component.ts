import { Component, Input, ChangeDetectionStrategy, TemplateRef, ViewChild, Inject, OnInit } from '@angular/core';
import { MetaData, FieldType } from '../../interfaces/report-def';
import { MatColumnDef } from '@angular/material/table';
import { Observable } from 'rxjs';
import { CustomCellDirective } from '../../directives';
import { FilterInfo } from '../../classes/filter-info';
import { TableBuilderConfig, TableBuilderConfigToken } from '../../classes/TableBuilderConfig';

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
  @ViewChild('footer', {static: true}) footerTemplate: TemplateRef<any>;
  @ViewChild('customCellWrapper') customCellWrapper: TemplateRef<any>;

  template: TemplateRef<any>;
  templateFooter: TemplateRef<any>;

  constructor(@Inject(TableBuilderConfigToken) private config: TableBuilderConfig) { }

  getTemplate() {
      if (this.customCell?.columnDef) {
        if (this.customCell.columnDef.cell) {
          return this.customCell.columnDef.cell.template;
        }
        return this.bodyTemplate;
      }
      if (this.customCell) {
        return this.customCellWrapper;
      }
      return this.bodyTemplate;
    }

    getFooterTemplate() {
      if (this.customCell?.columnDef) {
        if (this.customCell.columnDef.footerCell) {
          return this.customCell.columnDef.footerCell.template;
        }
      }
      return this.footerTemplate;
    }

  ngOnInit() {
    this.filter = {key: this.metaData.key, fieldType: this.metaData.fieldType};
    this.dateFormat = this.metaData.additional?.dateFormat ?? this.config.defaultSettings?.dateFormat ?? 'shortDate';
  }

  ngAfterViewInit() {
    this.template = this.getTemplate();
    this.templateFooter = this.getFooterTemplate();
  }
}
