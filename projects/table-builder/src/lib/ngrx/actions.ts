import { createAction, props } from '@ngrx/store';

export const setLocalProfile = createAction('[State Storage] Set Local Profile', props<{key: string, value: any, persist?: boolean}>());

export const setLocalProfilesState = createAction('[State Storage] Set Local Profiles Current', props<{key: string, current: string}>());

export const deleteLocalProfilesState = createAction('[State Storage] Delete Local Profiles Current', props<{key: string, stateKey: string}>());
