import { createReducer, Action, createAction, props, on, createSelector } from '@ngrx/store';
import { TableState } from '../classes/TableState';
import { MetaData } from '../interfaces/report-def';
import update from 'immutability-helper';


export class TableStateAction implements Action {
  type: string;
  tableId: string;
}

export const initOrUpdateTable = createAction( '[Table State] Init table', props<{tableId: string, tableState: Partial<TableState>}>());

export const initTable = createAction( '[Table State] Init table', props<{tableId: string, tableState: Partial<TableState>}>());

export const setMetaData = createAction('[Table State] Set MetaData', props<{tableId: string, metaData: MetaData[]}>());

export const setHiddenColumn = createAction('[Table State] Set Hidden Column', props<{tableId: string, column: string}>());

export const setHiddenColumns = createAction('[Table State] Set Hidden Columns',
  props<{tableId: string, columns: {key: string, visible: boolean}[]}>());

export const updateTableState = createAction('[Table State] Update ', props<{tableId: string, tableState: Partial<TableState>}>());

export interface fullTableState {
  [key: string]: TableState;
}

const initialState: fullTableState = {};

const reducer = createReducer(initialState,
  on(setMetaData, ( state, {tableId, metaData} ) => {
    return update( state, {[tableId]: { metaData: {$set: metaData} }} );
  }),
  on(setHiddenColumn, ( state, {tableId, column} ) => {
    const tableState = state[tableId];
    let hiddenColumns: string[] = [];
    if (tableState.hiddenKeys.includes(column)) {
      hiddenColumns = tableState.hiddenKeys.filter( k => k !== column);
    } else {
      hiddenColumns = [...tableState.hiddenKeys, column];
    }
    return update( state , {[tableId] : { hiddenKeys: {$set: hiddenColumns}}});
  } ),
  on(setHiddenColumns, ( state, {tableId, columns} ) => {
    let hiddenKeys = [...state[tableId].hiddenKeys];
    columns.forEach(column => {
      if (column.visible) {
        hiddenKeys = hiddenKeys.filter( k => k !== column.key);
      } else {
        hiddenKeys.push(column.key);
      }
    });
    return update( state , {[tableId] : { hiddenKeys: {$set: hiddenKeys}}});
  }),
  on( initTable, (state, {tableId, tableState}) => {
    return {... state , [tableId]: tableState};
  }),
  on(updateTableState, (state, {tableId, tableState}) => {
    return update( state , {[tableId] : { $merge: tableState}});
  }),
  on(initOrUpdateTable , (state, {tableId, tableState}) => {
    if (state[tableId]) {
      return update( state , {[tableId] : { $merge: tableState}});
    }
    return {... state , [tableId]: tableState};
  })
);

export function tableStateReducer(state: fullTableState| undefined, action: Action) {
  return reducer(state, action);
}


export const selectFullTableState: (any) => fullTableState = (state: any) => state['fullTableState'];

export const selectTableState = createSelector(selectFullTableState, (state: fullTableState, {tableId}  ) => state[tableId] );

