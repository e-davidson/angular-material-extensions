import { Store, select } from '@ngrx/store';
import * as tableActions from '../ngrx/actions';
import { MetaData, FieldType } from '../interfaces/report-def';
import { v4 as uuid } from 'uuid';
import { Observable, ReplaySubject, combineLatest } from 'rxjs';
import { TableState } from './TableState';
import { Injectable, Inject } from '@angular/core';
import { TableBuilderConfig, TableBuilderConfigToken } from './TableBuilderConfig';
import { map, distinct, switchMap, first } from 'rxjs/operators';
import { FilterInfo, createFilterFunc } from './filter-info';
import { selectTableState, fullTableState, mapVisibleFields, mapExportableFields } from '../ngrx/reducer';
import { DataFilter } from './data-filter';
import { combineArrays } from '../functions/rxjs-operators';
import { downloadData } from '../functions/download-data';
import { DatePipe } from '@angular/common';

@Injectable()
export class TableStateManager {
  initialized$ = new ReplaySubject<string>(1);
  saveTable() {
    this.store.dispatch(tableActions.saveTableState({tableId: this.tableId}));
    this.config?.export?.onSave()
  }

  private _tableId: string;
    get tableId(): string {
      if (!this._tableId) {
        this._tableId = uuid();
      }
      return this._tableId;
    }
    set tableId(value: string) {
      if (this._tableId) {
        throw new Error(`Cannot reset the table ID after it has already been set. CurrentID: ${this._tableId}. New ID: ${value} `);
      }
      this._tableId = value;
    }

    initializeState() {
      this.store.dispatch( tableActions.initTable({tableId: this.tableId}));
      this.initialized$.next(this.tableId);
      this.initialized$.complete();
    }

    _state$:  Observable<TableState>;
    get state$(): Observable<TableState> {
      if (!this._state$) {
        this._state$ = this.initialized$.pipe(
          switchMap( tableId => this.store.pipe(select(selectTableState(), {tableId}))),
          distinct()
        );
      }
      return this._state$;
    }

    get filters$(): Observable<FilterInfo[]> {
      return this.state$.pipe(map(table => Object.values( table.filters) ) );
    }

    get metaDatas$(): Observable<MetaData[]> {
      return this.state$.pipe( map(table => table.metaData ) );
    }

    metaData$(key: string): Observable<MetaData> {
      return this.state$.pipe( map( state => state.metaData.find( md => md.key === key) ) );
    }

    get displayedColumns$(): Observable<string[]> {
      return this.state$.pipe(map( state => {
          return state.metaData.filter( md => !state.hiddenKeys.includes( md.key) ).map( md => md.key);
        }))
      ;
    }

    get visibleFields$(): Observable<string[]> {
      return this.state$.pipe(map(mapVisibleFields));
    }

  setMetaData(metaData: MetaData[]) {
    this.store.dispatch( tableActions.setMetaData({tableId: this.tableId, metaData}));
  }

  hideColumn(key: string) {
    this.store.dispatch( tableActions.setHiddenColumn( {tableId: this.tableId, column: key, visible: false}) );
  }

  showColumn(key: string) {
    this.store.dispatch( tableActions.setHiddenColumn( {tableId: this.tableId, column: key, visible: true}) );
  }

  setHiddenColumns(displayCols: {key: string, visible: boolean}[]) {
    this.store.dispatch( tableActions.setHiddenColumns( {tableId: this.tableId, columns: displayCols}) );
  }

  updateState( tableState: Partial<TableState>) {
    this.store.dispatch( tableActions.updateTableState({tableId: this.tableId, tableState } ));
  }

  addFilter(filter: FilterInfo) {
    if (!filter.filterId) {
      filter.filterId = uuid();
    }
    this.store.dispatch(tableActions.addFilter({tableId: this.tableId, filter }));
  }

  removeFilter(filterId: string) {
    this.store.dispatch(tableActions.removeFilter({tableId: this.tableId, filterId }));
  }

  getFilter$(filterId) : Observable<FilterInfo | undefined> {
    return this.state$.pipe(
      map( tableState => tableState.filters[filterId] )
    );
  }

  resetState() {
    this.store.dispatch(tableActions.reset({tableId: this.tableId}));
  }

  destroy() {
    this.store.dispatch(tableActions.removeTable({tableId: this.tableId}));
  }

  getFilteredData$(data$: Observable<any[]>, inputFilters$?: Observable<Array<(val: any) => boolean>>): Observable<any[]> {
    const filters = [
      this.filters$.pipe(map(fltrs => fltrs.map(filter => createFilterFunc(filter))))
    ];
    if (inputFilters$) {
      filters.push(inputFilters$);
    }
    return new DataFilter(combineArrays(filters),data$).filteredData$;
  }

  exportToCsv(data$: Observable<any[]>) {
    const displayData$ = this.getFilteredData$(data$);
    const exportableFields$ = this.state$.pipe(
      map(mapExportableFields)
    );

    combineLatest([displayData$,exportableFields$]).pipe(
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

  constructor(private store: Store<{fullTableState: fullTableState}>,
              @Inject(TableBuilderConfigToken) private config: TableBuilderConfig,
              private datePipe: DatePipe) {
  }
}
