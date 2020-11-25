import { Pipe, PipeTransform } from '@angular/core';
import { FilterType } from '../enums/filterTypes';

@Pipe({name: 'formatFilterType'})
export class FormatFilterTypePipe implements PipeTransform {
  transform(filterType: FilterType, value: any){
    if(filterType === FilterType.IsNull){
      return value ? filterType : 'Is Not Blank'
    }
    return filterType;
  }
}