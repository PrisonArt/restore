
import { Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';

import * as ethers from 'ethers';
import { BigNumber } from 'ethers';

@Pipe({name: 'dayjs', pure: false})
export class DayjsPipe implements PipeTransform {
  transform(startTime: BigNumber, format: string): string {
    if (startTime === undefined) return '...';
    // FIXME: Currently converting BigNumber to string back to BigNumber
    else return dayjs(BigNumber.from(startTime.toString()).toNumber() * 1000).format(format);
  }
}
