import { createReducer, Action, on, createSelector } from '@ngrx/store';
import { TableState } from '../classes/TableState';
import update from 'immutability-helper';
import * as tableActions from './actions';
import { Dictionary } from '../interfaces/dictionary';
import { FieldType } from '../interfaces/report-def';
import { SortDirection, Sort } from '@angular/material/sort';

export class TableStateAction implements Action {
  type: string;
  tableId: string;
}

export interface fullTableState extends  Dictionary<TableState> {
}

const initialState: fullTableState = {};

const reducer = createReducer(initialState,
  on(tableActions.setMetaData, ( state, {tableId, metaData} ) => {
    let tableState = update( state[tableId], { metaData: {$set: metaData}});

    if( !tableState.sorted?.length ) {
      const sorted = metaData
      .filter(( metaData ) => metaData.preSort)
      .sort(
        ({  preSort: ps1  }, { preSort: ps2 } ) =>  (ps1.precedence || Number.MAX_VALUE) - ( ps2.precedence || Number.MAX_VALUE)
      )
      .map(( {key, preSort} ) =>
        ({ active: key, direction: preSort.direction }));
      tableState = update(tableState, {sorted: {$set: sorted} });
    }
    return update( state, {[tableId]: { $set: tableState  }} );
  }
  ),
  on(tableActions.setHiddenColumn, ( state, {tableId, column, visible} ) => {
     const tableState = state[tableId];
    if(tableState.hiddenKeys.includes(column) !== visible ) {
      return state;
    }
    const hiddenColumns = visible ?
      tableState.hiddenKeys.filter( c => c !== column) :
      [...tableState.hiddenKeys, column];
    return update( state , {[tableId] : { hiddenKeys: { $set: hiddenColumns }}});
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
  on( tableActions.initTable, (state, {tableId}) => {
    const defaultTableState : TableState = {
      metaData: [],
      filters: {},
      hiddenKeys: [],
      initialized : false,
      sorted: []
    };
    if (!state[tableId]) {
      return {... state , [tableId]: defaultTableState };
    }
    return state;
  }),
  on(tableActions.updateTableState, (state, {tableId, tableState}) => {
    if (state[tableId]) {
      return update( state , {[tableId] : { $merge: tableState}});
    } else {
      return update( state , {[tableId] : { $set: tableState as TableState }});
    }
  }),
  on(tableActions.addFilter, (state, {tableId, filter}) => {
    const filterId = filter.filterId;
    return update( state , { [tableId] : {filters : { [filterId] : { $set: filter } }}} );
  } ),
  on(tableActions.removeFilter, (state, {tableId, filterId}) => {
    return update(state, {[tableId] : {filters : { $unset : [filterId]}  }});
  }),
  on(tableActions.reset, (state, {tableId}) => {
    const hiddenColumns = state[tableId].metaData
       .filter( md => md.fieldType === FieldType.Hidden)
       .map( md => md.key);
    return update(state, {[tableId]: {hiddenKeys: {$set: [...hiddenColumns]}, filters: {$set: {}}}})
  }),
  on(tableActions.removeTable, (state, {tableId}) => update(state, {$unset: [tableId] })),
  on(tableActions.sortBy, (state, {tableId, key, direction}) => {
    const sortArray = state[tableId].sorted.filter( s => s.active !== key );
    if(direction) {
      sortArray.unshift({active: key, direction});
    }
    return update( state, {[tableId]: {sorted : {$set: sortArray }}});
  } )
);

export function tableStateReducer(state: fullTableState| undefined, action: Action) {
  return reducer(state, action);
}


export const selectFullTableState = (state: {fullTableState: fullTableState}) => state.fullTableState;

export const selectTableState = () => createSelector(selectFullTableState, (state: fullTableState, {tableId}  ) => state[tableId] );

export const removeFromMetaData = (state: TableState, keysToRemove: string[]) =>
  state.metaData
  .filter( md => !keysToRemove.includes(md.key))
  .sort((md1,md2) => md1.order - md2.order);

export const mapVisibleFields = (state: TableState) =>
  removeFromMetaData(state, state.hiddenKeys)
  .map(md => md.key);

export const selectVisibleFields = createSelector(selectTableState(), mapVisibleFields);

export const nonExportableFields = (state: TableState) => state.metaData
  .filter(md => md.noExport )
  .map( md => md.key );

export const mapExportableFields = (state: TableState) => {
  const fieldsToRemove = nonExportableFields(state)
    .concat(state.hiddenKeys);
   return removeFromMetaData(state, fieldsToRemove);
}

export const selectExportableFields = createSelector(
  selectTableState(),
  mapExportableFields
);
