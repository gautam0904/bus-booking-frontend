import { Component } from '@angular/core';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent {
coupons = [{
  code : 'qwq',
  type : 'application',
  discountValue : '1223'
}]
}
