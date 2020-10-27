import {
  Component,
  Input,
  EventEmitter,
  Output,
  ContentChildren,
  QueryList,
  ChangeDetectionStrategy,
  Inject,
  ComponentFactory,
  ViewContainerRef,
  ComponentFactoryResolver,
  KeyValueDiffers,
  KeyValueDiffer,
} from '@angular/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { FieldType, MetaData } from '../../interfaces/report-def';
import { first, map, scan, tap } from 'rxjs/operators';
import { TableBuilder } from '../../classes/table-builder';
import { MatRowDef } from '@angular/material/table';
import { CustomCellDirective } from '../../directives';
import {  TableStore } from '../../classes/table-store';
import * as _ from 'lodash';
import { DataFilter } from '../../classes/data-filter';
import { mapArray } from '../../functions/rxjs-operators';
import { downloadData } from '../../functions/download-data';
import { mapExportableFields } from '../../ngrx/reducer';
import { TableBuilderConfig, TableBuilderConfigToken } from '../../classes/TableBuilderConfig';
import { DatePipe } from '@angular/common';
import { Dictionary } from '../../interfaces/dictionary';
import { ColumnBuilderComponent } from '../column-builder/column-builder.component';


@Component({
  selector: 'tb-table-container',
  templateUrl: './table-container.html',
  styleUrls: ['./table-container.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TableStore]
}) export class TableContainerComponent<T = any> {
  @Input() tableId;
  @Input() SaveState = false;
  @Input() tableBuilder: TableBuilder;
  @Input() IndexColumn = false;
  @Input() SelectionColumn = false;
  @Input() trackBy: string;
  @Input() isSticky = true;
  @Input() set pageSize(value: number) {
    this.state.setPageSize(value);
  }
  @Input() inputFilters: Observable<Array<(val: T) => boolean>>;
  @Output() selection$ = new EventEmitter();
  subscriptions: Subscription[] = [];
  @Output() data: Observable<T[]>;

  @ContentChildren(MatRowDef) customRows: QueryList<MatRowDef<any>>;
  @ContentChildren(CustomCellDirective) customCells: QueryList<CustomCellDirective>;


  @Output() OnStateReset = new EventEmitter();
  @Output() OnSaveState = new EventEmitter();

  myColumns$: Observable<Partial<ColumnInfo>[]>;

  factory: ComponentFactory<ColumnBuilderComponent> ;

  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    private viewContainer: ViewContainerRef,
    public state: TableStore,
    @Inject(TableBuilderConfigToken) private config: TableBuilderConfig,
    private datePipe: DatePipe,
    private differs: KeyValueDiffers
  ) {
    this.factory = componentFactoryResolver.resolveComponentFactory(ColumnBuilderComponent);
  }

  ngOnInit() {
    console.log('table container on init');
    if(this.tableId) {
      this.state.setFromSavedState(this.tableId);
    }
    const filters$ = this.state.filters$.pipe(map( filters => Object.values(filters) ))
    this.data = new DataFilter(this.inputFilters)
      .appendFilters(filters$)
      .filterData(this.tableBuilder.getData$());
  }

  ngAfterContentInit() {
    console.log('table container after contennt init');
    this.InitializeColumns();
  }

  myColumns: Dictionary<ColumnBuilderComponent> = {};
  needsInit: string [] = [];
  addMetaData(column: ColumnInfo) {
    let columnBuilder = this.myColumns[column.metaData.key];
    if(columnBuilder) {
      columnBuilder.metaData = column.metaData;
    } else {
      const component = this.viewContainer.createComponent(this.factory );
      component.instance.customCell = column.customCell;
      component.instance.metaData = column.metaData;
      component.instance.data$ = this.data;
      this.myColumns[column.metaData.key] = component.instance;
      this.needsInit.push(column.metaData.key);
    }
  }

  customCellMap : Map<string,CustomCellDirective>;
  createColumn(metaData: MetaData ) {
    if(metaData.key === 'select') return;
    console.log('creating ' + metaData.key);
    const component = this.viewContainer.createComponent(this.factory);
    component.instance.customCell = this.customCellMap.get(metaData.key);
    component.instance.metaData = metaData;
    component.instance.data$ = this.data;
    this.myColumns[metaData.key] = component.instance;
    this.needsInit.push(metaData.key);
  }

  updateColumn(metaData: MetaData) {
    console.log('updating ' + metaData.key);
    this.myColumns[metaData.key].metaData = metaData;
  }

  InitializeColumns() {
    this.customCellMap = new Map(this.customCells.map(cc => [cc.customCell,cc]));
    this.state.setMetaData(this.tableBuilder.metaData$.pipe(tap( d => console.log('meta data emitting')),first(),map((md) => {
      return [...md, ...this.customCells.map( cc => cc.getMetaData() )]
    })));

    this.myColumns$ = this.state.metaData$.pipe(
      mapArray( metaData => ({metaData, customCell: this.customCellMap.get(metaData.key)}))
    );

    const localDiffer: KeyValueDiffer<string,MetaData> = this.differs.find({}).create();

    var x = this.state.state$.pipe(
      map(state => localDiffer.diff( state.metaData ) ),
    ).subscribe(d => {
       //console.log( JSON.parse(JSON.stringify(d)) );
     //  d?.forEachAddedItem( a =>  this.createColumn(a.currentValue ));
     //  d?.forEachChangedItem( a => console.log('changed', a));
    });
  }

  exportToCsv() {
    const exportableFields$ = this.state.state$.pipe(
      map(mapExportableFields)
    );

    combineLatest([this.data,exportableFields$]).pipe(
      first(),
      map(([data,fields]) => this.csvData(data,fields)),
    ).subscribe(csv => downloadData(csv,'export.csv','text/csv') );
  }

  csvData(data:Array<any>, metaData: MetaData[]) {
    const res = data.map(row => metaData.map(meta => this.metaToField(meta, row)).join(','));
    res.unshift(metaData.map(meta => meta.displayName || meta.key).join(','));
    return res.join('\n');
  }

  metaToField(meta: MetaData, row: any) {
    let val = row[meta.key];
    switch (meta.fieldType) {
      case FieldType.Date:
        const dateFormat = meta.additional?.export?.dateFormat || this.config?.export?.dateFormat;
        val = this.datePipe.transform(val, dateFormat);
        break;
      case FieldType.String:
        const prepend: string = meta.additional?.export?.prepend || '';
        val = prepend + val;
        break;
    }
    if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
      val = val.replace('"', '""');
      val = '"' + val + '"';
    }
    return val;
  }
}

export interface ColumnInfo {
  metaData: MetaData;
  customCell: CustomCellDirective;
}
