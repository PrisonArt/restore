import { Pipe, PipeTransform } from '@angular/core';

import BigNumber from 'bignumber.js';
import { formatEther } from 'ethers/lib/utils';

@Pipe({name: 'eth'})
export class EtherPipe implements PipeTransform {
    transform(value: BigNumber): string {
        if (value === undefined) return '...';
        else return formatEther(new BigNumber(value).toFixed()) + ' Ξ'; //
    }
}
