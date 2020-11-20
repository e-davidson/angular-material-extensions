import { MetaData } from '../interfaces/report-def';
import { FilterInfo } from './filter-info';
import { Dictionary } from '../interfaces/dictionary';
import { Sort } from '@angular/material/sort';

export interface SavedTableProfile {
  profileNames : string [];
  currentProfile: string;
  profiles: Dictionary<TableState>;
}

export interface TableState {
  metaData?: Dictionary<MetaData>;
  hiddenKeys?: string [];
  pageSize?: number;
  currentPage?: number;
  filters: Dictionary<FilterInfo>;
  initialized : boolean;
  sorted : Sort [];
  currentProfile?: string;
}

export const defaultTableState: TableState = {
  metaData: {},
  filters: {},
  hiddenKeys: [],
  initialized : false,
  sorted: [],
};
