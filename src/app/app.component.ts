import {Component, OnInit, Output} from '@angular/core';
import {LandingService} from "./landing/landing.service";
import {CommonModule} from "@angular/common";
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent{
  title = 'myFront';
  relations:any[]=[];


  opened:boolean=true;
  currentUserName:string="";
  currentUserInfo:any={};

  userNameToAdd:string="userName";

  constructor(private landServ:LandingService, private router:Router) {

    //listen to the change of current User
    this.landServ.currentUserChangeEvent.subscribe(
      (username:string)=>{
        this.opened=true;
        this.currentUserName=username;
        if(this.currentUserName==null||this.currentUserName==""){
          this.currentUserInfo={};
          this.opened=true;
          return;
        }
        this.currentUserInfo=JSON.parse(this.landServ.getCurrentUserInfo());
        this.relations=this.landServ.getFollowingByName(this.currentUserName);
        this.router.navigateByUrl("main");
      }
    );

    this.currentUserName=this.landServ.getCurrentUserName();
    if(this.currentUserName==null||this.currentUserName==""){
      return;
    }
    if(this.landServ.getCurrentUserInfo()!=""){
      this.currentUserInfo=JSON.parse(this.landServ.getCurrentUserInfo());
    }

    //get the relations of currentUser
    if(this.currentUserName!=null&&this.currentUserName!=""){
      this.relations=this.landServ.getFollowingByName(this.currentUserName);
    }

  }

  changeSideBar():void{
    this.opened=!this.opened;
  }

  toLanding():void{
    this.router.navigateByUrl("");
  }

  toMain():void{
    this.router.navigateByUrl("main");
  }

  toProfile():void{
    this.router.navigateByUrl("profile");
  }

  async logOut(){
    await this.landServ.logOut();
    this.opened=false;
    this.landServ.currentUserChangeEvent.emit("");
    this.router.navigateByUrl("");
  }

  changeUserToShow(userName:string):void{
    this.landServ.userToShowChangeEvent.emit(userName);
  }

  async unfollow(userName:string){
    let res=await this.landServ.deleteRelations(this.landServ.getCurrentUserName(),userName);
    if(res==null){
      alert("Log in first");
      this.toLanding();
      return;
    }else{
      alert(res);
    }

    this.relations=this.landServ.getFollowingByName(this.currentUserName);
    this.landServ.relationChangeEvent.emit(this.landServ.getCurrentUserName());
  }

  async addFollowing(){
    let res=await this.landServ.addRelations(this.currentUserName,this.userNameToAdd);
    if(res==null){
      alert("Log in first");
      this.toLanding();
      return;
    }else{
      alert(res);
    }
    this.relations=this.landServ.getFollowingByName(this.currentUserName);
    this.landServ.relationChangeEvent.emit(this.landServ.getCurrentUserName());
  }

}
