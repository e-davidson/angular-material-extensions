import { DatePipe } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { first, map  } from 'rxjs/operators';
import { combineLatest} from 'rxjs';
import { TableStore } from '../classes/table-store';
import { TableBuilderConfig, TableBuilderConfigToken } from '../classes/TableBuilderConfig';
import { downloadData } from '../functions/download-data';
import { ArrayAdditional, ArrayStyle, FieldType, MetaData } from '../interfaces/report-def';
import { TableState } from '../classes/TableState';
@Injectable()
export class ExportToCsvService<T> {
  constructor(
    public state: TableStore,
    @Inject(TableBuilderConfigToken) private config: TableBuilderConfig,
    private datePipe: DatePipe,
  ){}

  exportToCsv = (data: Observable<T[]>) => {
    const exportableFields$ = this.state.state$.pipe(
      map(mapExportableFields)
    );

    combineLatest([data,exportableFields$]).pipe(
      first(),
      map(([data,fields]) => this.csvData(data,fields)),
    ).subscribe(csv => downloadData(csv,'export.csv','text/csv') );
  }

  csvData = (data:Array<T>, metaData: MetaData<T>[]) => {
    const res = data.map(row => metaData.map(meta => this.metaToField(meta, row)).join(','));
    res.unshift(metaData.map(meta => meta.displayName || meta.key).join(','));
    return res.join('\n');
  }

  metaToField = (meta: MetaData, row: T) => {
    let val = row[meta.key];
    if (val == null && !meta.transform) return val
    if(meta.transform && meta.fieldType !== FieldType.Expression){
      const transform = meta.transform as any;
      return transform.transform ? transform.transform(val) : transform(val);
    }
    switch (meta.fieldType) {
      case FieldType.Date:
        const dateFormat = meta.additional?.export?.dateFormat || this.config?.export?.dateFormat;
        val = this.datePipe.transform(val, dateFormat);
        break;
      case FieldType.String:
        const prepend: string = meta.additional?.export?.prepend || '';
        val = prepend + val;
        break;
      case FieldType.Array:
        const additional = meta.additional as ArrayAdditional;
        val = (val as Array<string>).slice(0,additional.limit).join(additional.arrayStyle === ArrayStyle.NewLine ? '\n' : ', ');
        break;
      case FieldType.Expression:
        console.log('object')
        val = (meta.transform as any)(row);
        break;
    }
    if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
      val = val.replace('"', '""');
      val = '"' + val + '"';
    }
    return val;
  }
}

export const removeFromMetaData = (state: TableState, keysToRemove: string[]) =>
  Object.keys(state.metaData)
  .filter( key => !keysToRemove.includes(key))
  .map( key => state.metaData[key])
  .sort((md1,md2) => md1.order - md2.order);


export const nonExportableFields = (state: TableState) => Object.values( state.metaData)
  .filter(md => md.noExport )
  .map( md => md.key );

export const mapExportableFields = (state: TableState) => {
  const fieldsToRemove = nonExportableFields(state)
    .concat(state.hiddenKeys);
   return removeFromMetaData(state, fieldsToRemove);
}