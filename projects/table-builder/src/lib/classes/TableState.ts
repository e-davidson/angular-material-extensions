import { MetaData } from '../interfaces/report-def';
import { FilterInfo } from './filter-info';

export interface TableState {
  metaData?: MetaData [];
  data?: any [];
  hiddenKeys?: string [];
  pageSize?: number;
  currentPage?: number;
  filters: FilterInfo [];
}
