import { createReducer, Action, on, createSelector } from '@ngrx/store';
import { TableState } from '../classes/TableState';
import * as tableActions from './actions';
import { Dictionary } from '../interfaces/dictionary';


export const removeFromMetaData = (state: TableState, keysToRemove: string[]) =>
  Object.keys(state.metaData)
  .filter( key => !keysToRemove.includes(key))
  .map( key => state.metaData[key])
  .sort((md1,md2) => md1.order - md2.order);


export const nonExportableFields = (state: TableState) => Object.values( state.metaData)
  .filter(md => md.noExport )
  .map( md => md.key );

export const mapExportableFields = (state: TableState) => {
  const fieldsToRemove = nonExportableFields(state)
    .concat(state.hiddenKeys);
   return removeFromMetaData(state, fieldsToRemove);
}


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
