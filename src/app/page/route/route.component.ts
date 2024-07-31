import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, forkJoin, map, Subscription } from 'rxjs';
import { IDeleteApiResponse } from 'src/app/core/interfaces/idelete-api-response';
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
  departureId: string | undefined;
  destinationId: string | undefined;
  clonedRoute: Iroute | undefined;
  elemenatedStation: [{ index: number, station: Istation }] | undefined;
  private subscription: Subscription = new Subscription();

  constructor(
    private routeService: RouteService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private router: Router,
    private stationService: StationService
  ) {
    this.role = JSON.parse(localStorage.getItem('user') as string).role;
    this.routeForm = this.fb.group({
      _id: [""],
      departure: [{ value: "", disabled: true }, Validators.required],
      destination: [{ value: "", disabled: true }, Validators.required],
      distance: ["", Validators.required],
      routeName: ["", [Validators.required, Validators.pattern('^[A-Za-z]+ - [A-Za-z]+$')]],
      stations: this.fb.array([])
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
          this.departureId = (departureRes.data as Istation)._id;
          const destinationStation = (destinationRes.data as Istation).station;
          this.destinationId = (destinationRes.data as Istation)._id;

          while (this.stationArray.length > 0) {
            this.stationArray.removeAt(0);
          }

          this.routeForm.patchValue({
            departure: departureStation,
            destination: destinationStation
          });
          this.stations = this.stations.filter(s => s._id !== this.departureId && s._id !== this.destinationId);
        }),
        catchError(error => {
          this.routeForm.get('routeName')?.setValue('')
          return [];
        })
      ).subscribe();
    }
  }


  selectStation(e: Event, index: number) {
    const input = e.target as HTMLSelectElement; // Ensure it's HTMLSelectElement
    const stationId = input.value;
  
    // If no station is selected, do nothing
    if (!stationId) {
      return;
    }
  
    // Handle station update if it's already selected
    const selectedFormGroup = this.stationArray.at(index) as FormGroup;
    const currentStationId = selectedFormGroup.get('station')?.value;
  
    if (currentStationId === stationId) {
      // If selecting the same station again, update the form control
      return;
    }
  
    // Check if the station is already selected in other fields
    const isDuplicate = this.stationArray.controls.some((control: AbstractControl) => {
      const formGroup = control as FormGroup;
      return formGroup.get('station')?.value === stationId && formGroup !== selectedFormGroup;
    });
  
    if (isDuplicate) {
      this.messageService.add({ severity: 'error', summary: 'Duplicate Selection', detail: 'This station has already been selected.' });
      input.value = ''; // Clear the selection
      return;
    }
  
    // Update the selected station in the form group
    selectedFormGroup.patchValue({ station: stationId });
  
    // Remove the selected station from the available list
    this.stations = this.stations.filter(s => s._id !== stationId);
  }
  
  
  


  createStation(): FormGroup {
    return this.fb.group({
      station: ['', Validators.required],
      order: ['', Validators.required],
      distanceFromStart: ['', Validators.required],
    });
  }

  addStation() {

    if (this.stationArray.valid && this.routeForm.controls['routeName'].valid) {

      const newStationIndex = this.stationArray.length - 1;
      this.stationArray.insert(newStationIndex, this.createStation());
      this.stationArray.at(newStationIndex).patchValue({
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
    if (this.stationArray.length > 1 && index !== this.stationArray.length - 1) {
      const removedStationId = this.stationArray.at(index).get('station')?.value;
      
      // Restore the removed station to the available list
      if (removedStationId) {
        const removedStation = this.stations.find(s => s._id === removedStationId);
        if (removedStation) {
          this.stations.push(removedStation);
        }
      }
      
      this.stationArray.removeAt(index);
    }
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
              icon: "success"
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
    this.routeService.deleteRoute(r._id as string).subscribe({
      next: (res: IDeleteApiResponse) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
        this.routes = this.routes.filter(i => i._id !== r._id);
      },
      error: (err) => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  onSubmit() {
    if (this.routeForm.valid) {
      this.loading = true;
      this.stationArray.insert(0, this.createStation());;
      this.stationArray.at(0).patchValue({
        station: this.departureId,
        order: 0,
        distanceFromStart: 0
      });

      this.stationArray.push(this.createStation());
      this.stationArray.at(this.stationArray.length -1).patchValue({
        station: this.destinationId,
        order: this.stationArray.length - 1,
        distanceFromStart: this.routeForm.get('distance')?.value
      });



      this.convertFormValuesToCamelCase(this.routeForm);

      const submitObservable = this.isedit ?
        this.routeService.updateRoute(this.routeForm.getRawValue()) :
        this.routeService.createRoute(this.routeForm.getRawValue());


      this.subscription.add(
        submitObservable.subscribe({
          next: (res: IrouteCreateResponse) => {
            delete this.selectedRoute;
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
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

  convertFormValuesToCamelCase(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);

      if (control instanceof FormGroup) {
        this.convertFormValuesToCamelCase(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(formGroupControl => {
          if (formGroupControl instanceof FormGroup) {
            this.convertFormValuesToCamelCase(formGroupControl);
          }
        });
      } else if (control instanceof FormControl) {
        if (typeof control.value === 'string') {
          control.setValue(this.toCamelCase(control.value));
        }
      }
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
}