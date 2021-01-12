import { Component, Input, ChangeDetectionStrategy, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { FieldType, InternalMetaData } from '../../interfaces/report-def';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { Observable } from 'rxjs';
import { CustomCellDirective } from '../../directives';
import { FilterInfo } from '../../classes/filter-info';
import { TransformCreator } from '../../services/transform-creator';
import { TableStore } from '../../classes/table-store';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'tb-column-builder',
  templateUrl: './column-builder.component.html',
  styleUrls: ['./column-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnBuilderComponent implements OnInit {
  FieldType = FieldType;
  filter: FilterInfo;
  _metaData: InternalMetaData;
  @Input() set metaData(value: InternalMetaData) {
    this._metaData = value;
    this.transform = this.transformCreator.createTransformer(this.metaData);
  };
  get metaData() : InternalMetaData {
    return this._metaData;
  }
  @Input() customCell: CustomCellDirective;
  @Input() data$: Observable<any[]>;

  @ViewChild(MatColumnDef) columnDef: MatColumnDef;

  @ViewChild('body', {static: true}) bodyTemplate: TemplateRef<any>;
  @ViewChild('customCellWrapper') customCellWrapper: TemplateRef<any>;

  template: TemplateRef<any>;
  transform: (o: any, ...args: any[])=> any ;

  constructor( private transformCreator: TransformCreator, private table: MatTable<any>, 
    public state: TableStore,
    ) { }

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
    this.styles$ = this.state.getUserDefinedWidth$(this.metaData.key).pipe(
      startWith(null),
      map(w => {
      const width = w ? {flex:`0 0 ${w}px`, maxWidth:'none'} : {};
      const styles = this.metaData.additional?.styles || w ? {...this.metaData.additional?.styles,...width} : null;
      return styles;
    }));
  }

  ngAfterViewInit() {
    this.template = this.getTemplate();
    this.table.addColumnDef(this.columnDef);
  }

  cellClicked(element, key) {
    if(this.metaData.click) {
      this.metaData.click(element,key);
    }
  }

  styles$;

}
