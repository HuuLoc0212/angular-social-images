import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-created-card',
  templateUrl: './post-created-card.component.html',
  styleUrls: ['./post-created-card.component.scss'],
})
export class PostCreatedCardComponent implements OnInit {
  @Input() post: any;
  constructor(private router: Router) {}

  ngOnInit(): void {}

  goToPost(): void {
    this.router.navigateByUrl(`/post/${this.post.id}`);
  }
}
