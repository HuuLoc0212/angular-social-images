import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
  signInForm!: FormGroup;
  isInvalidSubmit: boolean = false;
  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      email: [
        '',
        [
          Validators.pattern(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
          Validators.required,
        ],
      ],
      password: ['', [Validators.required]],
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.signInForm.controls;
  }

  onSubmit() {
    if (this.signInForm.valid) {
      this.authService.signIn(this.f['email'].value, this.f['password'].value);
    } else {
      this.isInvalidSubmit = true;
      this.signInForm.markAllAsTouched();
    }
  }

  signInWithGoogle() {
    this.authService.GoogleAuth();
  }

  signInWithFacebook() {
    this.authService.FacebookAuth();
  }

  faFacebook = faFacebook;
  faGoogle = faGoogle;
}
