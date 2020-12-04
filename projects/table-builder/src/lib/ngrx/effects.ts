import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { defaultStorageState, GlobalStorageState} from './reducer';
import { tap, filter, mergeMap, first, map } from 'rxjs/operators';
import * as tableActions from './actions';
import { select, Store } from '@ngrx/store';
import { selectLocalProfile } from './selectors';


@Injectable()
export class SaveTableEffects {

  saveLocalProfile$ = createEffect(
    () => this.actions$.pipe(
      ofType(tableActions.setLocalProfile),
      filter( action => action.persist),
      mergeMap( action => this.store.pipe(
        select(selectLocalProfile(action.key)),
        first(),
        map( profile => ({action,profile}))
      )),
      tap( (a) => {
        const globalSavedState: GlobalStorageState = JSON.parse(localStorage.getItem('global-state-storage') ?? JSON.stringify(defaultStorageState) );
        let profile = a.profile;
        if(!profile) {
          profile =  {default: 'default', current: 'default', states : {default: a.action.value}};
          globalSavedState.localProfiles[a.action.key] = profile;
        } {
          if(!globalSavedState.localProfiles[a.action.key]) {
            globalSavedState.localProfiles[a.action.key] = {...profile,states: {[profile.current ?? profile.default]: a.action.value}};
          } else {
            globalSavedState.localProfiles[a.action.key].states[profile.current ?? profile.default] = a.action.value;
          }

        }
        localStorage.setItem('global-state-storage', JSON.stringify( globalSavedState));
      }),
    ), { dispatch: false }
  );

  deleteLocalProfile$ = createEffect(
    () => this.actions$.pipe(
      ofType(tableActions.deleteLocalProfilesState),
      tap( (a) => {
        const globalSavedState: GlobalStorageState = JSON.parse(localStorage.getItem('global-state-storage') ?? JSON.stringify(defaultStorageState) );
          if(!globalSavedState.localProfiles[a.key]) {
            return;
          } else {
            delete globalSavedState.localProfiles[a.key].states[a.stateKey];
          }
        localStorage.setItem('global-state-storage', JSON.stringify( globalSavedState));
      }),
    ), { dispatch: false }
  );

  constructor( private actions$: Actions, private store: Store ) {}
}
