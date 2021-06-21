import { Component, Input, ChangeDetectionStrategy, TemplateRef, ViewChild, OnInit, HostBinding, ContentChild, ContentChildren } from '@angular/core';
import { FieldType, MetaData } from '../../interfaces/report-def';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { Observable } from 'rxjs';
import { CustomCellDirective } from '../../directives';
import { FilterInfo } from '../../classes/filter-info';
import { TransformCreator } from '../../services/transform-creator';
import { TableStore } from '../../classes/table-store';
import { map, pairwise, startWith } from 'rxjs/operators';
import { TableTemplateService } from '../../services/table-template-service';
import { Dictionary } from '../../interfaces/dictionary';
import { previousAndCurrent } from '../../functions/rxjs-operators';

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
    const fullMetaStyles = this.metaData.additional?.styles;
    this.styles$= width$.pipe(map(width => {
      const styles = {
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

  cellClicked(element, key) {
    if(this.metaData.click) {
      this.metaData.click(element,key);
    }
  }

  mapWidth = (previousAndCurrentUserDefinedWidths : [number, number]) => {
    const [previousUserDefinedWidth, currentUserDefinedWidth] = previousAndCurrentUserDefinedWidths;
    if( thereIsACurrentUserDefinedWidth() ){
      return ({flex:`0 0 ${currentUserDefinedWidth}px`, maxWidth:'none'});
    } if( userDefinedWidthWasReset() ){
      return ({flex:'1'});
    }
    return ({});

    function thereIsACurrentUserDefinedWidth(){
      return currentUserDefinedWidth >= 0;
    }
    function userDefinedWidthWasReset(){
      return previousUserDefinedWidth >=0 && currentUserDefinedWidth == null;
    }
  }
  styles$:Observable<{body:Dictionary<string>,header:Dictionary<string>,footer:Dictionary<string>}>

}
