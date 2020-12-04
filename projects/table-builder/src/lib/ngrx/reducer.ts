import { createReducer, Action, on } from '@ngrx/store';
import * as tableActions from './actions';
import { Dictionary } from '../interfaces/dictionary';

export interface Profile<T = any> {
  default: string;
  current: string;
  states: Dictionary<T>;
}

export interface GlobalStorageState {
  globalProfileKeys : string [];
  currentGlobalProfile: string;
  globalProfiles: Dictionary<Profile>;
  localProfiles: Dictionary<Profile>;
}

export const defaultStorageState: GlobalStorageState = {
  globalProfileKeys: ['Default'],
  currentGlobalProfile: 'Default',
  globalProfiles: {},
  localProfiles: {}
}


function loadGlobalStorageState() : GlobalStorageState {
  const storage = localStorage.getItem('global-state-storage');
  if(storage) {
    return {...defaultStorageState, ...JSON.parse(storage)};
  }
  return defaultStorageState;
}

const reducer = createReducer(
  loadGlobalStorageState(),
  on(tableActions.setLocalProfile, (state,{key,value})=> {
    let profile = state.localProfiles[key];
    if(!profile) {
      profile =  {default: 'default', current: 'default', states : {
        default: value
      }};
    } else {
      profile = {...profile, states: {...profile.states, [profile.current ?? profile.default] : value} };
    }
    return {...state, localProfiles: {...state.localProfiles, [key]: profile} }
  }),
  on(tableActions.setLocalProfilesState, (state, {key,current}) => {
    let profile = state.localProfiles[key];
    if(!profile) {
      profile =  {default: current, current , states : {[current]: null }};
    } else {
      const state = profile.states[current] ?? profile.states[profile.current ?? profile.default];
      profile = {...profile, current, states: {...profile.states, [current] : state }};
    }
    return {...state, localProfiles: {...state.localProfiles, [key]: profile}};
  }),
  on(tableActions.deleteLocalProfilesState, (state, {key,stateKey}) => {
    let profile = state.localProfiles[key];
    if(profile) {
      const current = profile.current === stateKey ? profile.default : profile.current;
      profile = {...profile,current, states: { ...profile.states}};
      delete profile.states[stateKey];
      return {...state, localProfiles: {...state.localProfiles, [key]: profile} };
    } else {
      return state;
    }
  })
);

export function storageStateReducer(state: GlobalStorageState | undefined, action: Action) {
  return reducer(state, action);
}
