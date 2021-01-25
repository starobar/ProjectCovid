import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CountryData } from './country.model';
import { AngularFirestore } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class CountryService {

  constructor(private router: Router, private firestore : AngularFirestore) { }

  goToCountry(country: CountryData["Slug"]){
    this.router.navigate([country])
  }

  getCountryNews(country: CountryData["Slug"]){
    return this.firestore.collection("Countries")
    .doc(country).collection("News", ref => ref.orderBy('date', 'desc')).valueChanges();
  }

}