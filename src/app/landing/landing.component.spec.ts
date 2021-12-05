import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LandingComponent} from './landing.component';
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientModule} from "@angular/common/http";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MainComponent} from "../main/main.component";
import {ProfileComponent} from "../profile/profile.component";
import {MatToolbarModule} from "@angular/material/toolbar";
import {LandingService} from "./landing.service";

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let service: LandingService;
  let loginValue: {
    accountNameLogin: any,
    passwordLogin: any,
  };

  let regValue={
    accountName: 'accountName',
    displayName: 'disp',
    emailAddress:'1@1.1',
    phoneNumber: '3464731516',
    birth: '1996-07-31',
    zipcode: '77098',
    password: '1234',
    passwordConfirmation:'1234',
  };


  var customMatchers = {
    tobeLogin: function (expected: any) {
      return {
        compare: function (actual: any, expected: any) {
          var result = {
            pass: false,
            message:"Login failed"
          };
          if(expected){
            result.pass = localStorage.getItem("currentUser") == loginValue.accountNameLogin && actual == expected;
          }
          if(!expected){
            result.pass= (actual==expected);
          }
          return result;
        }
      }
    },
  };


  beforeEach(async () => {

    await TestBed.configureTestingModule({
      declarations: [LandingComponent],
      providers:[LandingComponent,LandingService],
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
    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    service = TestBed.inject(LandingService);
    //set loginValue for test
    loginValue = {
      accountNameLogin: "Bret",
      passwordLogin: "Kulas Light",
    };

    // add login matcher
    jasmine.addMatchers(customMatchers);
  });


  //test constructor
  it('should create landing component', () => {
    expect(component).toBeTruthy();
  });

  // test valid login
  it('Test Auth: should log in a user (login state should be set)', (done) => {
    service.requestUsers().subscribe(
      e=>{
        expect(component.checkLogin(loginValue.accountNameLogin, loginValue.passwordLogin)).toBe(true);
        // @ts-ignore
        expect(component.onLoginSubmit(loginValue)).tobeLogin(true);

        //invalid pwd
        loginValue.passwordLogin = "nobody";
        expect(component.checkLogin(loginValue.accountNameLogin, loginValue.passwordLogin)).toBe(false);
        // @ts-ignore
        expect(component.onLoginSubmit(loginValue)).tobeLogin(false);

        //invalid username
        loginValue.accountNameLogin = "nobody";
        expect(component.checkLogin(loginValue.accountNameLogin, loginValue.passwordLogin)).toBe(false);
        // @ts-ignore
        expect(component.onLoginSubmit(loginValue)).tobeLogin(false);
        done();
      }
    )
  });

  //test invalid login
  it('  Test Auth: should not log in an invalid user (error state should be set)', (done) => {
    service.requestUsers().subscribe(
      e=>{
        //invalid pwd
        loginValue.passwordLogin = "nobody";
        expect(component.checkLogin(loginValue.accountNameLogin, loginValue.passwordLogin)).toBe(false);
        // @ts-ignore
        expect(component.onLoginSubmit(loginValue)).tobeLogin(false);

        //invalid username
        loginValue.accountNameLogin = "nobody";
        expect(component.checkLogin(loginValue.accountNameLogin, loginValue.passwordLogin)).toBe(false);
        // @ts-ignore
        expect(component.onLoginSubmit(loginValue)).tobeLogin(false);
        done();
      }
    )
  });



  //test register
  it('test register', () => {
      expect(component.onSubmit(regValue)).toBe(true);
      //invalid reg
      component.regForm.get("emailAddress")?.setValue("fake");
      component.regForm.get("phoneNumber")?.setValue("fake");
      component.regForm.get("accountName")?.setValue("12fake");
      component.regForm.get("birth")?.setValue("2021-12-31");
      component.regForm.get("password")?.setValue("1");
      fixture.detectChanges();
      expect(component.onSubmit(component.regForm.value)).toBe(false);

  });

  //test register
  it('test register', () => {
    expect(component.onSubmit(regValue)).toBe(true);
    //invalid reg
    component.regForm.get("accountName")?.setValue("newuser1123");
    component.regForm.get("emailAddress")?.setValue("1@1.1");
    component.regForm.get("phoneNumber")?.setValue("3464731516");
    component.regForm.get("birth")?.setValue("2000-12-31");
    component.regForm.get("password")?.setValue("1");
    component.regForm.get("zipcode")?.setValue("12345");
    component.regForm.get("passwordConfirmation")?.setValue("1");
    fixture.detectChanges();
    expect(component.onSubmit(component.regForm.value)).toBe(true);

  });

});
