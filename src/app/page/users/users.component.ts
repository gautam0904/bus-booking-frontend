import { Component, OnInit } from '@angular/core';
import { Iuser } from 'src/app/core/interfaces/iuser';
import { IuserGetApiResponse } from 'src/app/core/interfaces/iuser-get-api-response';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit  {
  users !: Iuser[] ;

  constructor(
    private authService : AuthService,
  ){}

  ngOnInit(): void {
    this.authService.getAllusers().subscribe({
      next : (res : IuserGetApiResponse) => {
        this.users = res.data as Iuser[];
      }
    })
  }

  ondelete(u : Iuser){
    this.authService.deleteUser(u._id as string).subscribe({
      next : () => {
        this.users = this.users?.filter(user => user._id!== u._id)
      }
    })
  }

}
