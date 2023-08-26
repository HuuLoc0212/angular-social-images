import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FollowService } from 'src/app/services/follow.service';
import { User } from 'src/app/types/user';

@Component({
  selector: 'app-followers-popup',
  templateUrl: './followers-popup.component.html',
  styleUrls: ['./followers-popup.component.scss'],
})
export class FollowersPopupComponent implements OnInit {
  @Output() onClose: EventEmitter<void> = new EventEmitter();
  @Input() userId!: string;
  followers: User[] = [];

  isLoading: boolean = true;

  constructor(private followService: FollowService) {}

  ngOnInit(): void {
    this.getFollowers();
  }

  async getFollowers() {
    this.followers = await this.followService.getFollowers(this.userId);
    this.isLoading = false;
  }

  handleClose() {
    this.onClose.emit();
  }

  faClose = faXmark;
}
