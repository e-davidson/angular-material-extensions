import { FilterInfo } from './filter-info';
import { Dictionary } from '../interfaces/dictionary';
import { Sort } from '@angular/material/sort';
import { MetaData } from '../..';

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
  metaData?: Dictionary<MetaData>;
}

export const defaultTableState: TableState = {
  metaData: {},
  filters: {},
  hiddenKeys: [],
  initialized : false,
  sorted: [],
  userDefined:{order:{},widths:{},table:{}}
};
