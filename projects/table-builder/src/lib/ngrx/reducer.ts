import { createReducer, Action, on, createSelector } from '@ngrx/store';
import { TableState } from '../classes/TableState';
import * as tableActions from './actions';
import { Dictionary } from '../interfaces/dictionary';





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
