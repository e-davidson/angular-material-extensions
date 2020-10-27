import { Injectable, Inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { selectStorageState, StateStorage} from './reducer';
import { tap, mergeMap, first, map } from 'rxjs/operators';
import { Store, ActionCreator, Creator } from '@ngrx/store';
import * as tableActions from './actions';
import { TableBuilderConfig, TableBuilderConfigToken } from '../classes/TableBuilderConfig';

@Injectable()
export class SaveTableEffects {

  saveState$ = createEffect(
    () => this.actions$.pipe(
      ofType(tableActions.saveState),
        tap( (action) => {
          if(action.persist) {
            localStorage.setItem(action.id, JSON.stringify(action.state));
          }
      }),
    ), { dispatch: false }
  );

  createEffectWithState<T,U extends ActionCreator<string, Creator>,V>( store: Store<T>, selector: (state: T) => V, allowedType: U   ) {
    return this.actions$.pipe(
      ofType(allowedType),
      mergeMap( action => store.select(selector).pipe(
        first(),
        map(state => ({action,state}))
      ))
    );
  }

  loadState$ = createEffect(() => this.createEffectWithState(this.store$, selectStorageState, tableActions.loadState).pipe(
    mergeMap( ({action,state}) => {
      if(!state.states[action.id]) {
        const storage = localStorage.getItem(action.id);
        if(storage) {
          return [tableActions.saveState({id: action.id, state: JSON.parse(storage)})];
        }
      }
      return [];
    })
  ));

  constructor(
    private actions$: Actions,
    private store$: Store<{storageState: StateStorage}>,
    @Inject(TableBuilderConfigToken) private config: TableBuilderConfig
  ) {}
}
