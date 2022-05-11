import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'fmtaddr'})
export class FmtAddrPipe implements PipeTransform {
    transform(value: string | null): string {
      if (!value) {
        return '';
      }
      // if value doesn't begin in 0x, it's an ENS
      if (!value.startsWith('0x')) {
        return value;
      }
      return (
        value.substring(0, 4) +
        '...' +
        value.substring(value.length - 4)
      )
    }
}
