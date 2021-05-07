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
import { Observable, ReplaySubject } from 'rxjs';
import { ArrayAdditional, FieldType, MetaData } from '../../interfaces/report-def';
import { filter, first, map, shareReplay, switchMap, withLatestFrom } from 'rxjs/operators';
import { TableBuilder } from '../../classes/table-builder';
import { MatRowDef } from '@angular/material/table';
import { CustomCellDirective } from '../../directives';
import {  TableStore } from '../../classes/table-store';
import { DataFilter } from '../../classes/data-filter';
import { mapArray, skipOneWhen } from '../../functions/rxjs-operators';
import { ExportToCsvService } from '../../services/export-to-csv.service';
import { ArrayDefaults } from '../../classes/DefaultSettings';
import { TableBuilderConfig, TableBuilderConfigToken } from '../../classes/TableBuilderConfig';
import { GlobalStorageState } from '../../ngrx/reducer';
import * as selectors from '../../ngrx/selectors';
import { select, Store } from '@ngrx/store';
import { deleteLocalProfilesState, setLocalProfile, setLocalProfilesState } from '../../ngrx/actions';
import { PersistedTableState } from '../../classes/TableState';
import { sortData } from '../../functions/sort-data-function';

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
  dataSubject = new ReplaySubject<Observable<T[]>>(1);
  @Output() data = this.dataSubject.pipe(
    switchMap( d => d),
    shareReplay({refCount: true, bufferSize: 1 })
  );

  @ContentChildren(MatRowDef) customRows: QueryList<MatRowDef<any>>;
  @ContentChildren(CustomCellDirective) customCells: QueryList<CustomCellDirective>;
  @Output() OnStateReset = new EventEmitter();
  @Output() OnSaveState = new EventEmitter();

  myColumns$: Observable<ColumnInfo[]>;

  stateKeys$?: Observable<string[]>;
  currentStateKey$?: Observable<string>;


  constructor(
    public state: TableStore,
    public exportToCsvService: ExportToCsvService<T>,
    @Inject(TableBuilderConfigToken) private config: TableBuilderConfig,
    private store: Store<{globalStorageState: GlobalStorageState}>
  ) {
    this.state.onLast( finalState => {
      if(this.tableId) {
        this.store.dispatch(setLocalProfile({key:this.tableId,value: finalState}));
      }
    });
  }

  ngOnInit() {
    if(this.tableId) {
      this.state.updateState(
        this.store.pipe(
          select(selectors.selectLocalProfileState<PersistedTableState>(this.tableId)),
          filter( state => !!state ),
          skipOneWhen(this.OnSaveState),
        )
      );
      this.stateKeys$ = this.store.select(selectors.selectLocalProfileKeys(this.tableId));
      this.currentStateKey$ = this.store.select(selectors.selectLocalProfileCurrentKey(this.tableId));
    }
    const filters$ = this.state.filters$.pipe(map( filters => Object.values(filters) ))
    const data = new DataFilter(this.inputFilters)
      .appendFilters(filters$)
      .filterData(this.tableBuilder.getData$());
    this.dataSubject.next(data);
  }

  exportToCsv(): void {
    const sorted = this.data.pipe(
      withLatestFrom(this.state.sorted$),
      map(([data, sorted]) => sortData(data, sorted))
    );
    this.exportToCsvService.exportToCsv(sorted);
  }

  saveState() {
    this.state.getSavableState().pipe(
      first()
    ).subscribe( tableState => {
      this.OnSaveState.next();
      this.store.dispatch(setLocalProfile({ key: this.tableId, value:tableState, persist: true} ));
    });
  }

  setProfileState(val: string) {
    this.store.dispatch(setLocalProfilesState({key:this.tableId, current: val}));
  }

  deleteProfileState(stateKey: string) {
    this.store.dispatch(deleteLocalProfilesState({key:this.tableId, stateKey}));
  }


  ngAfterContentInit() {
    this.InitializeColumns();
  }


  InitializeColumns() {
    const customCellMap = new Map(this.customCells.map(cc => [cc.customCell,cc]));
    this.state.setMetaData(this.tableBuilder.metaData$.pipe(
      first(),
      map((mds) => {
        mds = mds.map(this.mapMetaDatas);
        return [
          ...mds,
          ...this.customCells.map( cc => cc.getMetaData(mds.find( item => item.key === cc.customCell )) )
        ]
      })
    ));

    this.myColumns$ = this.state.metaDataArray$.pipe(
      mapArray( metaData => ({metaData, customCell: customCellMap.get(metaData.key)}))
    );
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
