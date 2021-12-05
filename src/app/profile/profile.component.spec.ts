import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileComponent } from './profile.component';
import {RouterTestingModule} from "@angular/router/testing";
import {LandingComponent} from "../landing/landing.component";
import {MainComponent} from "../main/main.component";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatToolbarModule} from "@angular/material/toolbar";

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileComponent ],
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
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('Test Profile: should fetch the user\'s profile username', () => {
    localStorage.setItem("currentUser","Bret");
    expect(component).toBeTruthy();
    expect(component.accountName).toEqual("Bret");
  });


  //test save
  it('should save', () => {

    component.regForm.get("emailAddress")?.setValue("sc159@rice.edu");
    component.regForm.get("phoneNumber")?.setValue("1234561234");
    component.regForm.get("zipcode")?.setValue("77098");
    component.regForm.get("password")?.setValue("Kulas Light");
    component.regForm.get("passwordConfirmation")?.setValue("Kulas Light");

    fixture.detectChanges();
    expect(component.onSave(component.regForm.value)).toBe(true);
  });

  it('should not save', () => {

    component.regForm.get("emailAddress")?.setValue("fake");
    component.regForm.get("phoneNumber")?.setValue("fake");
    component.regForm.get("zipcode")?.setValue("fake");
    component.regForm.get("password")?.setValue("Kulas Light");
    component.regForm.get("passwordConfirmation")?.setValue("Kulas Light");

    fixture.detectChanges();
    expect(component.onSave(component.regForm.value)).toBe(false);
  });

  //check login
  it('should return to landing page', () => {

   localStorage.removeItem("currentUser");
   expect(component.checkCurrentUser()).toBe(false);
  });

});
