import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Iuser } from 'src/app/core/interfaces/iuser';
import { AuthService } from 'src/app/core/services/auth.service';
import { SharedService } from 'src/app/core/services/shared.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  isedit: boolean = false
  profile: Iuser | undefined = undefined
  signupForm!: FormGroup;
  selectedRole!: string;
  loading: boolean = false;


  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private sharedService: SharedService,
  ) {
    this.signupForm = this.fb.group({
      _id: [this.profile?._id],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['user', Validators.required]
    })
  }

  ngOnInit(): void {

    this.sharedService.profile$.subscribe(p => {
      this.profile = p;
      this.setInitialValues();
    })
  }

  setInitialValues() {

    if (this.profile) {
      this.isedit = true;
      this.signupForm.patchValue({
        _id: this.profile._id,
        name: this.profile.name,
        email: this.profile.email,
      });
    }

  }


  onupdate() {
    this.loading = true;

    this.authService.update(this.signupForm.value).subscribe({
      next: (resdata: any) => {
        Swal.fire({
          icon: "success",
          title: "Oops...",
          text: resdata.message,
        });
        const localUser = JSON.parse(localStorage.getItem('user') as string)
        if (localUser == this.profile) {
          const token = localStorage.getItem('token') as string;
          localStorage.clear();
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(resdata));
        }
        this.signupForm.reset();
        this.isedit = false
        this.loading = false;
        this.router.navigate(['/'])
      },
      error: (res) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: res.error.message,
        });
        this.loading = false;
      }

    })

  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.loading = true;
      this.authService.signup(this.signupForm.value).subscribe({
        next: (resdata: any) => {
          this.loading = false;
          this.router.navigate(['/auth'])
        },
        error: (res) => {
          this.loading = false;
        }
      })
    } else {
      Object.values(this.signupForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

}
