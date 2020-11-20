import {
  Component,
  Input,
  EventEmitter,
  Output,
  ContentChildren,
  QueryList,
  ChangeDetectionStrategy,
  Inject,
} from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { FieldType, MetaData } from '../../interfaces/report-def';
import { first, map } from 'rxjs/operators';
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
  @Output() data: Observable<T[]>;

  @ContentChildren(MatRowDef) customRows: QueryList<MatRowDef<any>>;
  @ContentChildren(CustomCellDirective) customCells: QueryList<CustomCellDirective>;


  @Output() OnStateReset = new EventEmitter();
  @Output() OnSaveState = new EventEmitter();

  myColumns$: Observable<ColumnInfo[]>;


  constructor(
    public state: TableStore,
    @Inject(TableBuilderConfigToken) private config: TableBuilderConfig,
    private datePipe: DatePipe,
  ) {
  }

  ngOnInit() {
    if(this.tableId) {
      this.state.setFromSavedState(this.tableId);
    }
    const filters$ = this.state.filters$.pipe(map( filters => Object.values(filters) ))
    this.data = new DataFilter(this.inputFilters)
      .appendFilters(filters$)
      .filterData(this.tableBuilder.getData$());
  }

  ngAfterContentInit() {
    this.InitializeColumns();
  }


  InitializeColumns() {
    const customCellMap = new Map(this.customCells.map(cc => [cc.customCell,cc]));
    this.state.setMetaData(this.tableBuilder.metaData$.pipe(first(),map((md) => {
      return [...md, ...this.customCells.map( cc => cc.getMetaData() )]
    })));

    this.myColumns$ = this.state.metaData$.pipe(
      mapArray( metaData => ({metaData, customCell: customCellMap.get(metaData.key)}))
    );
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
