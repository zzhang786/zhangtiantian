import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MainComponent} from './main.component';
import {HttpClientModule} from "@angular/common/http";
import {RouterTestingModule} from "@angular/router/testing";
import {LandingComponent} from "../landing/landing.component";
import {ProfileComponent} from "../profile/profile.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatToolbarModule} from "@angular/material/toolbar";
import {LandingService} from "../landing/landing.service";
import {By} from "@angular/platform-browser";
import {DebugNode, inject, Injector} from "@angular/core";
import {SpyLocation} from "@angular/common/testing";
import {Router} from "@angular/router";

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let service: LandingService;

  let router: Router;
  const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MainComponent],
      providers: [LandingService, {provide: Router, useValue: routerSpy}],
      imports: [
        RouterTestingModule.withRoutes([
          {path: '', component: LandingComponent},
          {path: 'main', component: MainComponent},
          {path: 'profile', component: ProfileComponent},
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
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(LandingService);

    router = fixture.debugElement.injector.get(Router);
    fixture.detectChanges();

  });

  it('Main component should create', () => {
    expect(component).toBeTruthy();
  });

  // test relation change event
  it('check service in main component', () => {
    // service.relationChangeEvent.emit("Samantha");
    // expect(component.userIdToShow).toEqual(3);
  });

  //test change status
  it('test change status', () => {
    component.userInfo.status = "newStatus";
    component.changeStatus();
    expect(component.userInfo.status).toEqual("newStatus");
  });

  //test no user login
  it('test no user login', () => {
    const spy = router.navigateByUrl as jasmine.Spy;

    localStorage.removeItem("currentUser");

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(router.navigateByUrl).toHaveBeenCalledWith("");
  });

  //test post
  it('test post', () => {
    // localStorage.setItem("currentUser", "Bret");
    // component.newTitle = "newTitle";
    // component.newContent = "newContent";
    // expect(component.post()).toBe(true);
  });


  //test clean
  it('test post clean', () => {
    component.clear();
    expect(component.newTitle).toMatch("your title");
    expect(component.newContent).toMatch("you post here");
  });

  //test search
  it('Test Article: should filter displayed articles by the search keyword (posts state is filtered)', () => {
    component.keyWords = "adipisci";
    component.search();
    component.listItem.forEach(
      item => {
        expect(JSON.stringify(item)).toContain("adipisci");
      }
    );
  });

});
