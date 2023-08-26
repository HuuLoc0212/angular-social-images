import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { faCircleQuestion, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { PostService } from 'src/app/services/post.service';
import { Post } from 'src/app/types/post';

@Component({
  selector: 'app-edit-post',
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.scss'],
})
export class EditPostComponent implements OnInit {
  @Output() onClose: EventEmitter<void> = new EventEmitter();
  @Input() post?: Post;

  editPostForm!: FormGroup;

  isLoading: boolean = false;
  loadingSubcription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private router: Router
  ) {
    this.editPostForm = this.fb.group({
      title: [''],
      keywords: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z0-9,\s]+$/)],
      ],
      description: ['', Validators.maxLength(300)],
    });
  }

  ngOnInit(): void {
    const strKeywords = this.post?.keywords?.join(', ');

    this.editPostForm.patchValue({
      title: this.post?.title,
      description: this.post?.description,
      keywords: strKeywords,
    });
    this.loadingSubcription = this.postService.isLoading.subscribe((status) => {
      this.isLoading = status;
    });
  }

  ngOnDestroy() {
    this.loadingSubcription.unsubscribe();
  }

  handleClose() {
    this.onClose.emit();
  }

  async handleDelete() {
    this.isLoading = true;
    await this.postService.deletePost(this.post!);
    this.isLoading = false;

    this.router.navigateByUrl('/');
  }

  async handleSubmit() {
    if (this.editPostForm.valid) {
      await this.postService.editPost(this.post!.id, this.editPostForm.value);

      // Close modal
      this.handleClose();
    } else {
      this.editPostForm.markAllAsTouched();
    }
  }

  get f(): { [key: string]: AbstractControl } {
    return this.editPostForm.controls;
  }

  faClose = faXmark;
  faQuestion = faCircleQuestion;
}
