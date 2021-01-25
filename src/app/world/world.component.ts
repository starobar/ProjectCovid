import { Component, OnInit} from '@angular/core';

import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, Color} from 'ng2-charts';
import { CountryData, SummaryData, WorldDayData } from '../country.model';
import { DatePipe } from '@angular/common'; 
import { FetchDataService } from '../fetch-data.service';
import {CountryService} from '../country.service';
import { Router } from '@angular/router';
import { User } from '../user.model';
import { News } from '../news.model';
import { AngularFirestore } from '@angular/fire/firestore';


@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.css'],
  providers: [DatePipe] 
})
export class WorldComponent implements OnInit {

  // ##########BAR CHART#################################################################################
  public barChartOptions: ChartOptions = {
    responsive: true,
  };
  public barChartLabels: any[];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins: any = [];
  public barChartColors: Color[] = [
    {
      backgroundColor: 'rgb(240, 228, 253)',
    },
    {
      backgroundColor: 'rgb(212, 197, 231)',
    },
    {
      backgroundColor: 'rgba(143, 112, 194, 0.747)',
    }
  ];

  public barChartData: ChartDataSets[];

  // #########PIE CHART##############################################################################################

  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label[] = ['Dead cases', 'Recovered cases', 'Active cases'];
  public pieChartData: SingleDataSet | undefined;
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins: any = [];
  public pieChartColors = [
    {
      backgroundColor: ['rgb(240, 228, 253)', 'rgb(212, 197, 231)', 'rgba(143, 112, 194, 0.747)'],
    },
  ];
  

// #########LINE CHART######################################################################################################

public lineChartData: ChartDataSets[];
public lineChartLabels: Label[];
public lineChartColors: Color[] = [
  {
    backgroundColor: 'rgb(240, 228, 253)',
    borderColor: 'rgb(240, 228, 253)',
    pointBackgroundColor: 'rgba(148,159,177,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  },
  {
    backgroundColor: 'rgb(212, 197, 231)',
    borderColor: 'rgb(212, 197, 231)',
    pointBackgroundColor: 'rgba(77,83,96,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(77,83,96,1)'
  },
  {
    backgroundColor: 'rgba(143, 112, 194, 0.747)',
    borderColor: 'rgba(143, 112, 194, 0.747)',
    pointBackgroundColor: 'rgba(148,159,177,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  }
];

public lineChartLegend = true;
public lineChartType: ChartType = 'line';
public lineChartPlugins: any = [];

// ####################################################################################################################

  summaryData: SummaryData | undefined;
  active_cases: number | undefined;
  recovery_rate: number | undefined;
  mortality_rate: number | undefined;
  currentDate: string;
  world: WorldDayData[];
  countries: Array<CountryData> = [];

  worldTotalDeaths: Array<number> = [];
  worldTotalRecovered: Array<number> = [];
  worldTotalConfirmed: Array<number> = [];
  worldDailyDeaths: Array<number> = [];
  worldDailyRecovered: Array<number> = [];
  worldDailyConfirmed: Array<number> = [];

  section: string;
  countryName: string;
  username: string;
  description: string;
  date: any;

  user: User;
  selectedCountry: CountryData;
  userInfo: User;

  news: News[];


  constructor(public serviceFetch: FetchDataService, private datePipe: DatePipe, public countryService: CountryService, public router:Router, private firestore : AngularFirestore) { 

    monkeyPatchChartJsTooltip(); // pie chart
    monkeyPatchChartJsLegend(); // pie chart

  }


  async ngOnInit() {

    this.getAllData();

    if(this.user == null && this.serviceFetch.userSignedIn()){
      this.user = JSON.parse(localStorage.getItem("user"));
      this.firestore.collection("Users").doc(this.user.uid).get().subscribe((user)=>{
            if(user.exists){
              this.user.admin = user.get("admin");
          }  
          });
    }

    this.serviceFetch.getGlobalNews()
    .subscribe((news)=>{
      this.news = news as News[];
    });
    
  }

  getAllData() {

    let date = new Date();
    this.currentDate = date.toISOString().substring(0,19)+'Z';
    let startDate = new Date("2020-04-13");
    var dates: any[] = [];

    while( startDate <  date){
      dates.push(this.datePipe.transform(new Date(startDate),'dd.MM.yyyy'));
      startDate.setDate(startDate.getDate() + 1);
    }

    this.serviceFetch.getSummary().subscribe(
      response => {
        this.summaryData = response;
        this.getRates();
        this.pieChartData = [this.summaryData?.Global?.TotalDeaths, this.summaryData?.Global?.TotalRecovered, this.active_cases]
        this.countries = this.summaryData.Countries;
      }
    )

    this.serviceFetch.getWorld("https://api.covid19api.com/world?from=2020-04-13T00:00:00Z&to="+this.currentDate).subscribe( //get total country data for specific country
      response => {
        this.world = response;
        
        this.makeWorldLists(this.world, this.worldTotalDeaths, this.worldTotalRecovered, this.worldTotalConfirmed);

        var len =  this.worldTotalDeaths.length;

        this.worldTotalDeaths = this.worldTotalDeaths.sort((a, b) => a - b),
        this.worldTotalRecovered = this.worldTotalRecovered.sort((a, b) => a - b),
        this.worldTotalConfirmed = this.worldTotalConfirmed.sort((a, b) => a - b),

        this.barChartData = [
          { data: [ this.worldTotalDeaths[len-8] - this.worldTotalDeaths[len-9],
                    this.worldTotalDeaths[len-7] - this.worldTotalDeaths[len-8],
                    this.worldTotalDeaths[len-6] - this.worldTotalDeaths[len-7],
                    this.worldTotalDeaths[len-5] - this.worldTotalDeaths[len-6],
                    this.worldTotalDeaths[len-4] - this.worldTotalDeaths[len-5],
                    this.worldTotalDeaths[len-3] - this.worldTotalDeaths[len-4],
                    this.worldTotalDeaths[len-2] - this.worldTotalDeaths[len-3],
                    this.worldTotalDeaths[len-1] - this.worldTotalDeaths[len-2],
                  ], label: 'Daily Deaths'},
          { data: [ this.worldTotalRecovered[len-8] - this.worldTotalRecovered[len-9],
                    this.worldTotalRecovered[len-7] - this.worldTotalRecovered[len-8],
                    this.worldTotalRecovered[len-6] - this.worldTotalRecovered[len-7],
                    this.worldTotalRecovered[len-5] - this.worldTotalRecovered[len-6],
                    this.worldTotalRecovered[len-4] - this.worldTotalRecovered[len-5],
                    this.worldTotalRecovered[len-3] - this.worldTotalRecovered[len-4],
                    this.worldTotalRecovered[len-2] - this.worldTotalRecovered[len-3],
                    this.worldTotalRecovered[len-1] - this.worldTotalRecovered[len-2],
                  ], label: 'Daily Recovered'},
          { data: [ this.worldTotalConfirmed[len-8] - this.worldTotalConfirmed[len-9],
                    this.worldTotalConfirmed[len-7] - this.worldTotalConfirmed[len-8],
                    this.worldTotalConfirmed[len-6] - this.worldTotalConfirmed[len-7],
                    this.worldTotalConfirmed[len-5] - this.worldTotalConfirmed[len-6],
                    this.worldTotalConfirmed[len-4] - this.worldTotalConfirmed[len-5],
                    this.worldTotalConfirmed[len-3] - this.worldTotalConfirmed[len-4],
                    this.worldTotalConfirmed[len-2] - this.worldTotalConfirmed[len-3],
                    this.worldTotalConfirmed[len-1] - this.worldTotalConfirmed[len-2],
                  ], label: 'Daily New Cases'},
        ];

        this.barChartLabels = dates.slice(Math.max(dates.length - 8, 1));

        this.lineChartData = [
          { data: this.worldTotalDeaths, label: 'Total Deaths' },
          { data: this.worldTotalRecovered, label: 'Total Recovered' },
          { data: this.worldTotalConfirmed, label: 'Total Cases' },
          ];

        this.lineChartLabels = dates;

      }
    )
      

  }

  getRates(){
    this.active_cases = this.summaryData?.Global?.TotalConfirmed - this.summaryData?.Global?.TotalRecovered;
    this.recovery_rate = Math.round((100*this.summaryData?.Global?.TotalRecovered/this.summaryData?.Global?.TotalConfirmed+ Number.EPSILON) * 100) / 100;
    this.mortality_rate = Math.round((100*this.summaryData?.Global?.TotalDeaths/this.summaryData?.Global?.TotalConfirmed + Number.EPSILON) * 100) / 100;
  }

  makeWorldLists(DailyWorldData: WorldDayData[], TotalDeaths: any[], TotalRecovered: any[], TotalConfirmed: any[]){
    DailyWorldData.forEach(function(value) {
    var storeTotalDeaths = value.TotalDeaths;
    var storeTotalRecovered = value.TotalRecovered;
    var storeTotalConfirmed = value.TotalConfirmed;
    TotalDeaths.push(storeTotalDeaths);
    TotalRecovered.push(storeTotalRecovered);
    TotalConfirmed.push(storeTotalConfirmed);
    });
  }

  addNews(){
    let news: News = {
      section: this.selectedCountry.Slug,
      countryName: this.selectedCountry.Country,
      username: this.user.displayName,
      description: this.description,
      date: new Date()
    };
    this.serviceFetch.addNews(news);
    this.section = undefined;
    this.countryName = undefined;
    this.username = undefined;
    this.description = undefined;
    this.date = undefined;
  }

}
