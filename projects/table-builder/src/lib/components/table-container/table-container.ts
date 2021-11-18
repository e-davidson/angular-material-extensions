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
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { ArrayAdditional, FieldType, MetaData } from '../../interfaces/report-def';
import { distinctUntilChanged, filter, first, last, map, shareReplay, switchMap, withLatestFrom } from 'rxjs/operators';
import { TableBuilder } from '../../classes/table-builder';
import { MatRowDef } from '@angular/material/table';
import { CustomCellDirective } from '../../directives';
import {  TableStore } from '../../classes/table-store';
import { DataFilter } from '../../classes/data-filter';
import { mapArray, notNull, skipOneWhen } from '../../functions/rxjs-operators';
import { ExportToCsvService } from '../../services/export-to-csv.service';
import { ArrayDefaults } from '../../classes/DefaultSettings';
import { TableBuilderConfig, TableBuilderConfigToken } from '../../classes/TableBuilderConfig';
import * as selectors from '../../ngrx/selectors';
import { select, Store } from '@ngrx/store';
import { deleteLocalProfilesState, setLocalProfile, setLocalProfilesState } from '../../ngrx/actions';
import { PersistedTableState } from '../../classes/TableState';
import { sortData } from '../../functions/sort-data-function';
import { WrapperFilterStore } from '../table-container-filter/table-wrapper-filter-store';
import { cloneDeep } from 'lodash';
import { ColumnInfo } from '../../interfaces/ColumnInfo';

@Component({
  selector: 'tb-table-container',
  templateUrl: './table-container.html',
  styleUrls: ['./table-container.css','../../styles/collapser.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TableStore,ExportToCsvService,WrapperFilterStore]
}) export class TableContainerComponent<T = any> {
  @Input() tableId!: string;
  @Input() SaveState = false;
  @Input() tableBuilder!: TableBuilder;
  @Input() IndexColumn = false;
  @Input() SelectionColumn = false;
  @Input() trackBy!: string;
  @Input() isSticky = true;
  @Input() set pageSize(value: number) {
    this.state.setPageSize(value);
  }
  @Input() inputFilters!: Observable<Array<(val: T) => boolean>>;
  @Output() selection$ = new EventEmitter();
  dataSubject = new ReplaySubject<Observable<T[]>>(1);
  @Output() data = this.dataSubject.pipe(
    switchMap( d => d),
    shareReplay({refCount: true, bufferSize: 1 })
  );

  @ContentChildren(MatRowDef) customRows!: QueryList<MatRowDef<any>>;
  @ContentChildren(CustomCellDirective) customCells!: QueryList<CustomCellDirective>;
  @Output() OnStateReset = new EventEmitter();
  @Output() OnSaveState = new EventEmitter();
  @Output() state$ : Observable<PersistedTableState>;

  myColumns$!: Observable<ColumnInfo[]>;

  stateKeys$?: Observable<string[] | null>;
  currentStateKey$?: Observable<string>;

  constructor(
    public state: TableStore,
    public exportToCsvService: ExportToCsvService<T>,
    @Inject(TableBuilderConfigToken) private config: TableBuilderConfig,
    private store: Store<any>
  ) {
     this.state.on( this.state.getSavableState().pipe(last()), finalState => {
      if(this.tableId) {
        this.store.dispatch(setLocalProfile({key:this.tableId,value: finalState}));
      }
    });
    this.state$ = this.state.getSavableState().pipe(map(state =>
      cloneDeep(state)),shareReplay({refCount:true,bufferSize:1}));
  }

  ngOnInit() {
    this.state.setTableSettings(this.tableBuilder.settings);
    if(this.tableId) {
      this.state.updateState(
        this.store.pipe(
          select(selectors.selectLocalProfileState<any>(this.tableId) ),
          notNull(),
          this.cleanStateOnInitialLoad(),
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
      this.OnSaveState.next(null);
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
    this.state.setMetaData(this.tableBuilder.metaData$!.pipe(
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
      mapArray( metaData => ({metaData, customCell: customCellMap.get(metaData.key)!}))
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

  cleanStateOnInitialLoad = () => (obs:Observable<PersistedTableState>) =>
    combineLatest([obs.pipe(addTimeStamp()) , this.tableBuilder.metaData$!]).pipe(
    distinctUntilChanged(([state],[state2])=>state.index === state2.index),
    map(([{value:state},metas],index)=>{
      if (index === 0) {

        const filters = Object.values(state.filters).filter(fltr => metas.some(m => m.key === fltr.key)).reduce((obj: any, filter) => {
          obj[filter.filterId!] = state.filters[filter.filterId!];
          return obj;
        }, {});
        const sorted = state.sorted.filter(s => metas.some(m => m.key === s.active));
        return ({...state,filters,sorted})
      }
      return state
    })
  );
  collapseHeader$ = this.state.state$.pipe(map(state => state.persistedTableSettings.collapseHeader));

}
const addTimeStamp = <T>() => (obs:Observable<T>) => obs.pipe(map((t,i) => ({value:t,index:i})));
