import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'spaceCase'})
export class SpaceCasePipe implements PipeTransform {
  transform(value: string): string {
    return  value.replace(/([A-Z])/g, ' $1')
    // uppercase the first character
    .replace(/^./, function( str) {
         return str.toUpperCase();
    });
  }
}
