import { InjectionToken } from '@angular/core';

export interface TableBuilderConfig {
  pageSize?: number;
}

export const TableBuilderConfigToken = new InjectionToken<TableBuilderConfig>('TableBuilderConfig');
