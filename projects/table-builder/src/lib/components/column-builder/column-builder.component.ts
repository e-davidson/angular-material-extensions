import { Component, Input, ChangeDetectionStrategy, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { MetaData, FieldType } from '../../interfaces/report-def';
import { MatColumnDef } from '@angular/material/table';
import { Observable } from 'rxjs';
import { CustomCellDirective } from '../../directives';
import { FilterInfo } from '../../classes/filter-info';
import { TransformCreator } from '../../services/tranform-creator';


@Component({
  selector: 'tb-column-builder',
  templateUrl: './column-builder.component.html',
  styleUrls: ['./column-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnBuilderComponent implements OnInit {
  FieldType = FieldType;
  filter: FilterInfo;
  @Input() metaData: MetaData;
  @Input() customCell: CustomCellDirective;
  @Input() data$: Observable<any[]>;

  @ViewChild(MatColumnDef) columnDef: MatColumnDef;

  @ViewChild('body', {static: true}) bodyTemplate: TemplateRef<any>;
  @ViewChild('customCellWrapper') customCellWrapper: TemplateRef<any>;

  template: TemplateRef<any>;
  transform: (o: any, ...args: any[])=> any ;

  constructor( private transformCreator: TransformCreator) { }

  getTemplate() {
    if (this.customCell?.columnDef) {
      if (this.customCell.columnDef.cell) {
        return this.customCell.columnDef.cell.template;
      } else {
        return this.bodyTemplate;
      }
    }
    if (this.customCell) {
      return this.customCellWrapper;
    }
    return this.bodyTemplate;
  }

  ngOnInit() {
    this.filter = {key: this.metaData.key, fieldType: this.metaData.fieldType};
    this.transform = this.transformCreator.createTransformer(this.metaData);
  }

  ngAfterViewInit() {
    this.template = this.getTemplate();
  }

  cellClicked(element, key) {
    if(this.metaData.click) {
      this.metaData.click(element,key);
    }
  }
}
