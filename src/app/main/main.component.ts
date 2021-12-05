import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LandingService} from "../landing/landing.service";
import {Router} from "@angular/router";
import {AppComponent} from "../app.component";


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  listItem: any[] = [];
  userIdToShow: string = "";

  followed: any[] = [];
  userInfo: any = {};

  newTitle: string = "your title";
  newContent: string = "you post here";

  keyWords: string = "search articles (author, title, text)";

  imgSrc: string = "assets/1.jpg";
  uploadedFiles: Array<File> = [];


  constructor(private landServ: LandingService, private router: Router) {

    //post list
    (async () => {
      let userName = this.landServ.getCurrentUserName();

      //make a request for third party user, to save localstorage
      if (userName == null || userName == "") {
        try {
          userName = await this.landServ.testThird();
        }catch (e) {
          userName="";
        }
      }

      if (userName == null || userName == "") {
        await this.router.navigateByUrl("");
        return;
      }


      //check cookie
      let res=await this.landServ.getHeadlineByUsername();
      if(res=="failed"){
        this.landServ.logOutWithoutCookie();
        await this.router.navigateByUrl("");
        return;
      }
      //check cookie


      //status
      this.userInfo = JSON.parse(this.landServ.getCurrentUserInfo());
      //followed
      this.followed = this.landServ.getFollowerByName(userName);

      this.userIdToShow = this.landServ.getCurrentUserName();
      this.listItem = await this.landServ.getPostByUserName(this.userIdToShow);
    })();

    this.landServ.userToShowChangeEvent.subscribe(
      async (userName: string) => {
        this.userIdToShow = userName;
        this.listItem = await this.landServ.getPostByUserName(this.userIdToShow);
      }
    );

    this.landServ.relationChangeEvent.subscribe(
      async (userName: string) => {
        this.userIdToShow = this.landServ.getCurrentUserName();
        this.listItem = await this.landServ.getPostByUserName(this.userIdToShow);
      }
    );


  }

  ngOnInit(): void {
  }

  async changeStatus() {
    await this.landServ.modifyUser({headline: this.userInfo.status});
    this.landServ.changeUser(this.landServ.getCurrentUserName());
    alert("Success!");
  }

  async post() {
    this.listItem = await this.landServ.addPost(this.newTitle, this.newContent, this.imgSrc);
    //this.listItem =await this.landServ.getPostByUserId(this.userIdToShow);
    this.newTitle = "yout title";
    this.newContent = "you post here";
    return true;
  }

  async search() {
    if (this.keyWords == null || this.keyWords == "") {
      return;
    }
    this.listItem = await this.landServ.getPostByKeyWords(this.keyWords);
  }

  clear(): void {
    this.newTitle = "your title";
    this.newContent = "you post here";
  }

  fileChange(element: any): void {
    this.uploadedFiles = element.target.files;
  }

  async uploadPic() {
    let formData = new FormData();
    /*for (var i = 0; i < this.uploadedFiles.length; i++) {
      formData.append("uploads[]", this.uploadedFiles[i], this.uploadedFiles[i].name);
    }*/
    formData.append("image", this.uploadedFiles[0]);
    if (this.uploadedFiles.length < 1) {
      alert("choose a picture first!");
      return;
    }
    this.landServ.uploadPic(formData).then(url => {
      this.imgSrc = url;
    });
  }

  addComment(articleId: any) {
    let elem: any = document.getElementById("comment" + (articleId));
    if (elem == null) {
      alert("Error");
      return
    }

    let comment: string = elem.value;
    if (comment == null || comment == "") {
      alert("Please write your comment FIRST.");
      return
    }
    let data = {
      "id": articleId,
      "comment": comment
    }
    this.landServ.addComment(data);
    alert("success");
  }

  async modifyComment(article: any, comment: any) {
    if (comment.username != this.landServ.getCurrentUserName()) {
      alert("Only the comment publisher can delete this comment.");
      return;
    }
    await this.landServ.modifyComment(article.id, comment.id).then(response => {
      alert("Deleted");
      return;
    });
  }

}
