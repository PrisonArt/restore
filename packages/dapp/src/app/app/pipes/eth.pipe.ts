import { Pipe, PipeTransform } from '@angular/core';

import * as ethers from 'ethers';

@Pipe({name: 'eth'})
export class EtherPipe implements PipeTransform {
    transform(value: ethers.BigNumberish): string {
        if (value === undefined) return '...';
        else return ethers.utils.formatEther(value) + ' Ξ';
    }
}
