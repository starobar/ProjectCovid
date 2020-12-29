import { Component, OnInit} from '@angular/core';

import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, Color} from 'ng2-charts';
import { CountryData, CountryDayData, DayOneData, SummaryData } from '../country.model';
import { DatePipe } from '@angular/common'; 
import { FetchDataService } from '../fetch-data.service';
import {CountryService} from '../country.service';
import { Router } from '@angular/router';
import {ActivatedRoute} from "@angular/router";
import { AngularFirestore } from '@angular/fire/firestore'
import * as moment from 'moment';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css'],
  providers: [DatePipe]
})
export class CountryComponent implements OnInit {

// ##########BAR CHART#################################################################################
public barChartOptions: ChartOptions = {
  responsive: true,
};
public barChartLabels: Label[];
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

// public lineChartOptions: (ChartOptions & { annotation: any }) = {
// responsive: true,
// };

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

//##############DATA######################################################################################

countrySummaryData: SummaryData | undefined;
specCountry: CountryData | undefined;

country_active_cases: number | undefined;
country_recovery_rate: number | undefined;
country_mortality_rate: number | undefined;
currentDate: string;
lastUpdate: string;


countryDayOneDataConfirmed: DayOneData |undefined;
countryDayOneDataRecovered: DayOneData |undefined;
countryDayOneDataDeaths: DayOneData |undefined;

country: CountryDayData[];

countryTotalDeaths: Array<number> = [];
countryTotalConfirmed: Array<number> = [];
countryTotalRecovered: Array<number> = [];
countryTotalDate: Array<string> = [];

constructor(private serviceFetch: FetchDataService, private datePipe: DatePipe, public countryService: CountryService, public router:Router, private route: ActivatedRoute,
            private firestore: AngularFirestore) { 

  monkeyPatchChartJsTooltip(); // pie chart
  monkeyPatchChartJsLegend(); // pie chart
  this.specCountry = new CountryData;
}

ngOnInit() {
  let date = new Date(); //.getUTCDate
  this.currentDate = this.datePipe.transform(date,'yyyy-MM-dd');
  this.getAllCountryData(this.route.snapshot.params.slug);

}


  getAllCountryData(countryName: string) { //countryName = Slug
    
    this.firestore.collection("Countries").doc(countryName).get().subscribe((country)=>{

      if (country.exists){

        this.lastUpdate = country.get("Date").substring(0,10); //check the date

        if(this.lastUpdate==this.currentDate){ //get data from database
          console.log('getting summary country data from database')
            this.specCountry.Country = country.get("Country");
            this.specCountry.Date = country.get("Date"),
            this.specCountry.Slug = country.get("Slug"),
            this.specCountry.NewConfirmed = country.get("NewConfirmed"),
            this.specCountry.NewDeaths = country.get("NewDeaths"),
            this.specCountry.NewRecovered = country.get("NewRecovered"),
            this.specCountry.TotalConfirmed = country.get("TotalConfirmed"),
            this.specCountry.TotalDeaths = country.get("TotalDeaths"),
            this.specCountry.TotalRecovered = country.get("TotalRecovered")

            this.getCountryRates();
            this.pieChartData = [this.specCountry.TotalDeaths, this.specCountry.TotalRecovered, this.country_active_cases]
        }
        else{
          this.serviceFetch.getSummary().subscribe( //get data from API and update database
            response => {
              
              this.countrySummaryData = response;
              this.getCountrySummary(countryName); //countryName = Slug
              this.updateCountryData(this.specCountry);
              this.getCountryRates();
              this.pieChartData = [this.specCountry.TotalDeaths, this.specCountry.TotalRecovered, this.country_active_cases]
              console.log('updating summary country data in database');
            }
          )
        }
      }
      else{
        this.serviceFetch.getSummary().subscribe( //get data from API and add to database
          response => {
            
            this.countrySummaryData = response;
            this.getCountrySummary(countryName); //countryName = Slug
            this.updateCountryData(this.specCountry);
            this.getCountryRates();
            this.pieChartData = [this.specCountry.TotalDeaths, this.specCountry.TotalRecovered, this.country_active_cases]
            console.log('loading data from API, no doc in database for this country');
          }
        )
      }
      });
    

    this.serviceFetch.getCountry("https://api.covid19api.com/total/dayone/country/"+countryName).subscribe( //get total country data for specific country
      response => {
        this.country = response;
        console.log('getting country data for Bar and Line charts');
        var len =  this.country.length;

/////////////////////////////////////////BAR and LINE CHART DATA//////////////////////////////////////////////////////////////////////////////////////

        this.makeLists(this.country, this.countryTotalDeaths, this.countryTotalRecovered, this.countryTotalConfirmed, this.countryTotalDate);

        this.barChartData = [
          { data: [ this.countryTotalDeaths[len-8] - this.countryTotalDeaths[len-9],
                    this.countryTotalDeaths[len-7] - this.countryTotalDeaths[len-8],
                    this.countryTotalDeaths[len-6] - this.countryTotalDeaths[len-7],
                    this.countryTotalDeaths[len-5] - this.countryTotalDeaths[len-6],
                    this.countryTotalDeaths[len-4] - this.countryTotalDeaths[len-5],
                    this.countryTotalDeaths[len-3] - this.countryTotalDeaths[len-4],
                    this.countryTotalDeaths[len-2] - this.countryTotalDeaths[len-3],
                    this.countryTotalDeaths[len-1] - this.countryTotalDeaths[len-2],
                  ], label: 'Daily Deaths'},
          { data: [ this.countryTotalRecovered[len-8] - this.countryTotalRecovered[len-9],
                    this.countryTotalRecovered[len-7] - this.countryTotalRecovered[len-8],
                    this.countryTotalRecovered[len-6] - this.countryTotalRecovered[len-7],
                    this.countryTotalRecovered[len-5] - this.countryTotalRecovered[len-6],
                    this.countryTotalRecovered[len-4] - this.countryTotalRecovered[len-5],
                    this.countryTotalRecovered[len-3] - this.countryTotalRecovered[len-4],
                    this.countryTotalRecovered[len-2] - this.countryTotalRecovered[len-3],
                    this.countryTotalRecovered[len-1] - this.countryTotalRecovered[len-2],
                  ], label: 'Daily Recovered'},
          { data: [ this.countryTotalConfirmed[len-8] - this.countryTotalConfirmed[len-9],
                    this.countryTotalConfirmed[len-7] - this.countryTotalConfirmed[len-8],
                    this.countryTotalConfirmed[len-6] - this.countryTotalConfirmed[len-7],
                    this.countryTotalConfirmed[len-5] - this.countryTotalConfirmed[len-6],
                    this.countryTotalConfirmed[len-4] - this.countryTotalConfirmed[len-5],
                    this.countryTotalConfirmed[len-3] - this.countryTotalConfirmed[len-4],
                    this.countryTotalConfirmed[len-2] - this.countryTotalConfirmed[len-3],
                    this.countryTotalConfirmed[len-1] - this.countryTotalConfirmed[len-2],
                  ], label: 'Daily New Cases'},
        ];
    
        this.barChartLabels = this.countryTotalDate.slice(Math.max(this.countryTotalDate.length - 8, 1));

        this.lineChartData = [
          { data: this.countryTotalDeaths, label: 'Total Deaths' },
          { data: this.countryTotalRecovered, label: 'Total Recovered' },
          { data: this.countryTotalConfirmed, label: 'Total Cases' },
          ];
        
          this.lineChartLabels = this.countryTotalDate;

      }
    )

  }

  getCountryRates(){
    this.country_active_cases = this.specCountry.TotalConfirmed - this.specCountry.TotalRecovered;
    this.country_recovery_rate = Math.round((100*this.specCountry.TotalRecovered/this.specCountry.TotalConfirmed+ Number.EPSILON) * 100) / 100;
    this.country_mortality_rate = Math.round((100*this.specCountry.TotalDeaths/this.specCountry.TotalConfirmed + Number.EPSILON) * 100) / 100;
  }

  getCountrySummary(countrySlug: string){
    this.specCountry= this.countrySummaryData.Countries.find(x => x.Slug == countrySlug);
  }


  updateCountryData(newCountry: CountryData){
    this.firestore.collection("Countries").doc(newCountry.Slug).set({
      Country: newCountry.Country,
      Slug: newCountry.Slug,
      Date: newCountry.Date,
      NewConfirmed: newCountry.NewConfirmed,
      TotalConfirmed: newCountry.TotalConfirmed,
      NewDeaths: newCountry.NewDeaths,
      TotalDeaths: newCountry.TotalDeaths,
      NewRecovered: newCountry.NewRecovered,
      TotalRecovered: newCountry.TotalRecovered,
    }, { merge: true});
  }

  makeLists(arrayOfClasses: CountryDayData[], newListDeaths: any[], newListRecovered: any[], newListConfirmed: any[], newListDate: any[]){
    arrayOfClasses.forEach(function(value) {
    var storeDeaths = value.Deaths;
    var storeRecovered = value.Recovered;
    var storeConfirmed = value.Confirmed;
    var storeDate = value.Date;
    newListDeaths.push(storeDeaths);
    newListRecovered.push(storeRecovered);
    newListConfirmed.push(storeConfirmed);

    var date = new Date(storeDate.substring(0,10));  
    var formatted = moment(date).format('DD.MM.YYYY');
    newListDate.push(formatted);
    });
  }

}