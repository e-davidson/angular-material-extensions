import { PipeTransform, Inject, Injectable } from '@angular/core';
import { FieldType, MetaData } from '../interfaces/report-def';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { PhoneNumberPipe } from '../pipes/phone.pipe';
import { TableBuilderConfigToken, TableBuilderConfig } from '../classes/TableBuilderConfig';

function isPipe(o : any ): o is PipeTransform {
  return typeof ((o as PipeTransform).transform ) === 'function';
}

@Injectable({
  providedIn:  'root'
})
export class TranformCreator{
  constructor(
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private phonePipe: PhoneNumberPipe,
    @Inject(TableBuilderConfigToken) private config: TableBuilderConfig,
  ) {}
  createTranformer(metaData: MetaData) {
    if(metaData.tranform) {
      if(isPipe(metaData.tranform)){
        return metaData.tranform.transform;
      }
      return metaData.tranform
    }
        switch(metaData.fieldType) {
          case FieldType.Date:
            const dateFormat = metaData.additional?.dateFormat ?? this.config.defaultSettings?.dateFormat ?? 'shortDate';
            return (value) => this.datePipe.transform(value, dateFormat);
          case FieldType.Currency:
              return this.currencyPipe.transform;
          case FieldType.PhoneNumber:
            return this.phonePipe.transform;
        }
      return (value) => value;
  }

}
