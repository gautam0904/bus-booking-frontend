import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';

import { Router } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
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
  departureStation: string | undefined;
  destinationStation: string | undefined;
  selectedRoute: Iroute | undefined;
  stations: Istation[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private fb: FormBuilder,
    private busService: BusService,
    private router: Router,
    private sharedService: SharedService,
    private routeService: RouteService,
    private stationService: StationService,
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
      distance: ['',]
    });


  }

  addStop() {
    if (this.stopArray.length === 0) {
      this.stopArray.push(this.createStops());

      this.stopArray.at(this.stopArray.length - 1).patchValue({
        station: this.busForm.value.departure
      });
      this.stopArray.at(this.stopArray.length - 1).get('station')?.disable();
      this.stopArray.push(this.createStops());
      this.stopArray.at(this.stopArray.length - 1).patchValue({
        station: this.busForm.value.destination
      });
      this.stopArray.at(this.stopArray.length - 1).get('station')?.disable();
    } else {
      if (this.busForm.controls['busNumber'].valid && this.busForm.controls['route'].valid && this.busForm.controls['departureTime'].valid && this.busForm.controls['TotalSeat'].valid && this.busForm.controls['charge'].valid) {
        this.stopArray.insert(this.stopArray.length - 1, this.createStops());

      }

      else {
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
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  async selectRoute(e: MatSelectChange) {
    const route = e.value;

    const R = this.routes.find(r => r.routeName === route);
    if (!R) {
      return;
    }
    this.selectedRoute = R;
    let station: Istation[] = [];

    const stationPromises = R.stations.map(async (s) => {
      try {
        const resdata: IstaionGetApiresponse = await new Promise((resolve, reject) => {
          this.stationService.getstationbyFilter(this.toCamelCase(s.stationName || ""))
            .subscribe({
              next: (data) => resolve(data),
              error: (err) => reject(err),
            });
        });

        station.push(resdata.data as Istation);
      } catch (error) {
        this.loading = false;
      }
    });

    await Promise.all(stationPromises);

    this.stations = station;


    let [departure, destination] = route.split(' - ');

    const departureCamelCase = this.toCamelCase(departure.trim());
    const destinationCamelCase = this.toCamelCase(destination.trim());

    this.departureStation = departureCamelCase;
    this.destinationStation = destinationCamelCase;

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
        this.addStop();
      })
      .catch((err) => {
        console.error('Error fetching station data:', err);
        Swal.fire({
          title: 'Error',
          text: 'Please enter a proper Route Name where we have stations.',
          icon: 'error',
          position: 'top-end',
          toast: true,
          showConfirmButton: false,
          timer: 5000
        });
      });
  }

  deleteStop(index: number) {
    if (this.stopArray.length > 1) {
      this.stopArray.removeAt(index);
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: 'An error occurred',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      });
    }
  }

  selectStation(e: MatSelectChange, index: number) {
    const selectedStation = e.value;
    if (!selectedStation) {
      return;
    }

    const selectedFormGroup = this.stopArray.at(index) as FormGroup;
    const selectedOrder = this.selectedRoute?.stations.find(station => station.stationName === selectedStation)?.order;


    if (selectedOrder === undefined) {
      return;
    }

    const isDuplicate = this.stopArray.controls.some((control: AbstractControl) => {
      const formGroup = control as FormGroup;
      return formGroup.get('station')?.value === selectedStation && formGroup !== selectedFormGroup;
    });

    if (isDuplicate) {


      selectedFormGroup.get('station')?.setValue("");
      Swal.fire({
        title: 'Duplicate Selection',
        text: 'This station has already been selected.',
        icon: 'error',
        position: 'top-end',
        toast: true,
        showConfirmButton: false,
        timer: 5000
      });
      return;
    }

    const isReserved = selectedStation === this.departureStation || selectedStation === this.destinationStation;

    if (isReserved) {
      selectedFormGroup.get('station')?.setValue("");
      Swal.fire({
        title: 'Station Reserved',
        text: 'This station is reserved for departure or destination.',
        icon: 'error',
        position: 'top-end',
        toast: true,
        showConfirmButton: false,
        timer: 5000
      });
      return;
    }

    const isBefore = this.stopArray.controls.some((control: AbstractControl, i: number) => {
      if (i < index) {
        const previousStation = (control as FormGroup).get('station')?.value;
        const previousOrder = this.selectedRoute?.stations.find(station => station.stationName === previousStation)?.order;
        return previousOrder !== undefined && selectedOrder < previousOrder;
      }
      return false;
    });

    if (isBefore) {
      selectedFormGroup.get('station')?.setValue("");
      Swal.fire({
        title: 'Invalid Selection',
        text: 'You cannot select a station that comes before a previously selected station.',
        icon: 'error',
        position: 'top-end',
        toast: true,
        showConfirmButton: false,
        timer: 5000
      });
      return;
    }

    selectedFormGroup.get('station')?.setValue(selectedStation);
  }

  onSubmit() {
    console.log(this.busForm);

    if (this.busForm.valid) {

      this.busForm.patchValue({
        route: this.selectedRoute?._id
      })
      if (this.stopArray && this.stopArray.length > 0) {
        this.busForm.getRawValue().stops.forEach((stop: { station: string, distance: number }, index: number) => {

          const stationName = stop.station;


          let station = this.stations.find(
            station => station.station === stationName
          );
          this.stopArray.at(index).patchValue({
            station: station?._id,
          });
          station = this.selectedRoute?.stations.find(
            s => s.stationName === station?.station
          );

          if (station) {
            stop.station = station._id as string;

            if (index > 0) {
              if (station.distanceFromStart) {
                stop.distance = station.distanceFromStart
              }
            } else {
              stop.distance = 0;
            }

            this.stopArray.at(index).patchValue({
              distance: stop.distance
            });
          }
        });

      } else {
        this.routeValid = false;
      }

      this.loading = true;

      const submitObservable = this.isedit ?
        this.busService.updateBus(this.busForm.getRawValue()) :
        this.busService.createBus(this.busForm.getRawValue());

      this.subscription.add(
        submitObservable.subscribe({

          next: () => {
            console.log("hello");

            Swal.fire({
              title: 'Success',
              text: this.isedit ? 'Bus updated successfully' : 'Bus created successfully',
              icon: 'success',
              position: 'top-end',
              toast: true,
              showConfirmButton: false,
              timer: 5000
            });
          },

          complete: () => {
            this.loading = false;
            this.busForm.reset();
            this.router.navigate(['/']);
          }
        })
      );
    } else {
      this.markAllControlsAsTouched(this.busForm);
      this.markAllControlsAsTouched(this.stopArray);
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


