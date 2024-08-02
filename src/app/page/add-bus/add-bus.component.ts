import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, firstValueFrom, forkJoin, map, Subscription } from 'rxjs';
import { Ibus } from 'src/app/core/interfaces/ibus';
import { IbusCreateApiResponse } from 'src/app/core/interfaces/ibus-create-api-response';
import { IrouteGetResponse } from 'src/app/core/interfaces/iroute-get-response';
import { Iroute } from 'src/app/core/interfaces/iroute.interface';
import { IstaionGetApiresponse } from 'src/app/core/interfaces/istaion-get-apiresponse';
import { Istation } from 'src/app/core/interfaces/istation';
import { RouteService } from 'src/app/core/route.service';
import { BusService } from 'src/app/core/services/bus.service';
import { SharedService } from 'src/app/core/services/shared.service';
import { StationService } from 'src/app/core/services/station.service';
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
  routes: Iroute[] = []
  busForm!: FormGroup;
  cloneBus: Ibus | undefined;
  loading: boolean = false;
  departureStation : string | undefined;
  destinationStation : string | undefined;
  stations: Istation[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private fb: FormBuilder,
    private busService: BusService,
    private router: Router,
    private sharedService: SharedService,
    private routeService: RouteService,
    private stationService: StationService,
    private messageService: MessageService,
  ) {
    this.role = JSON.parse(localStorage.getItem('user') as string)?.role || "";
    this.busForm = this.fb.group({
      _id: [""],
      busNumber: ['', [Validators.required, Validators.pattern('^[0-9]{1,3}[ -][A-Z]{1}$')]],
      route: ['', Validators.required],
      departure: ['', Validators.required],
      departureTime: ['', Validators.required],
      destination: ['', Validators.required],
      TotalSeat: [Validators.required, this.seatRangeValidator()],
      charge: ['', Validators.required],
      stops: this.fb.array([])
    });

  }


  ngOnInit(): void {
    this.routeService.getAll().subscribe({
      next: (res: IrouteGetResponse) => {
        this.routes = (res.data as Iroute[]);
      }
    })
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



  selectRoute(e: MatSelectChange) {
    const route = e.value;

    const R = this.routes.find(r => r.routeName === route);
    if (!R) {
      return;
    }

    this.stations = R.stations;

    let [departure, destination] = route.split(' - ');

    const departureCamelCase = this.toCamelCase(departure.trim());
    const destinationCamelCase = this.toCamelCase(destination.trim());

    this.departureStation = destinationCamelCase;
    this.destinationStation = departureCamelCase;

    Promise.all([
      firstValueFrom(this.stationService.getstationbyFilter(departureCamelCase)),
      firstValueFrom(this.stationService.getstationbyFilter(destinationCamelCase))
    ])
      .then(([departureRes, destinationRes]) => {
        const departureStation = (departureRes.data as Istation).station;
        const destinationStation = (destinationRes.data as Istation).station;

        if (this.busForm) {
          this.busForm.patchValue({
            departure: departureStation,
            destination: destinationStation
          });
        }
      })
      .catch((err) => {
        console.error('Error fetching station data:', err);
        Swal.fire({
          title: 'Error',
          text: 'Please enter a proper Route Name where we have stations.',
          icon: 'error',
          confirmButtonText: 'Okay'
        });
      });
  }




  toCamelCase(str: string) {
    return str
      .split(' ')
      .map((word, index) => {
        if (index === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  }

  get stopArray() {
    return (this.busForm.get('stops') as FormArray);
  }

  createStops(): FormGroup {
    return this.fb.group({
      station: ['', Validators.required],
      distance: ['', Validators.required]
    });


  }

  addStop() {
    console.log(this.stopArray.valid && this.busForm.controls['busNumber'].valid && this.busForm.controls['route'].valid && this.busForm.controls['departureTime'].valid && this.busForm.controls['TotalSeat'].valid && this.busForm.controls['charge'].valid);

    if (this.busForm.controls['busNumber'].valid && this.busForm.controls['route'].valid && this.busForm.controls['departureTime'].valid && this.busForm.controls['TotalSeat'].valid && this.busForm.controls['charge'].valid) {

      if (this.stopArray.length === 0) {
        this.stopArray.push(this.createStops());
        this.stopArray.at(this.stopArray.length - 1).patchValue({
          station: this.busForm.value.departure
        });
        this.stopArray.push(this.createStops());
        this.stopArray.at(this.stopArray.length - 1).patchValue({
          station: this.busForm.value.destination
        });
      }else{

      this.stopArray.insert(this.stopArray.length - 1, this.createStops());

      }
    } else {
      Object.values(this.busForm.controls).forEach(control => {
        control.markAsTouched();
      });

      this.stopArray.controls.forEach(control => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach(innerControl => {
            innerControl.markAsTouched();
          });
        }
      });
    }
  }



  deleteRoute(index: number) {
    if (this.stopArray.length > 1) {
      this.stopArray.removeAt(index);
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
      this.busForm.patchValue({
        _id: this.cloneBus._id,
        busNumber: this.cloneBus.busNumber,
        route: this.cloneBus.route,
        departure: this.cloneBus.departure,
        departureTime: this.cloneBus.departureTime,
        destination: this.cloneBus.destination,
        TotalSeat: this.cloneBus.TotalSeat,
        charge: this.cloneBus.charge,
      });
      this.cloneBus.stops.forEach((item: any) => {
        this.addStop();
        this.stopArray.at(this.stopArray.length - 1).patchValue({
          previousStation: item.previousStation,
          currentStation: item.currentStation,
          distance: item.distance
        });
      })
      this.busForm.patchValue({
        route: this.cloneBus.route
      });
    }
  }

  selectStation(e: MatSelectChange, index: number) {
    const input = e;
    const station = input.value;
  
    if (!station) {
      return;
    }
    
    const selectedFormGroup = this.stopArray.at(index) as FormGroup;
    
  
    const isDuplicate = this.stopArray.controls.some((control: AbstractControl) => {
      const formGroup = control as FormGroup;
      return formGroup.get('station')?.value === station && formGroup !== selectedFormGroup;
    });
  
    const isReserved = station === this.departureStation || station === this.destinationStation;
  
    if (isDuplicate) {
      selectedFormGroup.get('station')?.setValue("");
      this.messageService.add({
        severity: 'error',
        summary: 'Duplicate Selection',
        detail: 'This station has already been selected.'
      });
      return;
    } else if (isReserved) {
      selectedFormGroup.get('station')?.setValue("");
      this.messageService.add({
        severity: 'error',
        summary: 'Station Reserved',
        detail: 'This station is reserved for departure or destination.'
      });
      return;
    }
    selectedFormGroup.get('station')?.setValue(station);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  onSubmit() {

    console.log(this.busForm.value);


    if (this.stopArray && this.stopArray.length > 0) {

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
