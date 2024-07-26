import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'distance'
})
export class DistancePipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): unknown {
    return value + "Km";
  }

}
