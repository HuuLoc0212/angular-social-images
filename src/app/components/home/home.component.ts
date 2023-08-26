import { Component, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';
import { PaginationService } from 'src/app/services/pagination.service';
import { Post } from 'src/app/types/post';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  subscription!: Subscription;
  constructor(public page: PaginationService) {}

  // posts: Post[] = [];

  ngOnInit(): void {
    this.getPosts();
  }

  getPosts() {
    this.page.init('posts', 'createdAt', { reverse: true, prepend: false });
  }

  scrollHandler(e: any) {
    if (e === 'bottom') {
      this.page.more();
    }
  }

  ngOnDestroy() {
    this.page.reset();
  }
}
