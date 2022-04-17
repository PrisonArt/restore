
import { Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';

import BigNumber from 'bignumber.js';

@Pipe({name: 'dayjs', pure: false})
export class DayjsPipe implements PipeTransform {
  transform(startTime: BigNumber, format: string): string {
    if (startTime === undefined) return '...';
    else return dayjs(new BigNumber(startTime).toNumber()*1000).format(format);
  }
}
