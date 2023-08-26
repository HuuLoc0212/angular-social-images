import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  faAngleDown,
  faAngleUp,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-floating-buttons-group',
  templateUrl: './floating-buttons-group.component.html',
  styleUrls: ['./floating-buttons-group.component.scss'],
})
export class FloatingButtonsGroupComponent implements OnInit {
  constructor(private utilService: UtilService) {}

  isFooterVisible: boolean = false;

  ngOnInit(): void {
    this.utilService.isFooterVisible.subscribe((value) => {
      this.isFooterVisible = value;
    });
  }

  toggleFooter() {
    this.utilService.toggleVisibleFootter();
  }

  faFlus = faPlus;
  faUp = faAngleUp;
  faDown = faAngleDown;
}
