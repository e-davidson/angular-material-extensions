import { Store, select } from '@ngrx/store';
import { fullTableState, setMetaData, selectTableState, setHiddenColumn, setHiddenColumns, initTable, updateTableState, saveTableState, addFilter } from '../ngrx/reducer';
import { MetaData } from '../interfaces/report-def';
import { v4 as uuid } from 'uuid';
import { Observable } from 'rxjs';
import { TableState } from './TableState';
import { Injectable, Inject } from '@angular/core';
import { TableBuilderConfig, TableBuilderConfigToken } from './TableBuilderConfig';
import { map } from 'rxjs/operators';
import { FilterInfo } from './filter-info';


@Injectable()
export class TableStateManager {
  saveTable() {
    this.store.dispatch(saveTableState({tableId: this.tableId}));
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
      const state = {...{ hiddenKeys: [], pageSize: 20, filters: [] }, ...this.config.defaultTableState };
      this.store.dispatch( initTable({tableId: this._tableId, tableState: state }));
    }

    get state$(): Observable<TableState> {
      return this.store.pipe( select(selectTableState, {tableId: this.tableId}) );
    }

    filters(): Observable<FilterInfo[]> {
      return this.state$.pipe( map(table => table.filters ) );
    }

    get displayedColumns$(): Observable<string[]> {
      return this.state$.pipe(map( state => {
          return state.metaData.filter( md => !state.hiddenKeys.includes( md.key) ).map( md => md.key);
        }))
      ;
    }

  setMetaData(metaData: MetaData[]) {
    this.store.dispatch( setMetaData({tableId: this.tableId, metaData}));
  }

  hideColumn(key: string) {
    this.store.dispatch( setHiddenColumn( {tableId: this.tableId, column: key}) );
  }

  hideColumns(displayCols: {key: string, visible: boolean}[]) {
    this.store.dispatch( setHiddenColumns( {tableId: this.tableId, columns: displayCols}) );
  }

  updateState( tableState: Partial<TableState>) {
    this.store.dispatch( updateTableState({tableId: this.tableId, tableState } ));
  }

  addFilter(filter: FilterInfo) {
    this.store.dispatch(addFilter({tableId: this.tableId, filter }));
  }

  constructor(private store: Store<{fullTableState: fullTableState}>,
              @Inject(TableBuilderConfigToken) private config: TableBuilderConfig) {
  }
}
