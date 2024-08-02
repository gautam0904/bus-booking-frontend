import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  bookedbus: Ibus | undefined = undefined;
  bookingForm: FormGroup;
  bus: Ibus | undefined = undefined
  seats: number[] | undefined = undefined;


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
      paymentMethod: ['', Validators.required],
      mobileNo : ['', [Validators.required , Validators.pattern(/^\d{10}$/)]],
      isSingleLady: [''],
      passenger: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loading = true;
  
    this.sharedService.seat$.subscribe(s => {
      this.seats = s;
      this.seats?.forEach(s => this.addpassenger())
    });

    this.sharedService.bus$.subscribe(b => {
      this.bookedbus = b;
      this.loading = false;
      this.setInitialValues();
    });
    this.sharedService.bookUser$.subscribe(b => {
      this.bookingForm.patchValue({
        bookingDate: b?.bookingDate,
        seat: b?.seat,
        isSingleLady: b?.isSingleLady
      });
    })
  }

  get passengerArray() {
    return (this.bookingForm.get('passenger') as FormArray);
  }

  createpassenger(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      age: ['', Validators.required],
      gender: ['', Validators.required],
    });
  }

  addpassenger() {
    this.passengerArray.push(this.createpassenger());
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

      const busRoute = this.bookedbus.route;

      let userpreviusdistance = 0;
      let userdistance = 0;

      // let previusstation = busRoute[0].previousStation;

      // busRoute.forEach((route, index) => {
      //   if (route.previousStation === previusstation) {
      //     userdistance += route.distance;
      //     previusstation = route.currentStation;
      //   } else {
      //     userpreviusdistance += route.distance;
      //   }
      // });

      let newDepartureTime = new Date(new Date(this.bookedbus.departureTime).getTime() + (userpreviusdistance / 50) * 60000);

      let formattedDepartureTime = `${('0' + newDepartureTime.getHours()).slice(-2)}:${('0' + newDepartureTime.getMinutes()).slice(-2)}`;

      this.bookingForm.patchValue({
        busId: this.bookedbus._id,
        seatNumber: this.seats,
        departure: this.bookedbus.departure,
        destination: this.bookedbus.destination,
        departureTime: formattedDepartureTime,
        payment: userdistance * this.bookedbus.charge,
      });
    }
  }

 // Add a class-level variable to keep track of the previous payment method
private previousMethod: string = '';

pamentMethod(event: any): void {
    const selectedMethod = event.target.value;
    const currentPayment = this.bookingForm.controls['payment'].value || 0;

    if (this.previousMethod === 'upi') {
        if (selectedMethod !== 'upi') {
            this.bookingForm.patchValue({
                payment: currentPayment - 26
            });
        }
    } else if (this.previousMethod === 'card') {
        if (selectedMethod !== 'card') {
            this.bookingForm.patchValue({
                payment: currentPayment + 26
            });
        }
    } else {
        if (selectedMethod === 'upi') {
            this.bookingForm.patchValue({
                payment: currentPayment + 26
            });
        } else if (selectedMethod === 'card') {
        }
    }
    this.previousMethod = selectedMethod;
}


  onSubmit(): void {
    if (
      this.bookingForm.controls['busId'].valid &&
      this.bookingForm.controls['seatNumber'].valid &&
      this.bookingForm.controls['departure'].valid &&
      this.bookingForm.controls['destination'].valid &&
      this.bookingForm.controls['departureTime'].valid &&
      this.bookingForm.controls['payment'].valid &&
      this.bookingForm.controls['bookingDate'].valid &&
      this.bookingForm.controls['seat'].valid &&
      this.bookingForm.controls['paymentMethod'].valid &&
      this.bookingForm.controls['mobileNo'].valid &&
      this.bookingForm.controls['isSingleLady'].valid  &&
      this.passengerArray.controls.every(control => control.valid) 
    ) {
      this.loading = true;
      
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
      this.markAllControlsAsTouched(this.bookingForm);
      this.markAllControlsAsTouched(this.passengerArray);
    }
  }
  private markAllControlsAsTouched(formGroup: FormGroup | FormArray): void {
    if (formGroup instanceof FormGroup) {
      Object.values(formGroup.controls).forEach(control => {
        control.markAsTouched();
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.markAllControlsAsTouched(control);
        }
      });
    } else if (formGroup instanceof FormArray) {
      formGroup.controls.forEach(control => {
        control.markAsTouched();
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.markAllControlsAsTouched(control);
        }
      });
    }
}
}