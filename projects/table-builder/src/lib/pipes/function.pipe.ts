import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'func'})
export class FunctionPipe implements PipeTransform {
  transform(value: string, func: (o: any, ...args: any[])=> any , ...args: any[]): any {
      return func(value,args);
  }
}
