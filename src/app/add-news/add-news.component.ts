import { Component, OnInit } from '@angular/core';
import { FetchDataService } from '../fetch-data.service';
import { News } from '../news.model';
import { User } from '../user.model';

@Component({
  selector: 'app-add-news',
  templateUrl: './add-news.component.html',
  styleUrls: ['./add-news.component.css']
})
export class AddNewsComponent implements OnInit {

  section: string;
  username: string;
  description: string;
  date: any;

  constructor(private serviceFetch: FetchDataService) { }

  ngOnInit(): void {
  }

  addNews(){
    let news: News = {
      section: this.section,
      username: this.username,
      description: this.description,
      date: new Date(this.date)
    };
    this.serviceFetch.addNews(news);
    this.section = undefined;
    this.username = undefined;
    this.description = undefined;
    this.date = undefined;
  }



}
