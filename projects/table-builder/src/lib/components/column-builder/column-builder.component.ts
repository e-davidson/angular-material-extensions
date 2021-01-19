import { Component, Input, ChangeDetectionStrategy, TemplateRef, ViewChild, OnInit, HostBinding, ContentChild, ContentChildren } from '@angular/core';
import { FieldType, MetaData } from '../../interfaces/report-def';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { Observable } from 'rxjs';
import { CustomCellDirective } from '../../directives';
import { FilterInfo } from '../../classes/filter-info';
import { TransformCreator } from '../../services/transform-creator';
import { TableStore } from '../../classes/table-store';
import { map, startWith } from 'rxjs/operators';
import { TableService } from '../../services/table-service';

@Component({
  selector: 'tb-column-builder',
  templateUrl: './column-builder.component.html',
  styleUrls: ['./column-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnBuilderComponent implements OnInit {
  FieldType = FieldType;
  filter: FilterInfo;
  @Input() metaData: MetaData
  @Input() customCell: CustomCellDirective;
  @Input() data$: Observable<any[]>;

  @ViewChild(MatColumnDef) columnDef: MatColumnDef;
  outerTemplate: TemplateRef<any>;
  innerTemplate: TemplateRef<any>;
  transform: (o: any, ...args: any[])=> any ;

  @ViewChild('body') bodyTemplate: TemplateRef<any>;


  constructor(
    private transformCreator: TransformCreator,
    private table: MatTable<any>,
    public state: TableStore,
    private templateService: TableService,
    ) { }

  getInnerTemplate() :TemplateRef<any> {
    if(this.metaData.template) return this.metaData.template;
    if (this.customCell?.TemplateRef)  return this.customCell.TemplateRef;
    return this.templateService.getTemplate(this.metaData.fieldType);
  }

  getOuterTemplate() {
    return this.customCell?.columnDef?.cell?.template ?? this.bodyTemplate;
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
    this.outerTemplate = this.getOuterTemplate();
    this.innerTemplate = this.getInnerTemplate();
    this.transform = this.transformCreator.createTransformer(this.metaData);
    this.table.addColumnDef(this.columnDef);
  }

  cellClicked(element, key) {
    if(this.metaData.click) {
      this.metaData.click(element,key);
    }
  }

  styles$;

}
