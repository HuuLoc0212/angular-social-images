import { Component, Input, OnInit } from '@angular/core';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { CommentType } from 'src/app/types/comment';

@Component({
  selector: 'app-post-comment-item',
  templateUrl: './post-comment-item.component.html',
  styleUrls: ['./post-comment-item.component.scss'],
})
export class PostCommentItemComponent implements OnInit {
  @Input() comment!: CommentType;
  constructor() {}

  ngOnInit(): void {}

  heartIcon = faHeart;
}
