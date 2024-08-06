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
  seats: number[] | undefined = undefined;
  private previousMethod: string = '';

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
      mobileNo: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      isSingleLady: [''],
      passenger: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loading = true;

  

    this.sharedService.bus$.subscribe(b => {     
      this.bookedbus = b;
      this.loading = false;
    });
    this.sharedService.bookUser$.subscribe(b => {
      this.bookingForm.patchValue({
        bookingDate: b?.bookingDate,
        seat: b?.seat,
        isSingleLady: b?.isSingleLady
      });
    })
      this.sharedService.seat$.subscribe(s => {
      this.seats = s;
      this.seats?.forEach(s => this.addpassenger())
    });
    this.setInitialValues();
  }

  get passengerArray() {
    return (this.bookingForm.get('passenger') as FormArray);
  }

  createpassenger(): FormGroup {
    if (this.bookingForm.get('isSingleLady')?.value === true) {
      return this.fb.group({
        name: ['', Validators.required],
        age: ['', Validators.required],
        gender: [{ value: 'Female', disabled: true }, Validators.required,],
      });
    }
    else {
      return this.fb.group({
        name: ['', Validators.required],
        age: ['', Validators.required],
        gender: ['', Validators.required,],
      });
    }
  }

  addpassenger() {
    this.passengerArray.push(this.createpassenger());
  }




  setInitialValues() {

    if (this.bookedbus) {

      // this.busService.getBusbyId(this.bookedbus._id || '').subscribe({
      //   next: (resdata: IbusgetApiResponse) => {
      //     this.loading = false;
      //     this.bus = resdata.data as Ibus;
      //   },
      //   error: (err) => {
      //     this.loading = false;
      //   }
      // })


        const busStop = this.bookedbus.stops;
        let userdistance = 0;
     

        busStop.forEach((s) => {
         userdistance += s.distance
        });
       
        this.bookingForm.patchValue({
          busId: this.bookedbus._id,
          seatNumber: this.seats,
          departure: this.bookedbus.departure,
          destination: this.bookedbus.destination,
          departureTime: this.bookedbus.departureTime,
          payment: userdistance * this.bookedbus.charge *(this.seats?.length || 0),
        });
      }


    }
  

    pamentMethod(event: any): void {
      const selectedMethod = event.value;
      const currentPayment = this.bookingForm.controls['payment'].value || 0;
  
      if (this.previousMethod === 'upi' && selectedMethod !== 'upi') {
        this.bookingForm.patchValue({ payment: currentPayment - 26 });
      } else if (this.previousMethod === 'card' && selectedMethod !== 'card') {
        this.bookingForm.patchValue({ payment: currentPayment + 26 });
      } else if (this.previousMethod === '' && selectedMethod === 'upi') {
        this.bookingForm.patchValue({ payment: currentPayment + 26 });
      }
  
      this.previousMethod = selectedMethod;
    }


  onSubmit(): void {
    console.log(this.bookingForm);
    
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
      this.bookingForm.controls['isSingleLady'].valid &&
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