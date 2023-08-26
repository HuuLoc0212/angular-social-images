import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import {
  faDownload,
  faHeart,
  faLink,
  faPencil,
  faSquareArrowUpRight,
} from '@fortawesome/free-solid-svg-icons';
import { filter, Subject, Subscription, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { FollowService } from 'src/app/services/follow.service';
import { PostService } from 'src/app/services/post.service';
import { Post } from 'src/app/types/post';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent implements OnInit {
  id!: string;
  post?: Post;
  imageHeight!: number;

  postSubscription = new Subject<void>();

  isFollow: boolean = false;
  isLiked: boolean = false;
  isAuthor: boolean = false;
  isEdit: boolean = false;

  isLoading: boolean = true;

  // related posts
  relatedPosts: Post[] = [];
  relatedPostsSubscription = new Subject<void>();

  // is post exist
  isExist: boolean = true;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private followService: FollowService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // When router changes => Unsubscribe
    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe(() => {
        this.relatedPosts = [];

        this.relatedPostsSubscription.next();
        this.postSubscription.next();
      });
  }

  getImageHeight(dom: any) {
    this.imageHeight = dom.clientHeight;
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.id = params['id'];

      this.postService.checkPost(this.id).subscribe((post) => {
        if (!post.exists) {
          this.isExist = false;
        } else {
          this.postService.getPostOnce(this.id).subscribe((result) => {
            const post: Post = result as Post;

            this.getRelatedPosts(post);
          });

          this.postService
            .getPost(this.id)
            .pipe(takeUntil(this.postSubscription))
            .subscribe(async (result) => {
              if (result) {
                const populatedPost: Post = await this.postService.populatePost(
                  result.payload.data() as Post
                );
                this.post = populatedPost;

                // Check if user is liked post

                this.post?.likes?.some(
                  (userRef) => userRef.id == this.authService.currentUser?.uid
                )
                  ? (this.isLiked = true)
                  : (this.isLiked = false);

                // Check if user is author
                this.post?.author?.uid == this.authService.currentUser?.uid
                  ? (this.isAuthor = true)
                  : (this.isAuthor = false);

                // check follow
                if (!this.isAuthor) {
                  this.isFollow = this.followService.checkFollow(
                    this.post.author!
                  );
                }

                this.isLoading = false;
              }
            });
        }
      });
    });
  }

  getRelatedPosts(post: Post) {
    // related posts
    if (post?.keywords && post?.keywords.length > 0) {
      this.postService
        .getPostsByKeywords(post?.keywords)
        .pipe(takeUntil(this.relatedPostsSubscription))
        .subscribe((result) => {
          result.forEach(async (item) => {
            if (item.type == 'added') {
              let relatedPost: Post = item.payload.doc.data() as Post;

              // not include this post
              if (relatedPost.id !== this.id) {
                relatedPost = await this.postService.populatePost(relatedPost);
                this.relatedPosts.push(relatedPost);
              }
            }
          });
        });
    }
  }

  handleDownload(): void {
    this.postService.downloadImage(this.post!.imageUrl, this.post!.title);
  }

  handleCopy(): void {
    this.postService.copyImageUrl(this.post!);
  }

  handleLikePost(): void {
    this.postService.likePost(this.post!, this.authService.currentUser!.uid);
  }

  handleEditPost(): void {
    this.isEdit = !this.isEdit;
  }

  handleFollow(): void {
    this.followService.followUser(
      this.authService.currentUser!,
      this.post?.author!
    );

    this.isFollow = !this.isFollow;
  }

  viewImage(): void {
    window.open(this.post?.imageUrl);
  }

  downloadIcon = faDownload;
  copyIcon = faLink;
  heartIcon = faHeart;
  editIcon = faPencil;
  viewIcon = faSquareArrowUpRight;
}
