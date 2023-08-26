import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { CommentService } from 'src/app/services/comment.service';
import { PostService } from 'src/app/services/post.service';
import { CommentType } from 'src/app/types/comment';
import { User } from 'src/app/types/user';

@Component({
  selector: 'app-post-comment',
  templateUrl: './post-comment.component.html',
  styleUrls: ['./post-comment.component.scss'],
})
export class PostComment implements OnInit {
  @Input() postId?: string;

  comments: CommentType[] = [];
  commentContent: string = '';
  isShowControlBox = false;

  currentUser?: User;

  commentSubscription = new Subject<void>();

  constructor(
    private postService: PostService,
    private commentService: CommentService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.postId = params['id'];

      // reset comments
      this.comments = [];

      this.postService
        .getPostComments(this.postId!)
        .pipe(takeUntil(this.commentSubscription))
        .subscribe((result) => {
          if (result) {
            result.forEach(async (item) => {
              // console.log(item.payload.doc.data());
              let comment: CommentType = item.payload.doc.data() as CommentType;
              let author: User = await this.commentService.getCommentAuthor(
                comment.userRef
              );
              comment.author = author;

              this.comments.push(comment);
            });
          }
        });
    });

    this.currentUser = this.authService.currentUser!;
  }

  ngOnDestroy() {
    this.commentSubscription.next();
  }

  onFocus(value: boolean) {
    this.isShowControlBox = value;
  }

  sendComment() {
    this.commentService.writeComment(
      this.commentContent,
      this.postId!,
      this.currentUser?.uid!
    );

    this.clearCommentContent();
  }

  clearCommentContent() {
    this.commentContent = '';
  }
}
