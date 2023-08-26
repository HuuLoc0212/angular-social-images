import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subscription, take } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UtilService } from 'src/app/services/util.service';
import { User } from 'src/app/types/user';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {
  editUserForm!: FormGroup;
  currentUser!: User;
  userSubscription!: Subscription;

  imageSource?: string;
  editAvatar: any;
  imageError: boolean = false;

  isFetching: boolean = true;
  isLoading: boolean = false;

  _username: string = '';
  isUsernameExist: boolean = false;

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    private fb: FormBuilder
  ) {
    this.editUserForm = this.fb.group({
      image: [''],
      displayName: [''],
      bio: ['', Validators.maxLength(300)],
      username: [
        '',
        [
          Validators.required,
          Validators.maxLength(20),
          Validators.minLength(4),
          Validators.pattern(/^[a-zA-Z0-9_.-]*$/),
        ],
      ],
    });
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.userObserver.subscribe(
      (userResult: User) => {
        if (userResult) {
          this.currentUser = userResult;

          // display avatar
          this.imageSource = userResult.avatar;

          // current username
          this._username = userResult.username;

          this.editUserForm.patchValue({
            displayName: userResult.displayName ?? '',
            bio: userResult.bio ?? '',
            username: userResult.username,
          });

          // Fetch done
          this.isFetching = false;
        }
      }
    );
  }

  async handleSubmit() {
    if (this.editUserForm.valid) {
      const editUserData: EditUserData = this.editUserForm.value;
      this.isLoading = true;
      if (editUserData.username != this._username) {
        this.authService
          .getUserByUsername(editUserData.username)
          .pipe(take(1))
          .subscribe(async (res) => {
            // user exist => username exist
            if (res[0]) {
              this.isUsernameExist = true;

              this.isLoading = false;
              // hide error
              setTimeout(() => {
                this.isUsernameExist = false;
              }, 3000);
              return;
            }

            await this.authService.updateUser(editUserData);
            this.isLoading = false;
          });
      } else {
        await this.authService.updateUser(editUserData);
        this.isLoading = false;
      }
    } else {
      this.editUserForm.markAllAsTouched();
    }
  }

  get f(): { [key: string]: AbstractControl } {
    return this.editUserForm.controls;
  }

  showPreview(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      if (this.utilService.isFileImage(file)) {
        this.editUserForm.patchValue({
          image: file,
        });
        this.editUserForm.get('image')?.updateValueAndValidity();
        // File Preview
        const reader = new FileReader();
        reader.onload = () => {
          this.imageSource = reader.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        this.imageError = true;
        this.resetImageError();
      }
    }
  }

  resetImageError() {
    setTimeout(() => (this.imageError = false), 3000);
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}

interface EditUserData {
  image?: File;
  displayName?: string;
  bio?: string;
  username: string;
}
