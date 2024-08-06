import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { catchError, forkJoin, map, Subscription } from 'rxjs';
import { IrouteCreateResponse } from 'src/app/core/interfaces/iroute-create-response';
import { IrouteGetResponse } from 'src/app/core/interfaces/iroute-get-response';
import { Iroute } from 'src/app/core/interfaces/iroute.interface';
import { IstaionGetApiresponse } from 'src/app/core/interfaces/istaion-get-apiresponse';
import { Istation } from 'src/app/core/interfaces/istation';
import { RouteService } from 'src/app/core/route.service';
import { StationService } from 'src/app/core/services/station.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-route',
  templateUrl: './route.component.html',
  styleUrls: ['./route.component.scss']
})
export class RouteComponent implements OnInit {
  routes!: Iroute[];
  loading = false;
  isShowForm = false;
  role!: string;
  selectedRoute: Iroute | undefined;
  routeForm!: FormGroup;
  isedit = false;
  stations: Istation[] = [];
  departureStation : string | undefined;
  destination : string | undefined;
  clonedRoute !: Iroute;
  elemenatedStation: [{ index: number, station: Istation }] | undefined;
  private subscription: Subscription = new Subscription();

  constructor(
    private routeService: RouteService,
    private fb: FormBuilder,
    private router: Router,
    private stationService: StationService,
    private cdr: ChangeDetectorRef
  ) {
    this.role = JSON.parse(localStorage.getItem('user') as string).role;
    this.routeForm = this.fb.group({
      _id: [""],
      departure: [{ value: "", disabled: true }, Validators.required],
      destination: [{ value: "", disabled: true }, Validators.required],
      distance: ["", Validators.required],
      routeName: ["", [Validators.required, Validators.pattern('^[A-Za-z]+ - [A-Za-z]+$')]],
      stations: this.fb.array([], this.validateStations())
    });
  }

  ngOnInit(): void {
    this.routeService.getAll().subscribe({
      next: (res: IrouteGetResponse) => {
        this.routes = res.data as Iroute[];
      },
    })
    this.stationService.getAll().subscribe({
      next: (res: IstaionGetApiresponse) => {
        this.stations = res.data as Istation[];
      },
    })
    if (this.selectedRoute) {
      this.setInitialValues();
    }
  }

  get stationArray() {
    return (this.routeForm.get('stations') as FormArray);
  }

  async setDepartureDestination(e: Event) {
    if (this.routeForm.get('routeName')?.valid) {
      const input = e.target as HTMLInputElement;
      const routeName = input.value;
      let [departure, destination] = routeName.split(' - ');
  
      const departure$ = this.stationService.getstationbyFilter(this.toCamelCase(departure));
      const destination$ = this.stationService.getstationbyFilter(this.toCamelCase(destination));
  
      forkJoin([departure$, destination$]).pipe(
        map(([departureRes, destinationRes]) => {
          const departureStation = (departureRes.data as Istation).station;
          const destinationStation = (destinationRes.data as Istation).station;
  
          this.departureStation = departureStation;
          this.destination = destinationStation;
 
          while (this.stationArray.length > 0) {
            this.stationArray.removeAt(0);
          }
  
          this.routeForm.patchValue({
            departure: departureStation,
            destination: destinationStation
          });
        }),
        catchError(error => {
          Swal.fire({
            position : 'top-end',
            title: 'Error',
            text: 'Please enter a proper Route Name where we have stations.',
            icon: 'error',
            toast: true,
            showConfirmButton: false,
            timer: 5000
          });
          this.routeForm.get('routeName')?.setValue('');
          return [];
        })
      ).subscribe();
    }
  }
  
  selectStation(e: MatSelectChange, index: number) {
    const input = e;
    const station = input.value;
  
    if (!station) {
      return;
    }
    
    const selectedFormGroup = this.stationArray.at(index) as FormGroup;
    
  
    const isDuplicate = this.stationArray.controls.some((control: AbstractControl) => {
      const formGroup = control as FormGroup;
      return formGroup.get('station')?.value === station && formGroup !== selectedFormGroup;
    });
  
    const isReserved = station === this.departureStation || station === this.destination;
  
    if (isDuplicate) {
      selectedFormGroup.get('station')?.setValue("");
      Swal.fire({
        position : 'top-end',
        title: 'Error',
        text: 'This station has already been selected.',
        icon: 'error',
        toast: true,
        showConfirmButton: false,
        timer: 5000
      });
      return;
    } else if (isReserved) {
      selectedFormGroup.get('station')?.setValue("");
      Swal.fire({
        position : 'top-end',
        title: 'Error',
        text: 'This station is reserved for departure or destination.',
        icon: 'error',  
        toast: true,
        showConfirmButton: false,
        timer: 5000
      });
      return;
    }
    selectedFormGroup.get('station')?.setValue(station);
  }
  

  validateStations(): (formArray: AbstractControl) => { [key: string]: boolean } | null {
    return (formArray: AbstractControl): { [key: string]: boolean } | null => {
      const controlArray = formArray as FormArray;
      if (controlArray.length === 0) {
        return null;
      }
  
      let previousDistance = 0;
      const totalDistance = this.routeForm.get('distance')?.value || 0;
  
      for (let i = 0; i < controlArray.length; i++) {
        const stationControl = controlArray.at(i) as FormGroup;
        const distanceFromStart = stationControl.get('distanceFromStart')?.value;
  
        if (distanceFromStart > totalDistance) {
          return { 'invalidDistance': true };
        }
  
        if (i > 0) {
          const previousStationControl = controlArray.at(i - 1) as FormGroup;
          const previousDistanceFromStart = previousStationControl.get('distanceFromStart')?.value;
  
          if (distanceFromStart <= previousDistanceFromStart) {
            return { 'invalidSequence': true };
          }
        }
  
        previousDistance = distanceFromStart;
      }
      return null;
    };
  }
  


  createStation(): FormGroup {
    return this.fb.group({
      station: ['', Validators.required],
      order: ['', Validators.required],
      distanceFromStart: ['', [Validators.required, Validators.min(0)]],
    });
  }

  addStation() {
    this.stationArray.updateValueAndValidity();

    if (this.stationArray.valid && this.routeForm.controls['routeName'].valid) {

      this.stationArray.push(this.createStation());
      this.stationArray.at(this.stationArray.length -1).patchValue({
        order: this.stationArray.length
      });

    } else {
      Object.values(this.routeForm.controls).forEach(control => {
        control.markAsTouched();
      });

      this.stationArray.controls.forEach(control => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach(innerControl => {
            innerControl.markAsTouched();
          });
        }
      });
    }
  }



  deleteStation(index: number) {
    const removedStationId = this.stationArray.at(index).get('station')?.value;

    if (removedStationId) {
      const removedStation = this.stations.find(s => s._id === removedStationId);
      if (removedStation) {
        this.stations.push(removedStation);
      }
    }
    this.stationArray.removeAt(index);
  }


  setInitialValues() {
    if (this.selectedRoute) {
      this.isedit = true;
      this.routeForm.patchValue({
        _id: this.selectedRoute._id,
        distance: this.stationArray.at(this.stationArray.length - 1).get('distanceFromStart')?.value,
        departure: this.selectedRoute.departure,
        destination: this.selectedRoute.destination,
        routeName: this.selectedRoute.routeName,
      });
      this.selectedRoute.stations.forEach((item: any) => {
        this.addStation();
        this.stationArray.at(this.stationArray.length - 1).patchValue({
          station: item.station,
          order: item.order,
          distanceFromStart: item.distanceFromStart,
        });
      })
      this.routeForm.patchValue({
        stations: this.selectedRoute.stations
      });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  selectRoute(route: Iroute) {
    this.clonedRoute = route;    
  }


  ondelete(route: Iroute) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed && route._id) {
        this.routeService.deleteRoute(route._id).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire({
              title: "Deleted!",
              text: "Your file has been deleted.",
              icon: "success",
              toast: true,
             
            });
            this.ngOnInit();
          },
          error: (err) => {
            this.loading = false;
          }
        })

      }
    });
  }


  onRowEditInit(r: Iroute) {
    this.selectedRoute = { ...r };
    this.setInitialValues();
    this.isedit = true;
    this.isShowForm = true;
  }

  onDelete(r: Iroute) {
    this.loading = true;
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed && r._id) {
        this.routeService.deleteRoute(r._id).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire({
              position : 'top-end',
              title: "Deleted!",
              text: "Your file has been deleted.",
              icon: "success",
              toast: true,
              showConfirmButton: false,
              timer: 5000
            });
            this.ngOnInit();
          },
          error: (err) => {
            this.loading = false;
          }
        });
      }
    });
    
  }
  onSubmit() {
    if (this.routeForm.valid) {
      this.loading = true;

      this.stationArray.insert(0, this.createStation());;
      this.stationArray.at(0).patchValue({
        station: this.departureStation,
        order: 0,
        distanceFromStart: 0
      });

      this.stationArray.push(this.createStation());
      this.stationArray.at(this.stationArray.length - 1).patchValue({
        station: this.destination,
        order: this.stationArray.length - 1,
        distanceFromStart: this.routeForm.get('distance')?.value
      });

      const stationsArrayWithIds = (this.routeForm.get('stations') as FormArray).controls.map(control => {
        const stationId = this.stations.find(s => s.station === (control.get('station') as FormControl).value) ;
        return {
            station: stationId,
            order: (control.get('order') as FormControl).value,
            distanceFromStart: (control.get('distanceFromStart') as FormControl).value
        };
    });







      const formValue = {
        ...this.routeForm.value,
        stations: stationsArrayWithIds
    };
    
      const submitObservable = this.isedit ?
        this.routeService.updateRoute(formValue) :
        this.routeService.createRoute(formValue);


      this.subscription.add(
        submitObservable.subscribe({
          next: (res: IrouteCreateResponse) => {
            delete this.selectedRoute;
            this.loading = false;
            this.isShowForm = false;
            this.isedit = false;
            this.routeForm.reset();
            (this.routeForm.get('stations') as FormArray).clear();
            Swal.fire({ title: 'Success', text: res.message, icon: 'success' });
            this.router.navigate(['/routes'])
          },
          complete: () => {
            this.loading = false;
            this.isShowForm = false;
            this.isedit = false;
          }
        })
      );
    } else {
      Object.values(this.routeForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }

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
}