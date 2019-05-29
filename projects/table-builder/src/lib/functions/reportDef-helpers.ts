import { MetaData, FieldType, ReportDef } from '../interfaces/report-def';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { first, switchMap, map } from 'rxjs/operators';

export const  cleanVal = (val: any, metaData: MetaData): any =>  {
  switch ( metaData.fieldType ) {
    case FieldType.Currency:
    case FieldType.Number:
      const num = Number( val );
      return isNaN(num) ? null : num;
    case FieldType.Date:
      const date = Date.parse(val);
      return isNaN(date) ? null : new Date(date);
  }
  return val;
};

export const  cleanRecord = ( record: any, metadata: MetaData []): any =>  {
  const result = {};
  metadata.forEach( md => {
    result[md.key] = cleanVal(record[md.key], md);
  });
  return result;
};


export const GenerateMetaData = (data: any[], metaData: MetaData[]): MetaData [] => {
  const maxO = _.maxBy( metaData, 'order');
  let maxOrd = maxO ? maxO.order : 0;
  const missingMetaData = Object.keys( data[0] )
    .filter( key =>  metaData.findIndex( md => md.key === key) === -1)
    .map( key => ({
      key,
      displayName: key,
      fieldType: FieldType.Unknown,
      additional: null,
      order: ++maxOrd
    }) );
  return  _.orderBy([...missingMetaData, ...metaData], ['order']);
};

export const GenerateReportDef = (data: any[], metaData: MetaData[] ): ReportDef =>  {
  const md = GenerateMetaData(data, metaData);
  return {
      data: data = data.map( d => cleanRecord(d, md)),
      metaData: md,
      count: data.length
    };
};

export const GenerateReportDef$ = (data$: Observable<any[]>, metaData$: Observable<MetaData[]> = null): Observable<ReportDef> => {
  if ( !metaData$ ) {
    return data$.pipe( map ( data => GenerateReportDef(data, []) ));
  }
  return  metaData$.pipe(
    first(),
    switchMap(md => data$.pipe(
      map(data => GenerateReportDef(data, md))
    ))
  );
};
