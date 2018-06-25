// import { Component } from '@angular/core';
//
// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent {
//   title = 'app works!';
// }
/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation, ElementRef, NgZone} from '@angular/core';
//import { EditorComponent } from './editor/editor.component';

//import {Angulartics2GoogleAnalytics} from 'angulartics2/src/providers/angulartics2-google-analytics';
import {WindowRef} from "./WindowRef";


import {ShowimageService} from './editor/showimage.service';


/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [  ShowimageService],

  encapsulation: ViewEncapsulation.None

})

export class AppComponent {


  constructor(private windowRef: WindowRef, private elementRef: ElementRef, private showimageService: ShowimageService, private _ngZone: NgZone) {
    var native = this.elementRef.nativeElement;
    showimageService.native = native;

    showimageService.originalImageUrl = native.getAttribute("originalImageUrl");
    showimageService.resultImageUrl = native.getAttribute("resultImageUrl");
    showimageService.imageSizeWidth = native.getAttribute("imageSizeWidth");
    showimageService.imageSizeHeight = native.getAttribute("imageSizeHeight");
    var shadow = native.getAttribute("shadow");
    if(shadow !== null){
      showimageService.applyShadow = shadow;
    }
    var transparent = native.getAttribute("transparent");
    if(transparent !== null){
      showimageService.applyTransparent= transparent;
    }


    showimageService.apiUrl = "//api.v1.malabi.co/" ;
    showimageService.apiId = native.getAttribute("apiId");
    // this.windowRef.nativeWindow.camera51App = {
    //   zone: this._ngZone,
    //   componentFnaa: (value) => this.callFromOutside(value),
    //   component: this
    // };

  }

  ngOnInit() {
  }

}

/*
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
