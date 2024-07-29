import { Component, OnInit } from '@angular/core';
import { IrouteGetResponse } from 'src/app/core/interfaces/iroute-get-response';
import { Iroute } from 'src/app/core/interfaces/iroute.interface';
import { RouteService } from 'src/app/core/route.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-route',
  templateUrl: './route.component.html',
  styleUrls: ['./route.component.scss']
})
export class RouteComponent implements OnInit {
  routes!: Iroute[];
  loading = false;
  showform = false;
  role! : string ;
  selectedRoute !:Iroute  
  
  constructor(
    private routeService: RouteService
  ){
    this.role = localStorage.getItem('role') || '';
  }

  ngOnInit(): void {
    this.routeService.getAll().subscribe({
      next: (res : IrouteGetResponse) =>{
        this.routes = res.data as Iroute[];
      },
    })
  }

  addRoute(){
    this.showform = true;
  }

  selectRoute(route : Iroute){
    this.selectedRoute = route;
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

}
