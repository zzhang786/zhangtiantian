import {EventEmitter, Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {stringify} from "@angular/compiler/src/util";

@Injectable({
  providedIn: 'root'
})
export class LandingService {
  SUCCESS: string = "success";
  FAIL: string = "failed";
  UNAUTH: string = "unauthorized";

  relations: string = "";
  users: string = "";
  posts: string = "";
  currentUser: string = ""
  currentUserInfo: string = "";
  followTo: string = "";
  followedBy: string = "";//userName   dispName  status

  userToShowChangeEvent = new EventEmitter<string>();
  currentUserChangeEvent = new EventEmitter<string>();
  relationChangeEvent = new EventEmitter<string>();

 // hostUrl = "http://localhost:3000/";
  hostUrl = "https://zhangtiantianfi2021.herokuapp.com/";

  constructor(private http: HttpClient) {
    //load json placeholder
    this.saveUsers();
    //load user relation
    this.initRelations();
    //load post
    this.getPost();

  }

  /*************
   user
   **************/
  changeUser(username: string): void {
    this.currentUserChangeEvent.emit(username);
  }

  async login(username: string, password: string) {
    // localStorage.setItem("currentUser", username);
    // this.currentUser=username;
    // this.changeUser(username);
    let data = {
      "username": username,
      "password": password
    };
    await this.qxHttpRequest('login', 'post', data).then(async response => {
      if (response.result == this.SUCCESS) {
        //get userinfo
        this.currentUser = response.username;
        // this.currentUserInfo = JSON.stringify(response.res);
        //save userinfo
        // localStorage.setItem("currentUserInfo", this.currentUserInfo);
        localStorage.setItem("currentUser", username);
        //get user Relation
        await this.qxHttpRequest("following", "get", this.currentUser).then(async response2 => {
          if (response2.info == this.FAIL) {
            return;
          }
          //save user Relation
          await (async () => {
            //save followTo
            let followToJson: any[] = [];
            for (let follower of response2.following) {
              await this.qxHttpRequest("profile", "get", follower).then(response3 => {
                if (response3.res != null) {
                  followToJson.push(response3.res);
                }
              });
            }
            this.followTo = JSON.stringify(followToJson);
            localStorage.setItem("followTo", this.followTo);

            //save followedBy
            let followedByJson: any[] = [];
            for (let followed of response2.followedBy) {
              await this.qxHttpRequest("profile", "get", followed).then(response4 => {
                  if (response4.res != null) {
                    followedByJson.push(response4.res);
                  }
                }
              );
            }
            this.followedBy = JSON.stringify(followedByJson);
            localStorage.setItem("followedBy", this.followedBy);

            //save the user's profile
            await this.qxHttpRequest("profile", "get", this.currentUser).then(response5 => {
              this.currentUserInfo = JSON.stringify(response5.res);
              localStorage.setItem("currentUserInfo", this.currentUserInfo);
            })

            this.changeUser(username);
          })();


        });

      } else {
        alert("Username not existed or Password does not match!");
      }
    })

  }

  async logOut() {
    await this.qxHttpRequest("logout", "put", null);

    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserInfo");
    localStorage.removeItem("followedBy");
    localStorage.removeItem("followTo");
    this.currentUser = "";
    this.changeUser("");
  }

  logOutWithoutCookie() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserInfo");
    localStorage.removeItem("followedBy");
    localStorage.removeItem("followTo");
    this.currentUser = "";
    this.changeUser("");
  }

  getStatusByUserName(userName: string): string {
    var userStr = this.getUserInfoByUserName(userName);
    if (userStr == "") {
      return "";
    }
    var userJson = JSON.parse(userStr);
    return userJson.status;
  }

  //user register
  async userReg(value: any) {
    //database
    let newUser1 = {
      "username": value.accountName,
      "email": value.emailAddress,
      "dob": value.birth,
      "zipcode": value.zipcode,
      "headline": "I have a good day",
      "avatar": "http://res.cloudinary.com/hf29koyd5/image/upload/v1638496147/o7kx3fef0jy75yapiqve.jpg",
      "displayname": value.displayName,
      "phone": value.phoneNumber,
      "password": value.password,
    };
    //duplicate username check
    return await this.qxHttpRequest("findUserByUserName", "get", value.accountName).then(async res => {
        if (res.info == this.SUCCESS) {//find one
          alert("this account name has been used!");
          return false;
        }
        //register
        await this.qxHttpRequest("register", "post", newUser1);
        return true;
      }
    );
    //#database
    return true;
  }

  getCurrentUserName(): string {//OK
    let res = localStorage.getItem("currentUser");
    if (res == null) {
      return "";
    } else {
      return res;
    }
    // return this.currentUser;
  }

  async testThird() {
    return await this.qxHttpRequest("getCurrentUserNameForMain", "get", "").then(async res => {
      if (res.info == this.FAIL) {
        return "";
      }
      await this.login(res.res, res.res);
      return res.res;
    });
  }

  getUserInfoByUserName(userName: string): string {
    if (localStorage.getItem("users") == null) {
      return "";
    }
    this.users = <string>localStorage.getItem("users");
    if (this.users == null) {
      return "";
    }

    let userJson = JSON.parse(this.users);
    for (var i = 0; i < userJson.length; i++) {
      if (userJson[i].username == userName) {
        return JSON.stringify(userJson[i]);
      }
    }
    return "";
  }

  getDispNameByUserName(userName: string): string {
    if (localStorage.getItem("users") == null) {
      return "";
    }
    this.users = <string>localStorage.getItem("users");
    if (this.users == null) {
      return "";
    }

    let userJson = JSON.parse(this.users);
    for (var i = 0; i < userJson.length; i++) {
      if (userJson[i].username == userName) {
        return userJson[i].name;
      }
    }

    return "";
  }

  getCurrentUserInfo(): string {//OK
    // let userName = this.getCurrentUserName();
    // if (userName == "") {
    //   return "";
    // }
    //
    // let res = this.getUserInfoByUserName(userName);
    // if (res == null || res == "") {
    //   return "";
    // }
    // return res;
    let res = localStorage.getItem("currentUserInfo");
    return res == null ? "" : res;
  }

  async modifyUser(value: any) {
    // // @ts-ignore
    // this.users = localStorage.getItem("users");
    // var userJson = JSON.parse(this.users);
    // //get the user to be modified
    // var existed = -1;
    // var currentUserName = this.getCurrentUserName();
    // for (var i = 0; i < userJson.length; i++) {
    //   if (userJson[i].username == currentUserName) {
    //     existed = i;
    //   }
    // }
    //
    // var infoJson = userJson[existed];
    // if (value.displayName != null && value.displayName != "") {
    //   infoJson.name = value.displayName;
    // }
    // if (value.emailAddress != null && value.emailAddress != "") {
    //   infoJson.email = value.emailAddress;
    // }
    // if (value.phoneNumber != null && value.phoneNumber != "") {
    //   infoJson.phone = value.phoneNumber;
    // }
    // if (value.zipcode != null && value.zipcode != "") {
    //   infoJson.address.zipcode = value.zipcode;
    // }
    // if (value.password != null && value.password != "") {
    //   infoJson.password = value.password;
    // }
    // if (value.status != null && value.status != "") {
    //   infoJson.status = value.status;
    // }
    // this.users = JSON.stringify(userJson);
    // localStorage.setItem("users", this.users);
    return await this.qxHttpRequest("profile", "put1", value).then(async response => {
      await this.qxHttpRequest('profile', 'get', localStorage.getItem("currentUser")).then(response1 => {
        //get userinfo
        this.currentUser = response1.username;
        this.currentUserInfo = JSON.stringify(response1.res);
        //save userinfo
        localStorage.setItem("currentUserInfo", this.currentUserInfo);
        localStorage.setItem("currentUser", this.currentUser);
      })

    });
  }


  saveUsers(): Observable<any> {
    // let res: Observable<any> = new Observable<any>();
    // this.requestUsers().subscribe(response => {
    //   res = response;
    //   if (localStorage.getItem("users") != null) {
    //     return response;
    //   }
    //
    //   if (response instanceof Array) {
    //     response.forEach(elem => {
    //       elem.imgSrc = "assets/" + (elem.id % 10 + 1) + ".jpg";
    //       elem.password = elem.address.street;
    //       elem.status = elem.company.catchPhrase;
    //     })
    //   }
    //   this.users = JSON.stringify(response);
    //   localStorage.setItem("users", this.users);
    // });
    // return res;
    return new Observable<any>();
  }

  requestUsers(): Observable<any> {
    // let url = 'https://jsonplaceholder.typicode.com/users';
    // return this.http.get(url);
    return new Observable<any>();
  }

  getUserIdByUserName(userName: string): number {
    // @ts-ignore
    this.users = localStorage.getItem("users");
    var userJson = JSON.parse(this.users);
    //get the user to be modified
    var existed = -1;
    for (var i = 0; i < userJson.length; i++) {
      if (userJson[i].username == userName) {
        existed = i;
        return userJson[i].id;
      }
    }
    return -1;
  }

  getUserNameByUserId(userId: number): string {
    // @ts-ignore
    this.users = localStorage.getItem("users");
    var userJson = JSON.parse(this.users);
    //get the user
    var existed = -1;
    if (userJson == null) {
      return "";
    }
    for (var i = 0; i < userJson.length; i++) {
      if (userJson[i].id == userId) {
        existed = i;
        return userJson[i].username;
      }
    }
    return "";
  }

  getImgSrcByUserName(userName: string): string {
    this.users = this.getUserInfoByUserName(userName);
    var userJson = JSON.parse(this.users);
    return userJson.imgSrc;
  }


  /*************
   post
   **************/
  getPost(): Observable<any> {
    // let url = 'https://jsonplaceholder.typicode.com/posts';
    // let res = new Observable<any>();
    // this.http.get(url).subscribe(response => {
    //   res = <Observable<any>>response;
    //   if (response instanceof Array) {
    //     response.forEach(
    //       elem => {
    //         elem.userName = this.getUserNameByUserId(elem.userId);
    //         elem.dispName = this.getDispNameByUserName(elem.userName);
    //         elem.imgSrc = "assets/" + (elem.id % 10 + 1) + ".jpg";
    //         elem.time = "2021-" + Math.ceil(Math.random() * 12) + "-" + Math.ceil(Math.random() * 30);
    //       }
    //     )
    //     this.posts = JSON.stringify(response);
    //     localStorage.setItem("posts", this.posts);
    //   }
    // });
    // return res;
    return new Observable<any>();
  }

  async getPostByKeyWords(keyWords: string) {
    return await this.qxHttpRequest("searcharticles", "get", keyWords).then(response => {
        return response.res;
      }
    );

    /*let postInfo = localStorage.getItem("posts");
    if (postInfo == null) {
      return null;
    }

    let postJson = JSON.parse(postInfo);
    let res: any[] = [];

    for (var i = 0; i < postJson.length; i++) {
      if (
        postJson[i].body.includes(keyWords) ||
        postJson[i].title.includes(keyWords) ||
        postJson[i].userName.includes(keyWords) ||
        postJson[i].dispName.includes(keyWords)) {
        res.push(postJson[i]);
      }
    }

    res.sort(function (a: any, b: any) {
      if (a.time < b.time) {
        return 1;
      }
      if (a.time > b.time) {
        return -1;
      }
      if (a.id < b.id) {
        return 1;
      }
      if (a.id > b.id) {
        return -1;
      }
      return 0;
    })


    return res;*/
  }

  async getPostByUserName(username: string) {
    return await this.qxHttpRequest("articles", "get", username).then(response => {
      return response;
    });
  }

  async addComment(data: any) {
    return this.qxHttpRequest("addComment", "put1", data).then(response => {
        // @ts-ignore
        this.userToShowChangeEvent.emit(localStorage.getItem("currentUser"));
        return response;
      }
    );
  }

  async modifyComment(articleId: any, commentId: any) {
    let data = {
      articleId: articleId,
      commentId: commentId
    }
    return this.qxHttpRequest("modifyComment", "put1", data).then(response => {
        // @ts-ignore
        this.userToShowChangeEvent.emit(localStorage.getItem("currentUser"));
        return response;
      }
    );

  }


  async addPost(newTitle: string, newContent: string, img: string) {
    let article = {
      "title": newTitle,
      "text": newContent,
      "img": img
    };
    return await this.qxHttpRequest("article", "post", article).then(response => {
      return response;
    });
  }

  async getHeadlineByUsername() {//use it to check cookie
    return await this.qxHttpRequest("headline","get","cs").then(response=>{
        if(response.info==this.FAIL){
          alert("Session Time Out. Please login again.");
          return this.FAIL;
        }else{
          return response;
        }
    });
  }


  addPostByUser(newTitle: string, newContent: string, username: string): any {
    let userInfo = this.getUserInfoByUserName(username);
    let userJson = JSON.parse(userInfo);

    let postInfo = localStorage.getItem("posts");
    if (postInfo != null) {
      let postJson = JSON.parse(postInfo);
      let totalNumber = postJson.length;
      postJson[totalNumber] = {
        body: newContent == "" ? postJson[totalNumber % 10 + 1].body : newContent,
        dispName: userJson.name,
        id: totalNumber + 1,
        imgSrc: "assets/" + (totalNumber % 10 + 1) + ".jpg",
        time: "2022-12-1",
        title: newTitle == "" ? postJson[totalNumber % 10 + 1].title : newTitle,
        userId: userJson.id,
        userName: userJson.username
      };
      localStorage.setItem("posts", JSON.stringify(postJson));

    }
  }

  /*************
   Relations
   **************/
  initRelations(): Observable<any> {
    // if(this.getCurrentUserName()!=null&&this.getCurrentUserName()!=""){
    //   return;
    // }

    var relations: any = {};
    let res = new Observable<any>();
    // @ts-ignore
    this.users = localStorage.getItem("users");
    var userJson = JSON.parse(this.users);
    if (userJson == null) {
      return res;
    }
    //traverse all the users, and add relations for them
    for (var i = 0; i < userJson.length; i++) {//the follower
      let following = userJson[i].username;
      relations[following] = [];
      for (var j = 1; j <= (i >= 10 ? 1 : 3); j++) {//the followed
        let index = (i + j) % userJson.length;
        let followed = i >= 10 ? userJson[0].username : userJson[index].username;
        relations[following].push(followed);
      }
    }

    this.relations = JSON.stringify(relations);
    localStorage.setItem("relations", this.relations);
    return res;
  }

  async addRelations(following: string, followed: string) {
    return this.qxHttpRequest("following", "put", followed).then(async response => {
      if (response.username == null) {//not log in
        return null;
      }
      if (response.info == this.FAIL) {//no user
        return "No user";
      }

      //save followTo
      let followToJson: any[] = [];
      await (async () => {
        for (let follower of response.following) {
          await this.qxHttpRequest("profile", "get", follower).then(response3 => {
            if (response3.res != null) {
              followToJson.push(response3.res);
            }
          });
        }
        this.followTo = JSON.stringify(followToJson);
        localStorage.setItem("followTo", this.followTo);
      })();

      return this.SUCCESS;
    })
    /*if (following == followed) {
      alert("You can't follow yourself.");
      return false;
    }

    //get all the relations
    let relations = localStorage.getItem("relations");
    let reJson: any = {};
    if (relations != null) {
      reJson = JSON.parse(relations);
    }

    //modify the specific relation
    for (var key in reJson) {
      if (key == following) {

        for (var i = 0; i < reJson[key].length; i++) {
          if (reJson[key][i] == followed) {
            alert("You already followed him.");
            return false;
          }
        }

        //invalid username
        if (this.getUserInfoByUserName(followed) == "") {
          alert("No username existed.");
          return false;
        }

        reJson[key].push(followed);
        this.relations = JSON.stringify(reJson);
        localStorage.setItem("relations", JSON.stringify(reJson));
        return true;
      }
    }

    //for new user, insert a new relation
    reJson[following] = [];
    reJson[following].push(followed);
    this.relations = JSON.stringify(reJson);
    localStorage.setItem("relations", JSON.stringify(reJson));
    return true;*/
  }

  async deleteRelations(following: string, followed: string) {//following is current user
    // if (following == followed) {
    //   return false;
    // }
    //
    // //get all the relations
    // let relations = localStorage.getItem("relations");
    // let reJson: any = {};
    // if (relations != null) {
    //   reJson = JSON.parse(relations);
    // }
    //
    // //modify the specific relation
    // for (var key in reJson) {
    //   if (key == following) {//find the relation
    //     for (var i = 0; i < reJson[key].length; i++) {//find the index of the element to be deleted
    //       if (reJson[key][i] == followed) {
    //         reJson[key].splice(i, 1);//delete
    //         this.relations = JSON.stringify(reJson);
    //         localStorage.setItem("relations", JSON.stringify(reJson));
    //         return true;
    //       }
    //     }
    //   }
    // }
    // return true;
    return this.qxHttpRequest("following", "delete", followed).then(async response => {
      if (response.username == null) {//not log in
        return null;
      }
      if (response.info == this.FAIL) {//no user
        return "No user";
      }

      //save followTo
      let followToJson: any[] = [];
      await (async () => {
        for (let follower of response.following) {
          await this.qxHttpRequest("profile", "get", follower).then(response3 => {
            if (response3.res != null) {
              followToJson.push(response3.res);
            }
          });
        }
        this.followTo = JSON.stringify(followToJson);
        localStorage.setItem("followTo", this.followTo);
      })();

      return this.SUCCESS;
    })
  }

  getFollowingByName(userName: string): any {

    // let relations = localStorage.getItem("relations");
    // if (relations == null) {
    //   return null;
    // }
    //
    // let reJson = JSON.parse(relations);
    // let res: any[] = [];
    //
    // //no relation of this user, a new user then. we need to create relation for him
    // let needIntialRe = true;
    // for (var key in reJson) {
    //   if (key == userName) {
    //     needIntialRe = false;
    //     break;
    //   }
    // }
    // if (needIntialRe) {
    //   this.initRelations();
    //   relations = localStorage.getItem("relations");
    //   // @ts-ignore
    //   reJson = JSON.parse(relations);
    // }
    //
    //
    // for (var key in reJson) {
    //   if (key == userName) {//find the user
    //     for (var i = 0; i < reJson[key].length; i++) {
    //       res.push(
    //         {
    //           imgSrc: this.getImgSrcByUserName(reJson[key][i]),
    //           userName: reJson[key][i],
    //           dispName: this.getDispNameByUserName(reJson[key][i]),
    //           status: this.getStatusByUserName(reJson[key][i]),
    //           id: this.getUserIdByUserName(reJson[key][i]),
    //         }
    //       );
    //     }
    //   }
    // }
    // return res;
    let res = localStorage.getItem("followTo");
    if (res == null) {
      return null;
    } else {
      return JSON.parse(res);
    }
  }

  getFollowerByName(userName: string): any {
    // let relations = localStorage.getItem("relations");
    // if (relations == null) {
    //   return null;
    // }
    //
    // let reJson = JSON.parse(relations);
    // let res: any[] = [];
    //
    // for (var key in reJson) {
    //   for (var i = 0; i < reJson[key].length; i++) {
    //     if (reJson[key][i] == userName) {//this person is following the user, represented by the username passed in
    //       res.push(
    //         {
    //           userName: key,
    //           dispName: this.getDispNameByUserName(key),
    //           status: this.getStatusByUserName(reJson[key]),
    //         }
    //       );
    //       //break;
    //     }
    //   }
    // }
    // return res;
    let res = localStorage.getItem("followedBy");
    if (res == null) {
      return null;
    } else {
      return JSON.parse(res);
    }
  }


  /*************
   localStorage
   **************/
  // clearLocalStorage(): any {
  //   for (var i = 0; i < localStorage.length; i++) {
  //     var key = localStorage.key(i);
  //     if (key != null) {
  //       localStorage.removeItem(key);
  //     }
  //   }
  // }
  async uploadPic(formData: any): Promise<any> {
    return new Promise(resolve => {
      this.http.post(this.hostUrl + 'image', formData)
        .subscribe((response) => {
          // @ts-ignore
          let url = response['url'];
          resolve(url);
        })
    });
  }


  /*************
   thrid Party Link
   **************/
  async link(data: any){
    //1. linkto account, set thirdParty
    //2. delete thrid party account
    return await this.qxHttpRequest("link","post",data).then(async response=>{
      if(response.info=="fail"){
        alert(response.res);
        return "fail";
      }

      await this.login(response.res.username,response.res.password);
      return "success";
    });
  }

  async unlink(){
    //1. linkto account, set thirdParty
    //2. delete thrid party account
    return await this.qxHttpRequest("unlink","post", {}).then(async response=>{
      if(response.info=="fail"){
        alert(response.res);
        return "fail";
      }

      await this.login(response.res.username,response.res.password);
      return "success";
    });
  }
  /*************
   # thrid Party Link
   **************/


  /*************
   HttpRequest
   **************/

  async qxHttpRequest(endpoint: string, method: string, data: any): Promise<any> {
    if (method == "post") {
      return new Promise(resolve => {
        this.http.post(
          this.hostUrl + endpoint,
          data,
          {withCredentials: true}
        )
          .subscribe((response) => {
            resolve(response);
          },error=>{
            resolve(this.FAIL)
          })
      });
    } else if (method == "get") {
      let url = this.hostUrl + endpoint;
      if (data != null && data != "") {
        url += "/" + data;
      }
      return new Promise(resolve => {
        this.http.get(
          url,
          {withCredentials: true}
        )
          .subscribe((response) => {
            resolve(response);
          }, error => {
            resolve({info:this.FAIL})
          })
      });
    } else if (method == "put") {
      let url = this.hostUrl + endpoint;
      if (data != null && data != "") {
        url += "/" + data;
      }
      return new Promise((resolve, reject) => {
        this.http.put(
          url,
          {},
          {withCredentials: true}
        )
          .subscribe((response) => {
            resolve(response);
          },error=>{
            resolve("timeout");
          })
      });
    } else if (method == "put1") {
      let url = this.hostUrl + endpoint;
      return new Promise((resolve, reject) => {
        this.http.put(
          url,
          data,
          {withCredentials: true}
        )
          .subscribe((response) => {
            resolve(response);
          })
      });
    } else if (method == "delete") {
      let url = this.hostUrl + endpoint;
      if (data != null && data != "") {
        url += "/" + data;
      }
      return new Promise((resolve, reject) => {
        this.http.delete(
          url,
          {withCredentials: true}
        )
          .subscribe((response) => {
            resolve(response);
          })
      });
    }

  }


}
