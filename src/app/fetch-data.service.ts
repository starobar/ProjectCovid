import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import firebase from 'firebase/app'
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from './user.model';
import { Router } from '@angular/router';
import { News } from './news.model';

@Injectable({
  providedIn: 'root'
})
export class FetchDataService {

  private url_summary: string = "https://api.covid19api.com/summary";
  private user: User;
  private news: News;

  constructor(private http: HttpClient, private afAuth: AngularFireAuth, private router: Router, private firestore : AngularFirestore) { }

  getSummary():Observable<any>{
    return this.http.get(this.url_summary)
    .pipe((response) => response);
      }

  getCountry(url_dayOne: string):Observable<any>{
    return this.http.get(url_dayOne)
    .pipe((response) => response);
  }

  getWorld(url_dayOne: string):Observable<any>{
    console.log("Using url ", url_dayOne)
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
    this.updateUserData();
    this.router.navigate(["worldwide"]);
    console.log(credentials.user.displayName, 'is signed in!');
  }

  private updateUserData(){
    this.firestore.collection("Users").doc(this.user.uid).set({
      uid: this.user.uid,
      displayName: this.user.displayName,
      email: this.user.email,
      admin: this.user.admin
    }, { merge: true});
  }

  getUser(){
  if(this.user == null && this.userSignedIn()){
    this.user = JSON.parse(localStorage.getItem("user"));
  }
  return this.user;
  }

  userSignedIn(): boolean{
    return JSON.parse(localStorage.getItem("user")) != null;
  }

  signOut(){
    this.afAuth.signOut();
    localStorage.removeItem("user");
    this.user = null;
    this.router.navigate(["worldwide"]);
  }

  // getNews(){
  //   return this.firestore.collection("users")
  //   .doc(this.user.uid).collection("expenses", ref => ref.orderBy('date', 'asc')).valueChanges();
  // }

  addNews(news: News){

    this.firestore.collection("News").add(news);

    // this.firestore.collection("News").doc(newCountry.Slug).set({
    //   Country: newCountry.Country,
    //   Slug: newCountry.Slug,
    //   Date: newCountry.Date,
    //   NewConfirmed: newCountry.NewConfirmed,
    //   TotalConfirmed: newCountry.TotalConfirmed,
    //   NewDeaths: newCountry.NewDeaths,
    //   TotalDeaths: newCountry.TotalDeaths,
    //   NewRecovered: newCountry.NewRecovered,
    //   TotalRecovered: newCountry.TotalRecovered,
    // }, { merge: true});

    // this.firestore.collection("Users").doc(this.user.uid)
    // .collection("total").doc("expenses")
    // .get().subscribe((doc)=>{
    //   let amount: number;
    //   if(doc.exists){
    //     amount = doc.data()["amount"] + expense.amount;
    //   }else{
    //     amount = expense.amount;
    //   }
    //   this.firestore.collection("users").doc(this.user.uid)
    // .collection("total").doc("expenses").set({
    //   amount: amount, lastUpdated: new Date()
    // }, { merge: true});
    // });


  }


}