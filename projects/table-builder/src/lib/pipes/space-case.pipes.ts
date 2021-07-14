import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'spaceCase'})
export class SpaceCasePipe implements PipeTransform {
  transform(value: string): string {
    return  spaceCase(value);
  }
}

/**
 * Adds a space before uppercase letters that either
 * 1. follows a lowercase letter or digit
 * 2. or precedes a lowercase letter and follows an alpha-numeric character
 * 
 * Uppercases the first digit
 * 
 * Turns underscores into spaces
 */
export function spaceCase(value: string){
  return  value?.replace(/(?<=[a-z0-9])([A-Z])|(?<=[a-zA-Z0-9])([A-Z])(?=[a-z])|_/g, ' $1$2')
    // uppercase the first character
    .replace(/^./,  str => str.toUpperCase() );
}
