import { createReducer, Action, on, createSelector } from '@ngrx/store';
import { TableState } from '../classes/TableState';
import update from 'immutability-helper';

import * as tableActions from './actions';
import { Dictionary } from '../interfaces/dictionary';

export class TableStateAction implements Action {
  type: string;
  tableId: string;
}

export interface fullTableState extends  Dictionary<TableState> {
}

const initialState: fullTableState = {};

const reducer = createReducer(initialState,
  on(tableActions.setMetaData, ( state, {tableId, metaData} ) => update( state, {[tableId]: { metaData: {$set: metaData} }} )),
  on(tableActions.setHiddenColumn, ( state, {tableId, column} ) => {
    const tableState = state[tableId];
    let hiddenColumns: string[] = [];
    if (tableState.hiddenKeys.includes(column)) {
      hiddenColumns = tableState.hiddenKeys.filter( k => k !== column);
    } else {
      hiddenColumns = [...tableState.hiddenKeys, column];
    }
    return update( state , {[tableId] : { hiddenKeys: {$set: hiddenColumns}}});
  } ),
  on(tableActions.setHiddenColumns, ( state, {tableId, columns} ) => {
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
  on( tableActions.initTable, (state, {tableId, tableState}) => {
    return {... state , [tableId]: tableState};
  }),
  on(tableActions.updateTableState, (state, {tableId, tableState}) => {
    return update( state , {[tableId] : { $merge: tableState}});
  }),
  on(tableActions.addFilter, (state, {tableId, filter}) => {
    const filterId = filter.filterId;
    return update( state , { [tableId] : {filters : { [filterId] : { $set: filter } }}} );
  } ),
  on(tableActions.removeFilter, (state, {tableId, filterId}) => {
    return update(state, {[tableId] : {filters : { $unset : [filterId]}  }});
  }),
  on(tableActions.reset, (state, {tableId}) => update(state, {[tableId]: {hiddenKeys: {$set: []}, filters: {$set: {}}}})  )
);

export function tableStateReducer(state: fullTableState| undefined, action: Action) {
  return reducer(state, action);
}


export const selectFullTableState: (any) => fullTableState = (state: any) => state['fullTableState'];

export const selectTableState = createSelector(selectFullTableState, (state: fullTableState, {tableId}  ) => state[tableId] );

