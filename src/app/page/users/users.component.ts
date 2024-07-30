import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
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
  visible: boolean = false;
  selectedUser: Iuser | null = null;
  constructor(
    private authService : AuthService,
    private messageService: MessageService
  ){}

  ngOnInit(): void {
    this.authService.getAllusers().subscribe({
      next : (res : IuserGetApiResponse) => {
        this.users = res.data as Iuser[];
      }
    })
  }




  onConfirm() {
    if (this.selectedUser) {
      this.authService.deleteUser(this.selectedUser._id as string).subscribe({
        next : () => {
          this.users = this.users?.filter(user => user._id!== (this.selectedUser as Iuser)._id)
        }
      })
        this.messageService.clear('confirm');
        this.visible = false;
    }
  }

  onReject() {
      this.selectedUser = null;
      this.messageService.clear('confirm');
      this.visible = false;
  }

  ondelete(u : Iuser){
    this.selectedUser = u
    if (!this.visible) {
      this.messageService.add({ key: 'confirm', sticky: true, severity: 'warn', summary: 'Are you sure?', detail: 'Confirm to delete' });
      this.visible = true;
  }
   
  }

}
