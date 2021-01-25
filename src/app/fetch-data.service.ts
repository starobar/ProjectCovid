import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import firebase from 'firebase/app'
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from './user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { News } from './news.model';

@Injectable({
  providedIn: 'root'
})
export class FetchDataService {

  private url_summary: string = "https://api.covid19api.com/summary";
  private user: User;

  constructor(private http: HttpClient, private afAuth: AngularFireAuth, private router: Router, private firestore : AngularFirestore, private route: ActivatedRoute) { }

  getSummary():Observable<any>{
    return this.http.get(this.url_summary)
    .pipe((response) => response);
      }

  getCountry(url_dayOne: string):Observable<any>{
    return this.http.get(url_dayOne)
    .pipe((response) => response);
  }

  getWorld(url_dayOne: string):Observable<any>{
    return this.http.get(url_dayOne)
    .pipe((response) => response);
  }

  async signInWithGoogle(){
    
    const credentials = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    this.user = {
      uid: credentials.user.uid,
      displayName: credentials.user.displayName,
      email: credentials.user.email,
      admin: false
    };
    localStorage.setItem("user", JSON.stringify(this.user));
    window.location.href = window.location.href;
    
  }

  userSignedIn(): boolean{
    return JSON.parse(localStorage.getItem("user")) != null;
  }

  signOut(){
    this.afAuth.signOut();
    localStorage.removeItem("user");
    this.user = null;
    window.location.href = window.location.href;
  }

  addNews(news: News){

    if (news.section==undefined){
      news.section = "Worldwide";
      news.countryName = "Worldwide"; 
    }

    this.firestore.collection("Countries").doc(news.section).get().subscribe((country)=>{

      if (country.exists){
        this.firestore.collection("Countries").doc(news.section).collection("News").add(news);
      }
      else{
        this.firestore.collection("Countries").doc(news.section).set({
          Date: '1993-01-01', //old date to make it update the doc next time
        }, { merge: true});
        this.firestore.collection("Countries").doc(news.section).collection("News").add(news);
      }
    });

    this.firestore.collection("GlobalNews").add(news);

  }

  getGlobalNews(){
    return this.firestore.collection("GlobalNews", ref => ref.orderBy('date', 'desc')).valueChanges();
  }


}