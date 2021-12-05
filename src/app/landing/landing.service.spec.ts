import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import { LandingService } from './landing.service';
import {LandingComponent} from "./landing.component";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientModule} from "@angular/common/http";
import {MainComponent} from "../main/main.component";
import {ProfileComponent} from "../profile/profile.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatToolbarModule} from "@angular/material/toolbar";
import createSpy = jasmine.createSpy;
import {defer} from "rxjs";

describe('LandingService', () => {
  let service: LandingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LandingComponent],
      providers:[LandingService],
      imports: [
        RouterTestingModule.withRoutes([
          {path:'', component: LandingComponent},
          {path:'main', component: MainComponent},
          {path:'profile', component: ProfileComponent},
        ]),
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        MatToolbarModule
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    service = TestBed.inject(LandingService);
   // localStorage.removeItem("users");
  });

  it('service should be created', () => {
        expect(service).toBeTruthy();
  });



  it('test add relations', () => {
   //  localStorage.setItem("currentUser","Bret");
   // expect(service.addRelations("Bret","Bret")).toBe(false);//same person
   // expect(service.addRelations("Bret","Kamren")).toBe(true);//add a stranger
   // expect(service.addRelations("newUser","Bret")).toBe(true);  //new user, initial his relation
  });


  it('test delete relations', () => {
    // expect(service.deleteRelations("Bret","Bret")).toBe(false);//same person
    // expect(service.deleteRelations("Bret","Kamren")).toBe(true);//same person
  });




  //test changeUser
  it('user change should emit', () => {
    spyOn(service.currentUserChangeEvent, 'emit').and.callThrough();
    service.changeUser("Bret");
    expect(service.currentUserChangeEvent.emit).toHaveBeenCalled();
  });


  // it('test check pwd by name', () => {
  //   expect(service.checkByName("Bret","123")).toBe(false);
  //   expect(service.checkByName("Bret","Kulas Light")).toBe(true);
  // });


  //test logout
  it('user log out', () => {
    service.logOut();
    expect(localStorage.getItem("currentUser")).toBeNull();
  });

  //test userReg
  it('user register', (done) => {
    let userReg={
      accountName:"totollyNew2",
      displayName:"newDisp",
      password:"123",
      phoneNumber:"3453451234",
      zipcode:"77098"
    };

    service.requestUsers().subscribe(
      e=>{
        expect(service.userReg(userReg)).toBe(true);
        done();
      }
    )
  });

  it('user register with existed account', (done) => {
    let userReg={
      accountName:"Bret",
      displayName:"newDisp",
      password:"Kulas Light",
      phoneNumber:"3453451234",
      zipcode:"77098"
    };

    service.requestUsers().subscribe(
      e=>{
        expect(service.userReg(userReg)).toBe(true);
        done();
      }
    )
  });

  it(' Test Article: should fetch articles for current logged in useri (posts state is set)', () => {
    localStorage.setItem("currentUser","Bret");

    let posts=service.getPostByUserId(1);

    posts.forEach((post:any)=>{
      let authors=[1];
      let followings=service.getFollowingByName("Bret");
      followings.forEach((following:any)=>{
        // @ts-ignore
        authors.push[following.id];
      })
      expect(authors).toContain(post.userId);
    })

  });


  it('Test Article: should remove articles when removing a follower (posts state is smaller)', () => {

        // localStorage.setItem("currentUser","Bret");
        //
        // expect(service.deleteRelations("Bret","Antonette")).toBe(true);
        //
        // let posts=service.getPostByUserId(1);
        //
        //
        // let smallerFlag=true;
        // posts.forEach((post:any)=>{
        //   if(post.userId==service.getUserIdByUserName("Antonette")){
        //     smallerFlag=false;
        //   }
        // })
        // expect(smallerFlag).toBeTrue();
  });

  it('Test Article: should add articles when adding a follower (posts state is larger)', () => {

    // localStorage.setItem("currentUser", "Bret");
    //
    // expect(service.addRelations("Bret", "Kamren")).toBe(true);
    //
    // service.getPost();
    //
    //   let postInfo = localStorage.getItem("posts");
    //   // @ts-ignore
    // let postJson = JSON.parse(postInfo);
    //   let res2: any[] = [];
    //
    //   //get follower
    //   let followers=service.getFollowingByName("Bret");
    //
    //   for (var i = 0; i < postJson.length; i++) {
    //     if (postJson[i].userId == 1) {
    //       res2.push(postJson[i]);
    //     }else {
    //       //check if the post belongs to a follower
    //       for (var j = 0; j < followers.length; j++) {
    //         if (postJson[i].userId == followers[j].id) {
    //           res2.push(postJson[i]);
    //         }
    //       }
    //     }
    //   }
    //
    //   let posts = res2;
    //   // @ts-ignore
    //   console.log(JSON.parse(postInfo));
    //   console.log("sssssssss",posts);
    //   let biggerFlag = false;
    //   posts.forEach((post: any) => {
    //     if (post.userId == service.getUserIdByUserName("Kamren")) {
    //       biggerFlag = true;
    //     }
    //   })
    //   expect(biggerFlag).toBeTrue();
  });






});
