import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'fmtaddr'})
export class FmtAddrPipe implements PipeTransform {
    transform(value: string): string {
      return (
        value.substring(0, 4) +
        '...' +
        value.substring(value.length - 4)
      )
    }
}
