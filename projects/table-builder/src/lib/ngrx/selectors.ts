import { createSelector } from '@ngrx/store';
import { GlobalStorageState, Profile } from './reducer';

export const selectGlobalStorageState = (state: {globalStorageState: GlobalStorageState}) => state.globalStorageState;

export const selectGlobalProfileKeys = createSelector(selectGlobalStorageState, state => state.globalProfileKeys )

export const selectCurrentGlobalProfile = createSelector(selectGlobalStorageState, state => state.globalProfiles[state.currentGlobalProfile]);

export const selectLocalProfile = <T>(key:string) =>  createSelector(selectGlobalStorageState, state => state.localProfiles[key]);

export function selectLocalProfileState<T>(key:string) {
  return createSelector<{ globalStorageState: GlobalStorageState }, any[], T>
  (
    selectLocalProfile(key),
    (profile: Profile<T>) => {
      if(profile) {
        return  profile.states[profile.current ?? profile.default];
      }
      return null;
  });
}

export const selectLocalProfileCurrentKey =  (key:string) =>  createSelector (
  selectLocalProfile(key),
  (profile: Profile ) => {
    if(profile) {
      return  profile.current ?? profile.default;
    }
    return 'default';
});

export const selectLocalProfileKeys = (key:string) =>  createSelector(
  selectLocalProfile(key),
  (profile: Profile) => {
    if(profile) {
      return  Object.keys(profile.states).filter( key => key);
    }
    return null;
});
