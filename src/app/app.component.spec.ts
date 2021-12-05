import {ComponentFixture, TestBed} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import {HttpClientModule} from "@angular/common/http";
import {LandingComponent} from "./landing/landing.component";
import {MainComponent} from "./main/main.component";
import {ProfileComponent} from "./profile/profile.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatIconModule} from "@angular/material/icon";
import {MatDividerModule} from "@angular/material/divider";
import {MatCardModule} from "@angular/material/card";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {Router} from "@angular/router";
import {LandingService} from "./landing/landing.service";

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let service: LandingService;

  let router:Router;
  const routerSpy=jasmine.createSpyObj('Router',['navigateByUrl']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppComponent ],
      providers:[LandingService,{provide:Router,useValue:routerSpy}],
      imports: [
        RouterTestingModule.withRoutes([
          {path:'', component: LandingComponent},
          {path:'main', component: MainComponent},
          {path:'profile', component: ProfileComponent},
        ]),
        HttpClientModule,
        MatSidenavModule,
        MatCheckboxModule,
        MatToolbarModule,
        MatIconModule,
        MatDividerModule,
        MatCardModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,

      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(LandingService);

    router=fixture.debugElement.injector.get(Router);
    fixture.detectChanges();

  });


  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  //test already logged in
  it('should create the app', () => {
    localStorage.setItem("currentUser","Bret");
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  //test listen to the change of current User
  it('test listen to the change of current User', () => {
    const spy=router.navigateByUrl as jasmine.Spy;

    localStorage.setItem("currentUser","Bret");
    service.changeUser("Bret");
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();

    expect(router.navigateByUrl).toHaveBeenCalledWith("main");
  });





  //test toLanding
  it('test toLanding', () => {
    const spy=router.navigateByUrl as jasmine.Spy;

    component.toLanding();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(router.navigateByUrl).toHaveBeenCalledWith("");
  });

  //test toMain
  it('test toMain', () => {
    const spy=router.navigateByUrl as jasmine.Spy;

    component.toMain();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(router.navigateByUrl).toHaveBeenCalledWith("main");
  });

  //test toProfile
  it('test toProfile', () => {
    const spy=router.navigateByUrl as jasmine.Spy;

    component.toProfile();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(router.navigateByUrl).toHaveBeenCalledWith("profile");
  });

  //test logout
  it('Test Auth: should log out a user (login state should be cleared)', () => {
    const spy=router.navigateByUrl as jasmine.Spy;

    component.logOut();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(router.navigateByUrl).toHaveBeenCalledWith("");
    expect(localStorage.getItem("currentUser")).toBeNull();
  });


  //test changeUserToShow
  it('test changeUserToShow', () => {
    spyOn(service.userToShowChangeEvent, 'emit').and.callThrough();
    component.changeUserToShow("Bret");
    expect(service.userToShowChangeEvent.emit).toHaveBeenCalledWith("Bret");
  });

  //test unfollow
  it('test unfollow', () => {
    spyOn(service.relationChangeEvent, 'emit').and.callThrough();
    component.unfollow("Bret");
    expect(service.relationChangeEvent.emit).toHaveBeenCalled();
  });

  //test addFollowing
  it('test addFollowing', () => {
    spyOn(service.relationChangeEvent, 'emit').and.callThrough();
    component.currentUserName="Bret";
    component.userNameToAdd="Antonette";
    component.addFollowing();
    expect(service.relationChangeEvent.emit).toHaveBeenCalled();
  });

  //test change sideBar
  it('test change sideBar', () => {
    if(component.opened==false){
      component.changeSideBar();
      expect(component.opened).toBeTrue();
    }else{
      component.changeSideBar();
      expect(component.opened).toBeFalse();
    }
  });

  // it(`should have as title 'myFront'`, () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   const app = fixture.componentInstance;
  //   expect(app.title).toEqual('myFront');
  // });

  // it('should render title', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   const compiled = fixture.nativeElement as HTMLElement;
  //   expect(compiled.querySelector('.content span')?.textContent).toContain('myFront!');
  // });
});
