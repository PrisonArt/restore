import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';

import * as ethers from 'ethers';
import { BigNumber } from 'ethers';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({name: 'dayjs', pure: false})
export class DayjsPipe implements PipeTransform {
  transform(startTime: BigNumber, format: string): string {
    if (startTime === undefined) return '...';
    // FIXME: Currently converting BigNumber to string back to BigNumber
    else return dayjs(BigNumber.from(startTime.toString()).toNumber() * 1000).format(format);
}
}

@Pipe({name: 'eth'})
export class EtherPipe implements PipeTransform {
    transform(value: ethers.BigNumberish): string {
        if (value === undefined) return '...';
        else return ethers.utils.formatEther(value) + ' ETH';
    }
}
