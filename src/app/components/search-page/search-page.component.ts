import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { PostService } from 'src/app/services/post.service';
import { SearchService } from 'src/app/services/search.service';
import { Post } from 'src/app/types/post';
import { User } from 'src/app/types/user';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss'],
})
export class SearchPageComponent implements OnInit {
  postSubcription = new Subject<void>();
  keyword: string = '';

  currentUser!: User;

  posts: Post[] = [];

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private searchService: SearchService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.posts = [];
      if (params['kq']) {
        const queryString = params['kq'].toLowerCase(); // { keyword: "nature" }
        this.keyword = params['kq'];

        this.postService
          .getPostsByKeyword(queryString)
          .pipe(takeUntil(this.postSubcription))
          .subscribe((val) => {
            val.forEach(async (item) => {
              let post: Post = item.payload.doc.data() as Post;
              const populatedPost = await this.postService.populatePost(post);

              this.posts.push(populatedPost);
            });
          });

        this.authService.userObserver.subscribe((user: User) => {
          if (user) {
            this.searchService.addRecentSearchKeyword(queryString, user.uid);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.postSubcription.next();
  }
}
