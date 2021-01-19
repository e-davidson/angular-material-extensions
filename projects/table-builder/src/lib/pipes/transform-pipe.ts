import { Pipe, PipeTransform } from '@angular/core';
import { MetaData } from 'dist/mx-table-builder/public-api';
import { TransformCreator } from '../services/transform-creator';

@Pipe({name: 'transform'})
export class TransformPipe implements PipeTransform {

  constructor(private tc: TransformCreator) {}
  transform(value: MetaData ): any {
      return this.tc.createTransformer(value);
  }
}
