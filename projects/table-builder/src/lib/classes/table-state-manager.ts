import { Store, select } from '@ngrx/store';
import * as tableActions from '../ngrx/actions';
import { MetaData } from '../interfaces/report-def';
import { v4 as uuid } from 'uuid';
import { Observable } from 'rxjs';
import { TableState } from './TableState';
import { Injectable, Inject } from '@angular/core';
import { TableBuilderConfig, TableBuilderConfigToken } from './TableBuilderConfig';
import { map } from 'rxjs/operators';
import { FilterInfo } from './filter-info';
import { selectTableState, fullTableState } from '../ngrx/reducer';

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
      return this.store.pipe( select(selectTableState, {tableId: this.tableId}) );
    }

    get filters$(): Observable<FilterInfo[]> {
      return this.state$.pipe(map(table => Object.values( table.filters) ) );
    }

    get metaData$(): Observable<FilterInfo[]> {
      return this.state$.pipe( map(table => table.metaData ) );
    }

    get displayedColumns$(): Observable<string[]> {
      return this.state$.pipe(map( state => {
          return state.metaData.filter( md => !state.hiddenKeys.includes( md.key) ).map( md => md.key);
        }))
      ;
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

  resetState() {
    this.store.dispatch(tableActions.reset({tableId: this.tableId}));
  }

  destroy() {
    this.store.dispatch(tableActions.removeTable({tableId: this.tableId}));
  }

  constructor(private store: Store<{fullTableState: fullTableState}>,
              @Inject(TableBuilderConfigToken) private config: TableBuilderConfig) {
  }
}
