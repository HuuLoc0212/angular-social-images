import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PostService } from 'src/app/services/post.service';
import { Post } from 'src/app/types/post';

@Component({
  selector: 'app-post-liked',
  templateUrl: './post-liked.component.html',
  styleUrls: ['./post-liked.component.scss'],
})
export class PostLikedComponent implements OnInit {
  posts: any[] = [];
  postsSubscription = new Subject<void>();
  constructor(
    private postService: PostService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.parent!.params.subscribe(async (params) => {
      const username = params['username'];

      this.postService.getUserLikedPosts(username).subscribe((user) => {
        user.pipe(takeUntil(this.postsSubscription)).subscribe((result) => {
          result.forEach(async (item) => {
            if (item.type == 'added') {
              const populatedPost = await this.postService.populatePost(
                item.payload.doc.data() as Post
              );
              this.posts.push(populatedPost);
            }
          });
        });
      });
    });
  }

  ngOnDestroy() {
    this.postsSubscription.next();
  }
}
