import { Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';

import BigNumber from 'bignumber.js';

@Pipe({name: 'dayjsdiff', pure: false})
export class DayjsDiffPipe implements PipeTransform {
  transform(endDateTimeBN: BigNumber): string {
    if (endDateTimeBN === undefined) return '...';
    else {
      const endDateTime = dayjs(new BigNumber(endDateTimeBN).toNumber()*1000);
      const currentDate = dayjs();
      const diff = endDateTime.diff(currentDate,'day',true);
      const days = Math.floor(diff);
      const hoursDiff = (diff - days) * 24;
      const hours = Math.floor(hoursDiff);
      const minutesDiff = (hoursDiff - hours) * 60;
      const minutes = Math.floor(minutesDiff);
      const secondsDiff = (minutesDiff - minutes) * 60;
      const seconds = Math.floor(secondsDiff);
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
  }
}
