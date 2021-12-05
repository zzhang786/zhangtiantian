import {Component, OnInit} from '@angular/core';
import {Input} from "@angular/core";
import {Router} from "@angular/router";
import {LandingService} from "./landing.service";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {FormGroup} from "@angular/forms";

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  regForm: FormGroup;
  values: any[];

  loginForm: FormGroup;

  accountNameLogin: string = "";
  passwordLogin: string = "";
  accountLoginWarning: string = "account is needed";
  passwordLoginWarning: string = "passwork can't be null";


  constructor(public router: Router, private landServ: LandingService) {
    let fb = new FormBuilder();
    this.values = [];
    this.regForm = fb.group({
        accountName: ['', {
          validators: [Validators.required,
            this.validAccountName
          ],
          updateOn: 'change'
        }],

        displayName: ['', {
          // validators: [Validators.required],
          updateOn: 'change'
        }],

        emailAddress: ['', {
          validators: [Validators.required,
            this.validEmail
          ],
          updateOn: 'change'
        }],

        phoneNumber: ['', {
          validators: [Validators.required,
            this.validNumber
          ],
          updateOn: 'change'
        }],

        birth: ['', {
          validators: [Validators.required,
            this.checkAdult
          ],
          updateOn: 'change'
        }],

        zipcode: ['', {
          validators: [Validators.required, Validators.maxLength(5), Validators.minLength(5)],
          updateOn: 'change'
        }],

        password: ['', {
          validators: [Validators.required,],
          updateOn: 'change'
        }],

        passwordConfirmation: ['', {
          validators: [Validators.required,],
          updateOn: 'change'
        }],

      }
      ,
      {
        validators: [this.samePwd]
      }
    );


    this.loginForm = fb.group({
      accountNameLogin: ['Bret', {
        validators: [Validators.required,],
        updateOn: 'change'
      }],


      passwordLogin: ['Kulas Light', {
        validators: [Validators.required,],
        updateOn: 'change'
      }],

    });

    if (this.landServ.getCurrentUserName() != null && this.landServ.getCurrentUserName() != "") {
      this.router.navigateByUrl("main");
    }

  }

  ngOnInit(): void {
  }

  validNumber(control: FormControl): any {
    let value = control.value;
    let reg = /([0-9]{3}[0-9]{3}[0-9]{4})/;
    if (!reg.test(value)) {
      return {validNumber: {info: 'please input a valid number'}};
    } else {
      return null;
    }
  }

  validAccountName(control: FormControl): any {
    let value = control.value;

    let reg = /(^[a-zA-Z])+([a-zA-Z0-9])*/;
    if (!reg.test(value)) {
      return {validAccountName: {info: 'please input a valid accountName'}};
    } else {
      return null;
    }
  }

  checkAdult(control: FormControl): any {
    let birthDate = new Date(control.value);
    let today = new Date();
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }


    if (age < 18) {
      return {checkAdult: {info: 'Can NOT register under 18'}};
    } else {
      return null;
    }
  }

  samePwd(controlGroup: FormGroup): any {

    // @ts-ignore
    let pw2 = controlGroup.get('password').value;
    // @ts-ignore
    let pw1 = controlGroup.get('passwordConfirmation').value;

    if (pw2 == pw1) {
      return null;
    } else {
      return {samePwd: {info: 'password do NOT match!'}};
    }
  }

  validEmail(control: FormControl): any {
    let value = control.value;
    let reg = /([a-zA-Z0-9])+@([a-zA-Z0-9])+\.([a-zA-Z0-9])+/;
    if (!reg.test(value)) {
      return {validEmail: {info: 'please input a valid email'}};
    } else {
      return null;
    }
  }

// register
  async onSubmit(value: any) {
    if (
      this.regForm.errors != null ||

      this.regForm.hasError('validAccountName', 'accountName') ||
      this.regForm.hasError('required', 'accountName') ||

      this.regForm.hasError('minlength', 'zipcode') ||
      this.regForm.hasError('maxlength', 'zipcode') ||

      this.regForm.hasError('validEmail', 'emailAddress') ||
      this.regForm.hasError('validNumber', 'phoneNumber') ||
      this.regForm.hasError('checkAdult', 'birth') ||
      this.regForm.hasError('required', 'zipcode') ||
      this.regForm.hasError('samePwd', '')
    ) {
      this.router.navigateByUrl("");
      return false;
    }

    // if (this.landServ.userReg(value)) {
    //   this.regForm.get("emailAddress")?.setValue("fake");
    //   this.router.navigateByUrl("main");
    // }
    let resBoolean=await this.landServ.userReg(value);
    if(!resBoolean){
      return false;
    }
    //this.router.navigateByUrl("main");
    this.onLoginSubmit({
      accountNameLogin:value.accountName,
      passwordLogin:value.password
    })
    return true;
  }

//login
  async onLoginSubmit(value: any) {
    var username = value.accountNameLogin;
    var pwd = value.passwordLogin;

    if (this.checkLogin(username, pwd)) {
      await this.landServ.login(username,pwd);
      await this.router.navigateByUrl("main");
      return true;
    } else {
      this.passwordLoginWarning = "can't find username or password";
      return false;
    }

  }

  checkLogin(username: string, pwd: string): boolean {
    return true;
    // var userInfo = this.landServ.getUserInfoByUserName(username);
    // if (userInfo == null||userInfo=="") {
    //   return false;
    // }
    // if (typeof userInfo === "string") {
    //   var userInfoJson = JSON.parse(userInfo);
    //   if (userInfoJson.password != null && userInfoJson.password == pwd) {
    //     return true;
    //   }
    // }
    // this.passwordLogin = "";
    // return false;
  }
  showReg(){
    // @ts-ignore
    let val=document.getElementById("regForm").style.display;
    // @ts-ignore
    document.getElementById("regForm").style.display= val=="none"?"":"none";
  }
}
