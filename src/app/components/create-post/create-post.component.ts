import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  faCircleQuestion,
  faClose,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { first, Subscription, take } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { PostService } from 'src/app/services/post.service';
import { UtilService } from 'src/app/services/util.service';
import { User } from 'src/app/types/user';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent implements OnInit {
  isLoading: boolean = false;
  loadingSubcription!: Subscription;

  createPostForm!: FormGroup;
  imageSource!: string;

  imageError: boolean = false;

  keywords: string = '';

  currentUser!: User;
  constructor(
    public fb: FormBuilder,
    private postService: PostService,
    private authService: AuthService,
    private utilService: UtilService
  ) {
    this.createPostForm = this.fb.group({
      image: ['', Validators.required],
      title: [''],
      keywords: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z0-9,\s]+$/)],
      ],
      description: ['', Validators.maxLength(300)],
    });
  }

  ngOnInit(): void {
    this.loadingSubcription = this.postService.isLoading.subscribe((status) => {
      this.isLoading = status;
    });
    this.authService.userObserver.subscribe((user) => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    this.loadingSubcription.unsubscribe();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.createPostForm.controls;
  }

  faUpload = faUpload;
  faClose = faClose;
  faQuestion = faCircleQuestion;

  submit() {
    if (this.createPostForm.valid) {
      this.postService.createPost(this.createPostForm.value);
    }
  }

  showPreview(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      if (this.utilService.isFileImage(file)) {
        this.createPostForm.patchValue({
          image: file,
        });
        this.createPostForm.get('image')?.updateValueAndValidity();
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
}
