import { createAction, props } from '@ngrx/store';

export const saveState = createAction('[State Storage] save state', props<{id: string, state:any, persist?: boolean}>());

export const loadState = createAction('[State Storage] load state', props<{id: string}>());
