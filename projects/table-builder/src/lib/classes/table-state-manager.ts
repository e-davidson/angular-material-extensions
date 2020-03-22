import { Store, select } from '@ngrx/store';
import * as tableActions from '../ngrx/actions';
import { MetaData } from '../interfaces/report-def';
import { v4 as uuid } from 'uuid';
import { Observable } from 'rxjs';
import { TableState } from './TableState';
import { Injectable, Inject } from '@angular/core';
import { TableBuilderConfig, TableBuilderConfigToken } from './TableBuilderConfig';
import { map } from 'rxjs/operators';
import { FilterInfo, createFilterFunc } from './filter-info';
import { selectTableState, fullTableState, selectMetaData, selectVisibleFields } from '../ngrx/reducer';
import { DataFilter } from './data-filter';
import { combineArrays } from '../functions/rxjs-operators';

@Injectable()
export class TableStateManager {
  saveTable() {
    this.store.dispatch(tableActions.saveTableState({tableId: this.tableId}));
  }

  private _tableId: string;
    get tableId(): string {
      if (!this._tableId) {
        this.tableId = uuid();
      }
      return this._tableId;
    }
    set tableId(value: string) {
      if (this._tableId) {
        throw new Error(`Cannot reset the table ID after it has already been set. CurrentID: ${this._tableId}. New ID: ${value} `);
      }
      this._tableId = value;
      this.initializeState();
    }

    initializeState() {
      this.store.dispatch( tableActions.initTable({tableId: this._tableId}));
    }

    get state$(): Observable<TableState> {
      return this.store.pipe( select(selectTableState, {tableId: this.tableId, key: null}) );
    }

    get filters$(): Observable<FilterInfo[]> {
      return this.state$.pipe(map(table => Object.values( table.filters) ) );
    }

    get metaDatas$(): Observable<MetaData[]> {
      return this.state$.pipe( map(table => table.metaData ) );
    }

    metaData$(key: string): Observable<MetaData> {
      return this.store.pipe( select(selectMetaData, {tableId: this.tableId, key}) );
    }

    get displayedColumns$(): Observable<string[]> {
      return this.state$.pipe(map( state => {
          return state.metaData.filter( md => !state.hiddenKeys.includes( md.key) ).map( md => md.key);
        }))
      ;
    }

    get visibleFields$(): Observable<string[]> {
      return this.store.pipe(select(selectVisibleFields, {tableId: this.tableId, key: null }));
    }

  setMetaData(metaData: MetaData[]) {
    this.store.dispatch( tableActions.setMetaData({tableId: this.tableId, metaData}));
  }

  hideColumn(key: string) {
    this.store.dispatch( tableActions.setHiddenColumn( {tableId: this.tableId, column: key}) );
  }

  hideColumns(displayCols: {key: string, visible: boolean}[]) {
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
    this.store.dispatch(tableActions.downloadTable({tableId:this.tableId,data$: displayData$}));
  }

  csvData(data:Array<any>, headers: string[]) {
    const res = data.map(row => headers.map(field => row[field] || '').join(','));
    res.unshift(headers.join(','));
    return res.join('\n');
  }

  typedArrayToURL(typedArray: string, mimeType:string) {
    return URL.createObjectURL(new Blob([typedArray], { type: mimeType }))
  }
  constructor(private store: Store<{fullTableState: fullTableState}>,
              @Inject(TableBuilderConfigToken) private config: TableBuilderConfig) {
  }
}
