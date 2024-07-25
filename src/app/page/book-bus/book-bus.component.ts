import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService } from 'src/app/core/services/booking.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { Ibus } from 'src/app/core/interfaces/ibus';
import { IseatgetApiResponse } from 'src/app/core/interfaces/iseatget-api-response';
import { IBookUser } from 'src/app/core/interfaces/i-book-user';

@Component({
  selector: 'app-book-bus',
  templateUrl: './book-bus.component.html',
  styleUrls: ['./book-bus.component.scss']
})
export class BookBusComponent implements OnInit {
  seats: number[] = [];
  ladyBookedSeats: number[] = [];
  seatsInRows: number[][] = [];
  seatsPerRow!: number;
  bookedbus: Ibus | undefined = undefined;
  bus: Ibus | undefined = undefined;
  loading: boolean = false;
  selectedOption: string = '';
  bookedSeats: any[] = [];
  bookUser : IBookUser | undefined = undefined;


  constructor(
    private bookingService: BookingService,
    private sharedService: SharedService,
    private router : Router 
  ) {

  }

  ngOnInit(): void {
    this.sharedService.bookUser$.subscribe(bookUser => {
      this.bookUser = bookUser;
    }
    )
    this.sharedService.bookBus$.subscribe(bus => {
      this.bookedbus = bus;
      if (!this.bookedbus) {
        this.router.navigate([''])
      }
      this.seats = Array.from({ length: this.bookedbus?.TotalSeat || 20 }, (_, index) => (index + 1));
      this.seatsPerRow = 4;
           
      const totalSeats = this.seats.length;
      this.seatsInRows = [];

      for (let i = 0; i < totalSeats; i += this.seatsPerRow) {
        const rowSeats = this.seats.slice(i, i + this.seatsPerRow);
        this.seatsInRows.push(rowSeats);
      }
      
      this.fetchBookedSeats(bus as Ibus);
    });
  }

  fetchBookedSeats(bus: Ibus): void {
    this.bookingService.bookedseat(bus).subscribe({
      next: (resdata: IseatgetApiResponse) => {        
        if (resdata.data instanceof Array) {
          resdata.data.forEach((bookedseat: any) => {
            this.bookedSeats.push(bookedseat);
            console.log(this.bookedSeats.find(seat => seat.isSingleLady == true));
            
            // this.ladyBookedSeats.push((this.bookedSeats.find(seat => seat.isSingleLady === true)).seatNumber);
          });
        } else {
          this.bookedSeats.push(resdata.data);
        }
      },
    });
  }

  toggleSeat(seat: number): void {
    this.sharedService.setseatData(seat)
    if (this.bookedbus) {
      this.sharedService.setBusData(this.bookedbus)
    }
    this.router.navigate(['/booked-bus-form'])
  }


  isSeatBooked(seat: number): boolean { 
    return this.bookedSeats.some((s : {seatNumber : number}) => s.seatNumber === seat);
  }
   getIsSingleLadyStatus(seatNumber : number) {
    const seat = this.bookedSeats.find(seat => seat.seatNumber === seatNumber);
   
    return seat ? seat.isSingleLady : undefined;
}
disabledSeat(seat : number){

  let disabledSeat = false;
  if (!this.bookUser?.isSingleLady) {
    this.ladyBookedSeats.includes(seat-1) || this.ladyBookedSeats.includes(seat-1)
  }
  return disabledSeat;
}
}





// import { BusService } from 'src/app/core/services/bus.service';
// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { IbookingSeatgetApiResponse } from 'src/app/core/interfaces/ibooking-seatget-api-response';
// import { Ibus } from 'src/app/core/interfaces/ibus';
// import { IseatgetApiResponse } from 'src/app/core/interfaces/iseatget-api-response';
// import { BookingService } from 'src/app/core/services/booking.service';
// import { SharedService } from 'src/app/core/services/shared.service';
// import { Router } from '@angular/router';
// import { IbusgetApiResponse } from 'src/app/core/interfaces/ibusget-api-response';

// @Component({
//   selector: 'app-book-bus',
//   templateUrl: './book-bus.component.html',
//   styleUrls: ['./book-bus.component.scss']
// })
// export class BookBusComponent implements OnInit {
//   seats: number[] = [];
//   lastRowSeats: number[] = [];
//   selectedSeat: number | undefined = undefined;
//   bookedbus: Ibus | undefined = undefined;
//   bus: Ibus | undefined = undefined;
//   bookingForm !: FormGroup;
//   loading: boolean = false;
//   selectedOption: string = '';

//   options = [
//     { id: 'option1', label: 'payment by upi' },
//     { id: 'option2', label: 'payment by upi' },
//   ];


//   constructor(
//     private bookingService: BookingService,
//     private busService: BusService,
//     private router: Router,
//     private sharedService: SharedService,
//     private fb: FormBuilder,
//   ) {

//   }


//   ngOnInit(): void {
//     this.sharedService.bookBus$.subscribe(bus => {
//       this.bookedbus = bus
//       this.seats = Array.from({ length: this.bookedbus?.TotalSeat || 20 }, (_, index) => (index + 1));
//       const seatsPerRow = 5;
//       const totalSeats = this.seats.length;
//       const lastRowStartIndex = Math.floor((totalSeats - 1) / seatsPerRow) * seatsPerRow + 1;
//       this.lastRowSeats = this.seats.slice(lastRowStartIndex - 1);
//       this.bookingService.bookedseat(bus as Ibus).subscribe({
//         next: (resdata: IseatgetApiResponse) => {

//           if (resdata.data instanceof Array) {
//             resdata.data.forEach((bookedseat: any) => {
//               if (bookedseat.seatNumber) {
//                 this.seats = this.seats.filter(p => p !== bookedseat.seatNumber);
//               }
//             })
//           } else {
//             this.seats = [resdata.data];
//           }
//         },
//       })

//     });

//   }

//   onChange(option: string) {
//     this.selectedOption = option;
//     if (this.selectedOption == 'option1') {
//       this.bookingForm.patchValue({
//         payment: this.bookingForm.get('payment')?.value + 26
//       })
//     }
//     else if (this.selectedOption == 'option2') {
//       this.bookingForm.patchValue({
//         payment: this.bookingForm.get('payment')?.value - 26
//       })
//     }

//   }

//   toggleSeat(seat: number): void {
//     this.selectedSeat = seat;
//     this.bookingForm = this.fb.group({
//       busId: ['', Validators.required],
//       seatNumber: [seat, Validators.required],
//       departure: ['', Validators.required],
//       destination: ['', Validators.required],
//       departureTime: ['', Validators.required],
//       payment: ['', Validators.required],
//     })
//     if (this.bookedbus) {

//       this.busService.getBusbyId(this.bookedbus._id || '').subscribe({
//         next: (resdata: IbusgetApiResponse) => {
//           this.loading = false;
//           this.bus = resdata.data as Ibus;
//         },
//         error: (err) => {
//           this.loading = false;
//         }
//       })

//       const busRoute = this.bookedbus.route
//       let userpreviusdistance = 0;
//       let userdistance = 0;
//       let previusstation = busRoute[0].previousStation;
//       busRoute.forEach((route, index) => {
//         if (route.previousStation === previusstation) {
//           userdistance += route.distance;
//           previusstation = route.currentStation;
//         } else {
//           userpreviusdistance += route.distance;
//         }
//       });

//       this.bookingForm.patchValue({
//         busId: this.bookedbus._id,
//         seatNumber: seat,
//         departure: this.bookedbus.departure,
//         destination: this.bookedbus.destination,
//         departureTime: (this.bookedbus.departureTime + userpreviusdistance / 50),
//         payment: userdistance * this.bookedbus.charge,
//       });
//     }


//   }

//   onSubmit() {

//     if (this.bookingForm.valid) {

//       this.loading = true;
//       this.bookingService.getbookseat(this.bookingForm.value).subscribe({
//         next: (resdata: IbookingSeatgetApiResponse) => {
//           this.loading = false;
//           this.router.navigate(['/page']);
//         },
//         error: (err) => {
//           this.loading = false;

//         }
//       })
//         ;
//     } else {
//       Object.values(this.bookingForm.controls).forEach(control => {
//         control.markAsTouched();
//       });
//     }
//   }


// }
