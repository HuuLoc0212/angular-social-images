import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { Post } from 'src/app/types/post';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss'],
})
export class PostCardComponent implements OnInit {
  @Input() post!: Post;
  constructor(private router: Router) {}
  ngOnInit(): void {}

  logPost() {
    console.log(this.post);
  }

  goToPost(): void {
    this.router.navigateByUrl(`/post/${this.post.id}`);
  }

  heartIcon = faHeart;
}
