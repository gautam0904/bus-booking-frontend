import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IbookingSeatgetApiResponse } from 'src/app/core/interfaces/ibooking-seatget-api-response';
import { Ibus } from 'src/app/core/interfaces/ibus';
import { IbusgetApiResponse } from 'src/app/core/interfaces/ibusget-api-response';
import { BookingService } from 'src/app/core/services/booking.service';
import { BusService } from 'src/app/core/services/bus.service';
import { SharedService } from 'src/app/core/services/shared.service';

@Component({
  selector: 'app-book-bus-form',
  templateUrl: './book-bus-form.component.html',
  styleUrls: ['./book-bus-form.component.scss']
})
export class BookBusFormComponent implements OnInit {
  loading: boolean = false;
  selectedSeat: number | undefined = undefined;
  bookedbus: Ibus | undefined = undefined;
  bookingForm: FormGroup;
  bus: Ibus | undefined = undefined
  seat: number | undefined = undefined

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private router: Router,
    private busService: BusService,
    private sharedService: SharedService,
  ) {
    this.bookingForm = this.fb.group({
      busId: ['', Validators.required],
      seatNumber: ['', Validators.required],
      departure: ['', Validators.required],
      destination: ['', Validators.required],
      departureTime: ['', Validators.required],
      payment: ['', Validators.required],
      bookingDate: ['', Validators.required],
      seat: ['', Validators.required],
      paymentMethod : ['' ,Validators.required],
      isSingleLady: ['']
    });
  }

  ngOnInit(): void {
    this.loading = true;
    setTimeout(() => {
    }, 3000);
    this.sharedService.seat$.subscribe(s => {
      this.seat = s;
      this.setInitialValues();
    });
    this.sharedService.bus$.subscribe(b => {
      this.bookedbus = b;
      this.loading = false;
      this.setInitialValues();
    });
    this.sharedService.bookUser$.subscribe(bu => {
      this.bookingForm.patchValue({
        bookingDate: bu?.bookingDate,
        seat: bu?.seat,
        isSingleLady: bu?.isSingleLady
      });
    })
  }


  setInitialValues() {

    if (this.bookedbus) {

      this.busService.getBusbyId(this.bookedbus._id || '').subscribe({
        next: (resdata: IbusgetApiResponse) => {
          this.loading = false;
          this.bus = resdata.data as Ibus;
        },
        error: (err) => {
          this.loading = false;
        }
      })

      const busRoute = this.bookedbus.route
      let userpreviusdistance = 0;
      let userdistance = 0;
      let previusstation = busRoute[0].previousStation;
      busRoute.forEach((route, index) => {
        if (route.previousStation === previusstation) {
          userdistance += route.distance;
          previusstation = route.currentStation;
        } else {
          userpreviusdistance += route.distance;
        }
      });


      let newDepartureTime = new Date(new Date(this.bookedbus.departureTime).getTime() + (userpreviusdistance / 50) * 60000);


      let formattedDepartureTime = `${('0' + newDepartureTime.getHours()).slice(-2)}:${('0' + newDepartureTime.getMinutes()).slice(-2)}`;

      this.bookingForm.patchValue({
        busId: this.bookedbus._id,
        seatNumber: this.seat,
        departure: this.bookedbus.departure,
        destination: this.bookedbus.destination,
        departureTime: formattedDepartureTime,
        payment: userdistance * this.bookedbus.charge,
      });
    }
  }


  onSubmit(): void {
    if (this.bookingForm.valid) {
      this.loading = true;
      this.selectedSeat = undefined;
      setTimeout(() => {

      }, 1000);
      this.bookingService.getbookseat(this.bookingForm.value).subscribe({
        next: (resdata: IbookingSeatgetApiResponse) => {
      
          this.loading = false;
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.loading = false;
        }
      });
    } else {
      Object.values(this.bookingForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }
}