import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'phone'})
export class PhoneNumberPipe implements PipeTransform {

  transform(phoneNum: string): any {
    if (phoneNum) {
      phoneNum = phoneNum.replace(/\D/g,'');
      if(phoneNum[0] === '1') {
        phoneNum = phoneNum.substring(1);
      }
      return '(' +  phoneNum.slice(0, 3) + ') ' + phoneNum.slice(3, 6) + '-' + phoneNum.slice(6, 10) + ' ' + phoneNum.slice(10);
    }
  }
}
