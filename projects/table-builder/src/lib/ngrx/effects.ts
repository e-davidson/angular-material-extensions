import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
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
      filter( action => !!action.persist),
      concatLatestFrom( (action) =>  this.store.pipe(
        select(selectLocalProfile(action.key))
      )),
      tap( ([action,profile]) => {
        const globalSavedState: GlobalStorageState = JSON.parse(localStorage.getItem('global-state-storage') ?? JSON.stringify(defaultStorageState) );
        if(!profile) {
          profile =  {default: 'default', current: 'default', states : {default: action.value}};
          globalSavedState.localProfiles[action.key] = profile;
        } {
          if(!globalSavedState.localProfiles[action.key]) {
            globalSavedState.localProfiles[action.key] = {...profile,states: {[profile.current ?? profile.default]: action.value}};
          } else {
            globalSavedState.localProfiles[action.key].states[profile.current ?? profile.default] = action.value;
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

  constructor( private actions$: Actions, private store: Store<any> ) {}
}
