import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {LandingService} from "../landing/landing.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  imgSrc: string = "";
  accountName: string | null = "1";
  displayName: string | null = "2";
  emailAddress: string | null = "3";
  phoneNumber: string | null = "4";
  zipcode: string | null = "6";
  password: string | null = "7";
  passwordConfirmation: string | null = "8";

  uploadedFiles: Array<File>=[];

  regForm: FormGroup;

  constructor(private router: Router,private landServ:LandingService) {
    let fb = new FormBuilder();
    this.regForm = fb.group({
      displayName: ['', {
        validators: [],
        updateOn: 'change'
      }],

      emailAddress: ['', {
        validators: [this.validEmail],
        updateOn: 'change'
      }],

      phoneNumber: ['', {
        validators: [this.validNumber],
        updateOn: 'change'
      }],


      zipcode: ['', {
        validators: [Validators.maxLength(5),Validators.minLength(5)],
        updateOn: 'change'
      }],

      password: ['', {
        validators: [],
        updateOn: 'change'
      }],

      passwordConfirmation: ['', {
        validators: [],
        updateOn: 'change'
      }],
    }
    ,
      {
        validators:[this.samePwd]
      }
    );

    //check cookie
    (async()=>{
      let res=await this.landServ.getHeadlineByUsername();
      if(res=="failed"){
        this.landServ.logOutWithoutCookie();
        await this.router.navigateByUrl("");
        return;
      }
    })();

    this.checkCurrentUser();

  }

  ngOnInit(): void {
  }

  samePwd(controlGroup: FormGroup): any {

    // @ts-ignore
    let pw2 = controlGroup.get('password').value;
    // @ts-ignore
    let pw1=controlGroup.get('passwordConfirmation').value;

    if (pw2==pw1) {
      return null;
    } else {
      return {samePwd: {info: 'Password do NOT match!'}};
    }
  }

  validNumber(control: FormControl):any{
    let value=control.value;

    let reg=/([0-9]{3}[0-9]{3}[0-9]{4})+/;
    if(!reg.test(value)){
      return {validNumber:{info:'please input a valid number'}};
    }else{
      return null;
    }
  }

  validEmail(control: FormControl):any{
    let value=control.value;
    if(value==null||value==""){
      return null;
    }
    let reg=/([a-zA-Z0-9])+@([a-zA-Z0-9])+\.([a-zA-Z0-9])+/;
    if(!reg.test(value)){
      return {validEmail:{info:'please input a valid email'}};
    }else{
      return null;
    }
  }

  async onSave(value: any){
    if(!this.regForm.valid){
      this.router.navigateByUrl("profile");
      return false;
    }

    let updatedValue={
      displayname: "",
      email: "",
      phone: "",
      zipcode: "",
      password:"",
      avatar:""
    };
    if(value.displayName!=null&&value.displayName!=""){
      updatedValue.displayname=value.displayName;
    }
    if(value.emailAddress!=null&&value.emailAddress!=""){
      updatedValue.email=value.emailAddress;
    }
    if(value.phoneNumber!=null&&value.phoneNumber!=""){
      updatedValue.phone=value.phoneNumber;
    }
    if(value.zipcode!=null&&value.zipcode!=""){
      updatedValue.zipcode=value.zipcode;
    }
    if(value.password!=null&&value.password!=""){
      updatedValue.password=value.password;
    }
    if(this.imgSrc!=null&&this.imgSrc!=""){
      updatedValue.avatar=this.imgSrc;
    }

    await this.landServ.modifyUser(updatedValue);
    this.router.navigateByUrl("main");
    alert("success!");
    return true;
  }

  checkCurrentUser(): boolean {
    this.accountName = this.landServ.getCurrentUserName();
    if (this.accountName == null || this.accountName == "") {
      this.router.navigateByUrl("");
      return false;
    }

    if (typeof this.accountName === "string") {
      var infoJson = JSON.parse(this.landServ.getCurrentUserInfo());
      this.imgSrc = infoJson.avatar;
      this.accountName = infoJson.username;
      this.displayName = infoJson.displayname;
      this.emailAddress = infoJson.email;
      this.phoneNumber = infoJson.phone;
      this.zipcode = infoJson.zipcode;
      this.password = "";
      this.passwordConfirmation = "";
    }
    return true;
  }

  fileChange(element:any):void{
    this.uploadedFiles = element.target.files;
  }

  async uploadPic() {
    let formData = new FormData();
    /*for (var i = 0; i < this.uploadedFiles.length; i++) {
      formData.append("uploads[]", this.uploadedFiles[i], this.uploadedFiles[i].name);
    }*/
    formData.append("image",this.uploadedFiles[0]);
    if(this.uploadedFiles.length<1){
      alert("choose a picture first!");
      return;
    }
    this.landServ.uploadPic(formData).then(url=>{
      this.imgSrc=url;
    });
  }

  async link(){
    //not a thirdparty
    let curUsername=this.landServ.getCurrentUserName();
    if(curUsername.indexOf("@")==-1){
      alert("You are not a third-party account user.");
      return;
    }

    // @ts-ignore
    let username=document.getElementById("linkUsername").value;
    // @ts-ignore
    let pwd=document.getElementById("linkPwd").value;
    if(pwd==null||pwd==""||username==null||username==""){
      alert("please identify the account to bind");
      return;
    }
    let data={
      username:username,
      password:pwd
    }
    let info=await this.landServ.link(data);
    if(info=="fail"){
      return;
    }else{
      await this.router.navigateByUrl("main");
      return;
    }
  }

  async unlink(){
    let info=await this.landServ.unlink();
    if(info=="fail"){
      return;
    }else{
      await this.router.navigateByUrl("main");
      return;
    }
  }
}
