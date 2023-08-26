import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  faFacebook,
  faGithub,
  faInstagram,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  constructor(private utilService: UtilService) {}

  isVisible: boolean = false;
  ngOnInit(): void {
    this.utilService.isFooterVisible.subscribe((value) => {
      this.isVisible = value;
    });
  }

  handleClickOutside() {
    if (this.isVisible == true) {
      this.utilService.toggleVisibleFootter();
    }
  }

  faFacebook = faFacebook;
  faInstagram = faInstagram;
  faGithub = faGithub;
  faLinkedin = faLinkedin;
}
