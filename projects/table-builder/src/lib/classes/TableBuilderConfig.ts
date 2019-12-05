import { InjectionToken } from '@angular/core';
import { TableState } from './TableState';

export interface TableBuilderConfig {
  defaultTableState: Partial<TableState>;
}

export const TableBuilderConfigToken = new InjectionToken<TableBuilderConfig>('TableBuilderConfig');
