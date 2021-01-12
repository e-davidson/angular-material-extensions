import { InternalMetaData } from '../interfaces/report-def';
import { FilterInfo } from './filter-info';
import { Dictionary } from '../interfaces/dictionary';
import { Sort } from '@angular/material/sort';

export interface SavedTableProfile {
  profileNames : string [];
  currentProfile: string;
  profiles: Dictionary<PersistedTableState>;
}

export interface PersistedTableState {
  hiddenKeys?: string [];
  pageSize?: number;
  currentPage?: number;
  filters: Dictionary<FilterInfo>;
  initialized : boolean;
  sorted : Sort [];
  currentProfile?: string;
  userDefined : {order:Dictionary<number>,widths:Dictionary<number>,table:{width?:number}}
}

export interface TableState extends PersistedTableState {
  metaData?: Dictionary<InternalMetaData>;
}

export const defaultTableState: TableState = {
  metaData: {},
  filters: {},
  hiddenKeys: [],
  initialized : false,
  sorted: [],
  userDefined:{order:{},widths:{},table:{}}
};
