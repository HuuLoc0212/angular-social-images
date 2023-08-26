import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-keywords',
  templateUrl: './keywords.component.html',
  styleUrls: ['./keywords.component.scss'],
})
export class KeywordsComponent implements OnInit {
  @Input() title!: string;
  @Input() keywords: any = [];

  @Output() onKeywordClick: EventEmitter<void> = new EventEmitter();
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.shuffleArray(this.keywords);
    this.keywords = this.keywords.slice(0, 8);
  }

  searchKeyword(keyword: any) {
    const queryString = keyword.title.toLowerCase();
    this.router.navigateByUrl(`/search?kq=${queryString}`);

    this.onKeywordClick.emit();
  }

  shuffleArray(array: any) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
