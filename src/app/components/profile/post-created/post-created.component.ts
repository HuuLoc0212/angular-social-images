import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { filter, finalize, Subject, takeUntil } from 'rxjs';
import { PostService } from 'src/app/services/post.service';
import { Post } from 'src/app/types/post';

@Component({
  selector: 'app-post-created',
  templateUrl: './post-created.component.html',
  styleUrls: ['./post-created.component.scss'],
})
export class PostCreatedComponent implements OnInit {
  posts: Post[] = [];
  postsSubscription = new Subject<void>();

  isLoading: boolean = true;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // When router changes => Unsubscribe
    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe(() => {
        this.posts = [];
        this.postsSubscription.next();
      });
  }

  ngOnInit(): void {
    this.route.parent!.params.subscribe(async (params) => {
      const username = params['username'];

      this.postService.getUserPosts(username).then((getUser) => {
        getUser.subscribe((getPosts) => {
          getPosts
            .pipe(takeUntil(this.postsSubscription))
            .subscribe((result) => {
              result.forEach((item) => {
                if (item.type == 'added')
                  this.posts.push(item.payload.doc.data() as Post);
              });
            });
        });
      });
    });
  }
}
