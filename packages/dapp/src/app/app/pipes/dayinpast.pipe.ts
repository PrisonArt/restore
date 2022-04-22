import { Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';

import BigNumber from 'bignumber.js';

@Pipe({name: 'dateInPast', pure: false})
export class DateInPastPipe implements PipeTransform {
  transform(dateTimeBN: BigNumber): boolean {
    const dateTime = dayjs(new BigNumber(dateTimeBN).toNumber()*1000);
    const currentDate = dayjs();
    if (dateTime.isAfter(currentDate)) {
      return false;
    } else {
      return true;
    }
  }
}
