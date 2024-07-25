import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Ibus } from 'src/app/core/interfaces/ibus';
import { IbusCreateApiResponse } from 'src/app/core/interfaces/ibus-create-api-response';
import { BusService } from 'src/app/core/services/bus.service';
import { SharedService } from 'src/app/core/services/shared.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-bus',
  templateUrl: './add-bus.component.html',
  styleUrls: ['./add-bus.component.scss']
})
export class AddBusComponent {
  isedit = false;
  routeValid = true;
  role!: string;
  busForm!: FormGroup;
  cloneBus: Ibus | undefined;
  loading: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(private fb: FormBuilder,
    private busService: BusService,
    private router: Router,
    private sharedService: SharedService,

  ) {
    this.role = JSON.parse(localStorage.getItem('user') as string)?.role || "";
    this.busForm = this.fb.group({
      _id: [""],
      busNumber: ['', [Validators.required, Validators.pattern('^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$')]],
      departure: ['', Validators.required],
      departureTime: ['', Validators.required],
      destination: ['', Validators.required],
      TotalSeat: [Validators.required, this.seatRangeValidator()],
      charge: ['', Validators.required],
      route: this.fb.array([])
    });

  }


  ngOnInit(): void {
    this.subscription.add(
      this.sharedService.bus$.subscribe(b => {
        this.cloneBus = b;
        this.setInitialValues();
      })
    );
  }

  seatRangeValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value !== null && (isNaN(value) || value < 0 || value > 50)) {
        return { 'seatRange': true };
      }
      return null; 
    };
  }

  get routeArray() {
    return (this.busForm.get('route') as FormArray);
  }

  createRoute(): FormGroup {
    if (this.routeArray.length == 0) {
      return this.fb.group({
        previousStation: [{ value: this.busForm.value.departure , disabled: true }, Validators.required],
        currentStation: ['', Validators.required],
        distance: ['', Validators.required],
      });
    } else {
      return this.fb.group({
        previousStation: [{ value : this.busForm.value.route[this.routeArray.length - 1].currentStation , disabled: true}, Validators.required],
        currentStation: ['', Validators.required],
        distance: ['', Validators.required],
      });
      
    }
  }

  addRoute() {
    
    if (this.routeArray.valid && this.busForm.controls['busNumber'].valid && this.busForm.controls['departure'].valid && this.busForm.controls['departureTime'].valid && this.busForm.controls['TotalSeat'].valid && this.busForm.controls['charge'].valid) {


      this.routeArray.push(this.createRoute());

      if (this.routeArray.length == 1) {
        this.routeArray.at(this.routeArray.length - 1).patchValue({
          previousStation: this.busForm.value.departure
        });
       
      } else {        
        this.routeArray.at(this.routeArray.length - 1).patchValue({
          previousStation: this.busForm.value.route[this.routeArray.length - 2].currentStation
        });
      }
    } else {
      Object.values(this.busForm.controls).forEach(control => {
        control.markAsTouched();
      });

      this.routeArray.controls.forEach(control => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach(innerControl => {
            innerControl.markAsTouched();
          });
        }
      });
    }
  }



  deleteRoute(index: number) {
    if (this.routeArray.length > 1) {
      this.routeArray.removeAt(index);
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: 'An error occurred',
        showConfirmButton: false,
        timer: 2000
      });
    }
  }

  setInitialValues() {
    if (this.cloneBus) {
      this.isedit = true;
      this.cloneBus.route.forEach((item: any) => {
        this.addRoute();
        this.routeArray.at(this.routeArray.length - 1).patchValue({
          previousStation: item.previousStation,
          currentStation: item.currentStation,
          distance: item.distance
        });
      })
      this.busForm.patchValue({
        _id: this.cloneBus._id,
        busNumber: this.cloneBus.busNumber,
        departure: this.cloneBus.departure,
        departureTime: this.cloneBus.departureTime,
        destination: this.cloneBus.destination,
        TotalSeat: this.cloneBus.TotalSeat,
        charge: this.cloneBus.charge,
        route: this.cloneBus.route
      });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  onSubmit() {

    if (this.routeArray && this.routeArray.length > 0) {
      const lastIndex = this.routeArray.length - 1;
      const lastRoute = this.routeArray.at(lastIndex) as FormGroup;


      if (lastRoute && lastRoute.get('currentStation')) {
        const currentStationValue = lastRoute.get('currentStation')?.value ?? '';

        this.busForm.patchValue({
          destination: currentStationValue
        });
      }
    }
    else {
      this.routeValid = false;
    }
    if (this.busForm.valid) {
      this.loading = true;

      const submitObservable = this.isedit ?
        this.busService.updateBus(this.busForm.getRawValue()) :
        this.busService.createBus(this.busForm.getRawValue());

      this.subscription.add(
        submitObservable.subscribe({
          next: (resdata: IbusCreateApiResponse) => {
            this.loading = false;
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.loading = false;
          }
        })
      );
    } else {
      Object.values(this.busForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

}
