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
import { Observable } from 'rxjs';
import { ArrayAdditional, FieldType, MetaData } from '../../interfaces/report-def';
import { first, map } from 'rxjs/operators';
import { TableBuilder } from '../../classes/table-builder';
import { MatRowDef } from '@angular/material/table';
import { CustomCellDirective } from '../../directives';
import {  TableStore } from '../../classes/table-store';
import * as _ from 'lodash';
import { DataFilter } from '../../classes/data-filter';
import { mapArray } from '../../functions/rxjs-operators';
import { ExportToCsvService } from '../../services/export-to-csv.service';
import { ArrayDefaults } from '../../classes/DefaultSettings';
import { TableBuilderConfig, TableBuilderConfigToken } from '../../classes/TableBuilderConfig';

@Component({
  selector: 'tb-table-container',
  templateUrl: './table-container.html',
  styleUrls: ['./table-container.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TableStore,ExportToCsvService]
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
    private exportToCsvService: ExportToCsvService<T>,
    @Inject(TableBuilderConfigToken) private config: TableBuilderConfig
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
    this.state.setMetaData(this.tableBuilder.metaData$.pipe(first(),map((mds) => {
      mds = mds.map(this.mapMetaDatas);
      return [...mds, ...this.customCells.map( cc => cc.getMetaData() )]
    })));

    this.myColumns$ = this.state.metaData$.pipe(
      mapArray( metaData => ({metaData, customCell: customCellMap.get(metaData.key)}))
    );
  }

  exportToCsv = () => {
    this.exportToCsvService.exportToCsv(this.data)
  }

  mapMetaDatas = (meta : MetaData<T>) => {
    if(meta.fieldType === FieldType.Array){
      const additional = {...meta.additional} as ArrayAdditional;
      additional.arrayStyle = additional?.arrayStyle ?? ArrayDefaults.arrayStyle;
      additional.limit = additional.limit ?? this.config.arrayInfo?.limit ?? ArrayDefaults.limit;
      return {...meta,additional}
    }
    return meta;
  }
}

export interface ColumnInfo {
  metaData: MetaData;
  customCell: CustomCellDirective;
}
