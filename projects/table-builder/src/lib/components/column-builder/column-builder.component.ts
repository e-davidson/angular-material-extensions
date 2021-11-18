import { Component, Input, ChangeDetectionStrategy, TemplateRef, ViewChild, OnInit, HostBinding, ContentChild, ContentChildren } from '@angular/core';
import { FieldType, MetaData } from '../../interfaces/report-def';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { Observable } from 'rxjs';
import { CustomCellDirective } from '../../directives';
import { FilterInfo } from '../../classes/filter-info';
import { TransformCreator } from '../../services/transform-creator';
import { TableStore } from '../../classes/table-store';
import { map } from 'rxjs/operators';
import { TableTemplateService } from '../../services/table-template-service';
import { Dictionary } from '../../interfaces/dictionary';
import { notNull, previousAndCurrent } from '../../functions/rxjs-operators';

interface widthStyle {
    flex?: string;
    maxWidth?: string;
}

interface allStyles {
  body: widthStyle;
  header: widthStyle;
  footer: widthStyle;
}

@Component({
  selector: 'tb-column-builder',
  templateUrl: './column-builder.component.html',
  styleUrls: ['./column-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnBuilderComponent implements OnInit {
  FieldType = FieldType;
  filter!: Partial<FilterInfo>;
  @Input() metaData!: MetaData
  @Input() customCell!: CustomCellDirective;
  @Input() data$!: Observable<any[]>;

  @ViewChild(MatColumnDef) columnDef!: MatColumnDef;
  outerTemplate!: TemplateRef<any>;
  innerTemplate!: TemplateRef<any>;
  transform!: (o: any, ...args: any[])=> any ;

  @ViewChild('body') bodyTemplate!: TemplateRef<any>;


  constructor(
    private transformCreator: TransformCreator,
    private table: MatTable<any>,
    public state: TableStore,
    private templateService: TableTemplateService,
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
    const width$ = this.state.getUserDefinedWidth$(this.metaData.key).pipe(
      previousAndCurrent(0),
      map(this.mapWidth),
    );
    const fullMetaStyles = this.metaData.additional?.styles ?? {};
    this.styles$ = width$.pipe(map(width => {
      const styles: allStyles = {
        header : {...fullMetaStyles,...this.metaData.additional?.columnPartStyles?.header, ...width},
        footer: {...fullMetaStyles,...this.metaData.additional?.columnPartStyles?.footer, ...width},
        body: {...fullMetaStyles,...this.metaData.additional?.columnPartStyles?.body, ...width},
      };
      return styles;
    }));
  }

  ngAfterViewInit() {
    this.outerTemplate = this.getOuterTemplate();
    this.innerTemplate = this.getInnerTemplate();
    this.transform = this.transformCreator.createTransformer(this.metaData);
    this.table.addColumnDef(this.columnDef);
  }

  cellClicked(element: any, key: string) {
    if(this.metaData.click) {
      this.metaData.click(element,key);
    }
  }

  mapWidth = ([previousUserDefinedWidth, currentUserDefinedWidth] : [number, number]) : widthStyle => {

    if( currentUserDefinedWidth ){
      return ({flex:`0 0 ${currentUserDefinedWidth}px`, maxWidth:'none'});
    } if( wasReset() ){
      return ({flex:'1'});
    }
    return ({});
    function wasReset(){
      return previousUserDefinedWidth >=0 && currentUserDefinedWidth == null;
    }
  }

  styles$!:Observable<allStyles>

}
