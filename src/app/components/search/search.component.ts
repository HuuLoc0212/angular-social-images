import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  @Output() onKeywordClick: EventEmitter<void> = new EventEmitter();
  keywords: any = [];
  recentSearch: string[] = [];

  isFetch: boolean = false;

  constructor(private searchService: SearchService, private router: Router) {}

  ngOnInit(): void {
    this.searchService
      .getRecentSearchKeywords()
      .pipe(first())
      .subscribe((result) => {
        if (result.length > 0) {
          const searchData: any = result[0].payload.doc.data();
          const listSearch: string[] = [];
          searchData.keywords.forEach((keyword: string) => {
            // not show long search string
            if (keyword.length < 20) {
              listSearch.push(keyword);
            }
          });

          // max recent search
          const maxRecentSearch = 5;
          this.recentSearch = listSearch.slice(0, maxRecentSearch);
        }
      });

    this.searchService.getKeywords().subscribe((result) => {
      result.forEach((item) => {
        this.keywords.push(item.data());
      });

      this.isFetch = true;
    });
  }

  searchWithKeyword(keyword: string) {
    this.router.navigateByUrl(`/search?kq=${keyword}`);
    this.onKeywordClick.emit();
  }

  closeSearchModal() {
    this.onKeywordClick.emit();
  }
}
