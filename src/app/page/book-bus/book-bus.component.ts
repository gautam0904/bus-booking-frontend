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
  selectedSeats : number[] = [];

  seatStatus: { [key: number]: { isBooked: boolean, isDisabled: boolean } } = {};

  constructor(
    private bookingService: BookingService,
    private sharedService: SharedService,
    private router : Router 
  ) {

  }

  ngOnInit(): void {
    this.loading = true;
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

      this.seats.forEach(seat => {
        this.seatStatus[seat] = { isBooked: this.isSeatBooked(seat), isDisabled: this.disabledSeat(seat)  };
      });
      
      this.fetchBookedSeats(bus as Ibus);
      this.loading =false;
    });
  }


  fetchBookedSeats(bus: Ibus): void {
    this.bookingService.bookedseat(bus , this.bookUser?.bookingDate || new Date()).subscribe({
      next: (resdata: IseatgetApiResponse) => {        
        if (resdata.data instanceof Array) {
          resdata.data.forEach((bookedseat: any) => {
            this.bookedSeats.push(bookedseat);
            const s = this.bookedSeats.find(seat => seat.isSingleLady == true);
            if (s) {
              this.ladyBookedSeats.push(s.seatNumber[0]);
            }
          });
        } else {
          this.bookedSeats.push(resdata.data);
        }
        this.updateSeatStatuses(); 
      },
    });
  }

  updateSeatStatuses() {
    this.seats.forEach(seat => {
      this.seatStatus[seat] = {
        isBooked: this.isSeatBooked(seat),
        isDisabled: this.disabledSeat(seat)
      };
    });
  }



  toggleSeat(seat: number): void {
    this.selectedSeats.push(seat);
    if(this.selectedSeats.length == this.bookUser?.seat){
      
      this.sharedService.setseatData(this.selectedSeats)
      if (this.bookedbus) {
        this.sharedService.setBusData(this.bookedbus)
      }
      this.router.navigate(['/booked-bus-form'])
    }
    
  }


  isSeatBooked(seat: number): boolean { 
    const isBooked = this.bookedSeats.some(s => s.seatNumber.includes(seat));
    return isBooked;
  }
  

  disabledSeat(seat: number): boolean {
    let disabledSeat = false;
    if (!this.bookUser?.isSingleLady) {
      disabledSeat = this.ladyBookedSeats.includes(seat - 1) || this.ladyBookedSeats.includes(seat + 1);      
    }
    return disabledSeat;
  }

  trackByIndex(index: number): number {
    return index;
  }
  
  trackBySeat(index: number, seat: number): number {
    return seat;
  }
  


  isselectedSeat(seat : number){
    return this.selectedSeats.includes(seat);
  }
   getIsSingleLadyStatus(seatNumber : number) {
    return this.ladyBookedSeats.includes(seatNumber)
}

}

