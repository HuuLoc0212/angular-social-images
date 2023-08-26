import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-keyword-card',
  templateUrl: './keyword-card.component.html',
  styleUrls: ['./keyword-card.component.scss'],
})
export class KeywordCardComponent implements OnInit {
  @Input() keyword: any;
  constructor() {}

  ngOnInit(): void {}
}
