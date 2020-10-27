import { createReducer, Action, on, createSelector } from '@ngrx/store';
import { TableState } from '../classes/TableState';
import update from 'immutability-helper';
import * as tableActions from './actions';
import { Dictionary } from '../interfaces/dictionary';
import { FieldType, MetaData } from '../interfaces/report-def';

export class TableStateAction implements Action {
  type: string;
  tableId: string;
}

export interface fullTableState extends  Dictionary<TableState> {
}

const initialState: fullTableState = {};



export const selectFullTableState = (state: {fullTableState: fullTableState}) => state.fullTableState;

export const selectTableState = () => createSelector(selectFullTableState, (state: fullTableState, {tableId}  ) => state[tableId] );

export const removeFromMetaData = (state: TableState, keysToRemove: string[]) =>
  Object.keys(state.metaData)
  .filter( key => !keysToRemove.includes(key))
  .map( key => state.metaData[key])
  .sort((md1,md2) => md1.order - md2.order);

export const mapVisibleFields = (state: TableState) =>
  removeFromMetaData(state, state.hiddenKeys)
  .map(md => md.key);

export const selectVisibleFields = createSelector(selectTableState(), mapVisibleFields);

export const nonExportableFields = (state: TableState) => Object.values( state.metaData)
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



export interface StateStorage {
  states: Dictionary<any>;
}

export const defaultStateStorage: StateStorage = {
  states: {},
}

const reducer = createReducer(
  defaultStateStorage,
  on(tableActions.saveState, (state,action) => ({ ...state, [action.id]: action.state })),
);

export function storageStateReducer(state: StateStorage | undefined, action: Action) {
  return reducer(state, action);
}

export const selectStorageState = (state: {storageState: StateStorage}) => state.storageState;

export const selectStorageStateItem = (id:string) => createSelector(selectStorageState, (state: StateStorage   ) => state[id] );
