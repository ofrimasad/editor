
import {
  Component, Input, ViewChild, ElementRef,
  ChangeDetectorRef, ViewEncapsulation, NgZone
} from '@angular/core';
import { NgClass} from '@angular/common';
import {Injectable}     from '@angular/core';
import {Http, Response, Headers} from '@angular/http';


import { Angulartics2 } from 'angulartics2';
//import {Angulartics2GoogleAnalytics} from 'angulartics2/src/providers/angulartics2-google-analytics';

import {Angulartics2On} from 'angulartics2';

import {BrowserDomAdapter} from '@angular/platform-browser/src/browser/browser_adapter';
import {Observable}       from 'rxjs/Observable';

import {RequestEditImage} from './editimage.service';
import {Subject} from 'rxjs/Subject';

import {ShowimageService} from './showimage.service';

import 'rxjs/Rx';
import {WindowRef} from "../WindowRef";


@Component({
  selector: 'editor',

  providers: [RequestEditImage, BrowserDomAdapter],
  // pipes: [TranslatePipe],
  encapsulation: ViewEncapsulation.Emulated,

  styles: [require('./editor.component.css'),
    `
    .cursorRed{
      cursor: url('https://assets-malabi.s3.amazonaws.com/apiexample/assets/tools/red_pointer_6_lastone.cur'), auto;
      cursor: url( ${require('./red_pointer_6.png')} ) 0 0, auto;
    }
    .cursorGreen {
      cursor: url('https://assets-malabi.s3.amazonaws.com/apiexample/assets/tools/green_pointer_6_lastone.cur'), auto;
      cursor: url(${require('./green_pointer_6.png')}) 0 0, auto;
    }
    ` + "" + `
    .transparentBg {
        background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAIAAABMXPacAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABYElEQVR42u3ZwQmAMBQFQRU7Sv8lpKbYQI7Coswc5d2WD0LOtdaxM+fcfh9j2L+4vw5SAsQEiAkQEyAmQEyA2P2V/+W/7l1ATICYADEBYgLEBIgJEDu9B7R7FxATICZATICYADEBYgLEvAfEexcQEyAmQEyAmAAxAWICxLwHxHsXEBMgJkBMgJgAMQFiAsS8B8R7FxATICZATICYADEBYgLEvAfEexcQEyAmQEyAmAAxAWICxLwHxHsXEBMgJkBMgJgAMQFiAsS8B8R7FxATICZATICYADEBYgLEvAfEexcQEyAmQEyAmAAxAWICxLwHxHsXEBMgJkBMgJgAMQFiAsS8B8R7FxATICZATICYADEBYgLEvAfEexcQEyAmQEyAmAAxAWICxLwHxHsXEBMgJkBMgJgAMQFiAsS8B8R7FxATICZATICYADEBYgLEvAfEexcQEyAmQEyAmAAxAWICxB6KN5Q4wR/MdAAAAABJRU5ErkJggg==');
    }
    .imagewrapperBox {
      -webkit-box-shadow: rgba(0, 0, 0, 0.156863) 0px 3px 10px, rgba(0, 0, 0, 0.227451) 0px 3px 10px;;
      box-shadow:  rgba(0, 0, 0, 0.156863) 0px 3px 10px, rgba(0, 0, 0, 0.227451) 0px 3px 10px;;
    }
    `
  ],
  template: require('./editor.component.html')
})
@Injectable()
export class EditorComponent {
  @ViewChild('canvasElement') canvasElement;
  @ViewChild('image1Element') image1Element;
  @ViewChild('image2Element') image2Element;
  @ViewChild('imagewrapper') imagewrapper;
  @ViewChild('undoButton') undoButton;
  @ViewChild('colorFG') colorFGElement;
  @ViewChild('colorBG') colorBGElement;

  lastDataUrl:string = '';
  showWrapperShadow = true;
  wrapperShadow = "0 5px 15px rgba(0,0,0,.5)";
  imagewrapperOverflow = 'hidden';
  wrappermarginTop: any;
  maskHidden = false;
  imageWrapperMaxHeight;
  sessionId:string;
  imagewrapperSizeWidth;
  isGreen = false;
  flagShowResult = false;
  AMOUNT_ZOOM = 0.10;
  obj:any;
  assetsUrl = "api.malabi.co";
  imageSizeWidth;
  disableSaveImage;
  disableColorBG;
  disableUndoButton;
  disableColorFG;
  totalZoom = 0;
  decreaseInnerHeight:number = 10;
  totalZoomInitial;
  public ctx;
  public paint_simple;
  public clickX_simple = [];
  public clickY_simple = [];
  public clickSend = [];
  public clickDrag_simple = [];
  public clickColor = [];
  public clickLineWidth = [];
  public canvas_simple;
  public context_simple;
  applyShadow = true;
  applyTransparent = false;
  countEdits:number = 0;
  public canvasWidth = 236;
  public canvasHeight = 314;
  public colorBG = "rgb(255, 0, 0)";
  public colorFG = "rgb(0, 255, 0)";
  public colorChoosen = this.colorBG;
  totalScale = 0;
  pendingRequest = null; // for edit
  preversioResponseObj;
  public apiUrl;
  public apiProcessUrl;
  wrapperBGColor = "#fff";
  flagFirstTime:Number = 0;
  showResultImage = 'none';
  displayLoader = 'none';
  displayShowInstructions = 'none';
  undoDataUrl = [];
  undoImageStack = [];
  undoImageMaskStack = [];
  initDataUrl = [];
  undoEditResponse = [];
  go = [];
  showWatermark:boolean = true;
  maskUrl:String;
  pressTimer;
  public srcImageResult;
  public resultImageUrl;
  //  View_Result= "";
  editRequestSubject = new Subject();
  getSessionInfo = new Subject();
  flagShouldInitizlize = false;
  showProccessErrorMessageTitle = "";
  showProccessErrorMessage = "";
  public showProccessErrorWidth = 397;
  loaderImage;
  apiTrackId:string;
  progressPercent = 0;
  showEditorView = "none";
  defaultSrcImageResult = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
  private imageSizeHeight: number;
  private imagewrapperSizeheight: number;
  private longPress: boolean;
  private disableShowResult: boolean;
  private dataURL: any;

  constructor(private windowRef:WindowRef, private elementRef:ElementRef, private cdr:ChangeDetectorRef, private showimageService:ShowimageService,
              private requestEditImage:RequestEditImage, private _dom:BrowserDomAdapter, private http:Http,
              private _ngZone:NgZone) {

    this.showWrapperShadow = true;
    //  this.showimageService.resultEditMaskImageUrl = showimageService.resultImageUrl;
    this.obj = {
      "originalImageUrl": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
      "resultEditMaskImageUrl": "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",

    };
    this.srcImageResult = this.defaultSrcImageResult;


    //    sessionId = 1;
    //  var url = url.substring(0, url.lastIndexOf("/") + 1);

    this.editRequestSubject
      .switchMap((c: any) => this.http.post(c.a, c.b, {headers: c.header}))
      .map((res:Response) => res.json())
      .subscribe(res => this.showEditResponse(res.response));


    this.getSessionInfo
      .switchMap((c: any) => this.http.post(c.url, c.b, {headers: c.headers}))
      .map((res:Response) => res.json())
      .subscribe(res => this.foundTrackId(res));

    this.windowRef.nativeWindow.camera51Edit = {
      zone: this._ngZone,
      doZoom: (value) => this.doZoom(value),
      doLongZoomPressDown: (value) => this.doLongZoomPressDown(value),
      doLongZoomPressUp: (value) => this.doLongZoomPressUp(value),
      setColor: (value) => this.setColor(value),
      showResult: (value) => this.showResult(value),
      saveImage: (value) => this.saveImage(value),
      undo: () => this.undoEdit(),
      initApp: (value) => this.initApp(value),
      setTrackId: (value) => this.setTrackId(value),
      setDataOriginalUrl: (value) => this.setDataOriginalUrl(value),
      backToEdit: () => this.backToEdit(),
      component: this
    };

    this.setApiUrl(showimageService.apiUrl);
    //  this.initViewOnData();
    // this.calculateImageSize();
  }

  setApiUrl(apiUrl) {
    var lastChar = apiUrl.substr(-1); // Selects the last character
    if (lastChar != '/') {         // If the last character is not a slash
      apiUrl = apiUrl + '/';            // Append a slash to it.
    }
    this.apiProcessUrl = apiUrl + "Camera51Server/processImage";
    this.apiTrackId = apiUrl + "Camera51Server/retrieveSession";
  }

  initApp(obj) {
    this.showimageService.customerId = 0;
    this.showimageService.trackId = '';
    var newObj = JSON.parse(obj);
    this.setOutsideConfig(newObj);
    //  console.log(newObj, this.showimageService);
    if (this.showimageService.originalImageUrl != null &&
      this.showimageService.originalImageUrl.length > 0) {

      var sessionId = this.getSession(this.showimageService.originalImageUrl);
      //   console.log(sessionId);
      var strImage = this.resultImageUrl;
      strImage = strImage.replace("s3.amazonaws.com/cam51-img-proc", "d2f1mfcynop4j.cloudfront.net");


      this.showimageService.resultImageUrl = strImage;
      this.sessionId = sessionId;

      this.initViewOnData(sessionId);
      return;
    }
    if (this.showimageService.trackId != null &&
      this.showimageService.trackId.length > 0) {

      this.runGetTracker(this.showimageService.customerId, this.showimageService.trackId);

    }
  }

  getSession(path) {
    var url = path.substring(0, path.lastIndexOf("/") + 1);

    var m = path.match(/([^:\\/]*?)(?:\.([^ :\\/.]*))?$/)
    var fileName = (m === null) ? "" : m[0]
    var fileExt = (m === null) ? "" : m[1]
    this.maskUrl = url + m[1] + "_MASK_gen0.png";
    this.resultImageUrl = url + m[1] + "_RES.png";
    return url.substring(url.lastIndexOf("SID"), url.lastIndexOf("/"));
  }




  setOutsideConfig(obj) {
    this.initDrawArrays(null);

    if (obj.apiUrl && obj.apiUrl.length > 1) {
      this.setApiUrl(obj.apiUrl);
    }
    if (obj.transparent && obj.transparent == true) {
      this.showimageService.applyTransparent = true;
    }
    if (obj.showWatermark && obj.showWatermark == true) {
      this.showWatermark = true;
    } else {
      this.showWatermark = false;
    }
    console.log(obj);
    this.showimageService.customerId = obj.customerId;
    if (obj.customerId && typeof obj.customerId === 'number') {
      this.showimageService.customerId = obj.customerId;
    }

    if (typeof obj.showWrapperShadow === 'boolean') {
      this.showWrapperShadow = obj.showWrapperShadow;
    }

    if (obj.wrappermarginTop == 0 || (obj.wrappermarginTop && typeof obj.wrappermarginTop === 'number')) {
      this.wrappermarginTop = obj.wrappermarginTop;
      this.showimageService.wrappermarginTop = obj.wrappermarginTop;
    }

    if (obj.decreaseInnerHeight && typeof obj.decreaseInnerHeight === 'number') {

      this.decreaseInnerHeight = obj.decreaseInnerHeight;
    }
    if (obj.trackId && typeof obj.trackId === 'string' && obj.trackId.length > 0) {
      this.showimageService.trackId = obj.trackId;
    }
    if (obj.originalImageUrl && typeof obj.originalImageUrl === 'string' && obj.originalImageUrl.length > 0) {
      this.showimageService.originalImageUrl = obj.originalImageUrl;
    }

    if (obj.backgroundColor && typeof obj.backgroundColor === 'string' && obj.backgroundColor.length > 0) {
      this.wrapperBGColor = obj.backgroundColor;
    }
  }

  private runGetTracker(customerId, trackId) {
    this.showResultImage = "none";
    this.maskHidden = false;
    this.flagShowResult = false;

    this.showEditorView = 'none';
    this.startLoader();

    this.initDrawArrays(null);
    this.totalScale = 0;
    this.totalZoom = 0;
    this.undoDataUrl = [];
    this.undoEditResponse = [];
    if (customerId == '' || customerId == null) {
      return;
    }
    this.showimageService.customerId = customerId;

    c = {};
    var creds = {
      "trackId": trackId,
      "customerId": customerId
    };

    var credsa = this.param(creds);

    var c:any = {};
    c.url = this.apiTrackId;
    c.b = credsa;
    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    c.headers = headers;
    this.getSessionInfo.next(c);
    return true;
  }

  setDataOriginalUrl(obj) {
    this.startLoader();
    this.clearCanvas_simple();
    var newObj = JSON.parse(obj);
    var customerId = newObj.customerId;
    var originalImageUrl = newObj.originalImageUrl;
    this.setOutsideConfig(newObj);
    if (originalImageUrl.length > 0) {
      var sessionId = this.getSession(originalImageUrl);
      // console.log(sessionId);
      this.showimageService.originalImageUrl = originalImageUrl;

      this.showimageService.resultImageUrl = this.resultImageUrl;
      this.sessionId = sessionId;
      //that.stopLoader();
      this.initViewOnData(sessionId);
      return;
    }

  }


  resetDrawing(){

    this.clickColor = [];
    this.clickDrag_simple = [];
    this.clickLineWidth = [];
    this.clickX_simple = [];
    this.clickY_simple = [];
    this.clickSend = [];

  }

  setTrackId(obj) {

    this.undoEditResponse = [];
    this.undoImageMaskStack = [];
    this.undoImageStack = [];
    this.undoDataUrl = [];

    this.resetDrawing();
    this.initializeCanvas();
    this.countEdits = 0;
    var newObj = JSON.parse(obj);
    var customerId = newObj.customerId;
    var trackId = newObj.trackId;
    this.setOutsideConfig(newObj);
    this.showimageService.customerId = customerId;
    this.showimageService.trackId = trackId;
    this.runGetTracker(this.showimageService.customerId, this.showimageService.trackId);
  }


  getImageDimensions(url) {
    var img = new Image();
    var that = this;
    img.onload = function () {
      that.cdr.detectChanges();
      var height = img.height;
      var width = img.width;
      that.obj.imageSize = {};
      that.obj.imageSize.height = height;//this.image1Element.nativeElement.naturalHeight;
      that.obj.imageSize.width = width;//this.image1Element.nativeElement.naturalWidth;
      that.cdr.detectChanges();
      that.calculateImageSize();

      var dataURL = that.canvasElement.nativeElement.toDataURL();
      that.undoDataUrl.push(dataURL);
      that.undoEditResponse.push(that.obj);

      setTimeout(function () {
        that.ctx.setTransform(1, 0, 0, 1, 0, 0);
        that.ctx.scale(that.totalScale, that.totalScale);
        //console.log("scale", that.totalScale);
        that.showEditorView = "block";
        that.cdr.detectChanges();
      }, 200);

    };
    img.src = url;
  }


  foundTrackId(foundTrackId) {
    var response;

    if (foundTrackId.response) {
      response = foundTrackId.response;
    } else {
      console.log("foundTrackId", foundTrackId.response);
      console.log('track id not found');
      this.stopLoader();
      return;
    }
    if (response.hasOwnProperty('errors')) {
      console.log('track id not found response: ', response.errors[0]);
      this.windowRef.nativeWindow.callbackEdit({'error': "trackerIdNotFound", "message": response.errors[0]});
      this.stopLoader();
      return;
    }

    var imageCopy = response.imageCopyURL;
    imageCopy = imageCopy.replace("s3.amazonaws.com/cam51-img-proc", "d2f1mfcynop4j.cloudfront.net");
    //console.log(imageCopy);

    //  this.showEditorView = "block";
    var imageObj = new Image();
    var that = this;
    imageObj.onload = function () {
      that.showimageService.originalImageUrl = imageCopy;//response.originalImageUrl;
      that.maskUrl = response.resultEditMaskImageUrl;

      var strImage = response.resultImageUrl;
      strImage = strImage.replace("s3.amazonaws.com/cam51-img-proc", "d2f1mfcynop4j.cloudfront.net");

      that.showimageService.resultImageUrl = strImage;
      that.sessionId = response.sessionId;
      that.stopLoader();
      that.initViewOnData(that.sessionId);
      that.cdr.detectChanges();

      that.windowRef.nativeWindow.callbackEdit({'inEditMode': true});
    };

    var imageObjMask = new Image();
    imageObjMask.onload = function () {
      imageObj.src = imageCopy;//response.originalImageUrl;
      that.cdr.detectChanges();
    };
    imageObjMask.src = response.resultEditMaskImageUrl;

  }

  initViewOnData(sessionId) {
    this.preversioResponseObj = {};

    if (sessionId == '' && this.showimageService.originalImageUrl.length > 1) {
      sessionId = this.getSession(this.showimageService.originalImageUrl);
    }
    if (sessionId == '') {
      return;
    }

    this.showimageService.resultEditMaskImageUrl = this.maskUrl;
    this.preversioResponseObj.resultEditMaskImageUrl = this.maskUrl;
    this.obj = {
      "originalImageUrl": this.showimageService.originalImageUrl,
      "resultImageUrl": this.showimageService.resultImageUrl,
      "resultEditMaskImageUrl": this.maskUrl,
      "sessionId": sessionId,
      "imageId": "1",
      "customerId": this.showimageService.customerId
    }
    this.srcImageResult = this.defaultSrcImageResult;
    this.applyShadow = this.showimageService.applyShadow;
    this.applyTransparent = this.showimageService.applyTransparent;

    this.showimageService = this.showimageService;
    this.showimageService.obj = this.obj;


    this.getImageDimensions(this.showimageService.originalImageUrl);
    this.stopLoader();
    this.cdr.detectChanges();
    this.windowRef.nativeWindow.callbackEdit({'inEditMode': true});

  }




  onMouseWheelModal(e) {
    if (e.ctrlKey) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
  }

  onMouseWheel(e) {

    //console.log(e.deltaX,e.deltaY);
    //  e.preventDefault();
    //  e.stopImmediatePropagation();
    if (e.deltaY < 0) {

      this.doZoom('in');
    } else {
      this.doZoom('out');
    }

  }

  calculateImageSize() {
    this.totalZoomInitial = -2;
    this.canvasWidth = this.obj.imageSize.width;
    this.canvasHeight = this.obj.imageSize.height;
    //console.log(this.canvasHeight, this.canvasWidth);
    this.obj.origWidth = this.canvasWidth;
    this.obj.origHeight = this.canvasHeight;

    var windowWidth = this.windowRef.nativeWindow.innerWidth;
    var windowHeight = this.windowRef.nativeWindow.innerHeight - this.decreaseInnerHeight;
    //(window.innerHeight -240) * 0.9; // 80 + 50+60+50
    this.imageWrapperMaxHeight = windowHeight;
    //windowWidth = windowWidth.toPrecision(2);
    //    console.log(windowWidth, windowHeight);
    this.imagewrapperSizeWidth = this.obj.origWidth;
    var divide = 0;

    var divideHeight = this.obj.imageSize.height / windowHeight;
    var divideWidth = this.obj.origWidth / windowWidth;

    if ((windowHeight - this.obj.imageSize.height   ) < 0 || (windowWidth - this.obj.origWidth) < 0) {
      if (divideHeight > divideWidth) {
        //  console.log('to heigh');
        //console.log('height is longer',);
        divide = divideHeight;//this.obj.imageSize.height / windowHeight;
      } else {
        divide = divideWidth;//this.obj.origWidth / windowWidth;
        //      console.log('to wide');
      }
    } else {
    }

    //  console.log(divide);

    if (divide > 0) {
      var numIn = 0;


      var a = 1 / divide;
      numIn = (1 - a) / this.AMOUNT_ZOOM;
      //    console.log('divide',divide,a);
      //       numIn = Math.floor(a);
      // divide = this.AMOUNT_ZOOM / numIn;

      divide = 1 - (this.AMOUNT_ZOOM * numIn);
      //     divide = 0.4;

      var newHeight = this.obj.origHeight * divide;
      var newWidth = this.obj.origWidth * divide;

      this.imageSizeWidth = newWidth;

      this.imageSizeHeight = newHeight;

      this.imagewrapperSizeWidth = newWidth;
      this.imagewrapperSizeheight = newHeight;
      //    console.log("newHeight",newHeight);
      //  this.imageWrapperMaxHeight = newHeight;
      this.canvasWidth = newWidth;
      this.canvasHeight = newHeight;
      this.totalZoom = -numIn;
      this.totalScale = divide;

      this.totalZoomInitial = -numIn;
      this.cdr.detectChanges();

      //      console.log('totalZoom',this.totalZoom);
      //if(this.canvasWidth > )
    } else {
      this.imageSizeWidth = this.obj.origWidth;
      this.imageSizeHeight = this.obj.origHeight;
      this.imagewrapperSizeheight = this.obj.origHeight;
      this.imagewrapperSizeWidth = this.obj.origWidth;
      this.totalScale = 1;
    }

    this.totalScale = 1 + (this.AMOUNT_ZOOM * this.totalZoom);
//      console.log("totalScale",this.totalScale);
  }

  undoEdit() {

    if (this.flagShowResult) {
      return;
    }
    this.windowRef.nativeWindow.ga('send', 'event', 'CLIENT', 'undo',"customerId="+this.showimageService.customerId +",sessionId="+this.sessionId);

    var undoDataUrl = this.undoDataUrl;
    if (this.undoEditResponse.length <= 1) {
      console.log("UNDO is empty");
      return;
    }
    var imageMask = this.undoEditResponse[undoDataUrl.length - 2];

    this.undoImageMaskStack.push(imageMask.resultEditMaskImageUrl);

    this.undoDataUrl.pop();
    this.undoEditResponse.pop();
    this.clearCanvas_simple();
    this.showimageService.resultEditMaskImageUrl = imageMask.resultEditMaskImageUrl;
    this.preversioResponseObj = imageMask;
    // this.preversioResponseObj.resultEditMaskImageUrl = imageMask.resultEditMaskImageUrl;
    this.initDrawArrays(null);
    this.redrawSimple();
  }

  setImageToCanvas(image) {
    var context = this.ctx;
    var that = this;
    var imageObj = new Image();
    imageObj.onload = function () {
      context.drawImage(this, 0, 0);
      //console.log("done setImageToCanvas");
      //console.log(that.canvasElement.nativeElement.toDataURL());
    };
    imageObj.src = image;
    this.ctx = context;
  }

  initDrawArrays(editFromPreviousOpenWindow) {

    if (editFromPreviousOpenWindow != null && typeof editFromPreviousOpenWindow === 'object') {
      console.log("get last");

      this.undoDataUrl = editFromPreviousOpenWindow.undoDataUrl;
      this.undoEditResponse = editFromPreviousOpenWindow.undoEditResponse;

      this.initDataUrl = editFromPreviousOpenWindow.undoDataUrl.slice();

      this.preversioResponseObj.resultEditMaskImageUrl = this.showimageService.editedStuff.undoEditResponse[this.showimageService.editedStuff.undoEditResponse.length - 1].resultEditMaskImageUrl;
      //  this.showimageService.lastDataUrl = this.showimageService.editedStuff.undoDataUrl[this.showimageService.editedStuff.undoDataUrl.length - 1];
    } else {


      this.clickColor = [];
      this.clickX_simple = [];
      this.clickY_simple = [];
      this.clickSend = [];
      this.clickDrag_simple = [];
      this.clickLineWidth = [];
      if (this.obj.hasOwnProperty('resultEditMaskImageUrl') == false) {
        this.preversioResponseObj = {};
        this.preversioResponseObj.resultEditMaskImageUrl = this.obj.resultEditMaskImageUrl;
      }
    }
  }

  clickInContainer() {
    if (this.flagFirstTime) {
      this.displayShowInstructions = "none";
    }
  }

  doLongZoomPressDown(type) {
    this.longPress = false;
    var that = this;
    this.windowRef.nativeWindow.ga('send', 'event', 'CLIENT', 'LongZoom'+type ,"customerId="+this.showimageService.customerId +",sessionId="+this.sessionId);

    var repeat = function () {
      that.doZoom(type);
      that.pressTimer = setTimeout(repeat, 50);
    }
    repeat();
  }

  doLongZoomPressUp(type) {
    clearTimeout(this.pressTimer);
  }

  doZoom(type) {

    var AMOUNT_ZOOM = this.AMOUNT_ZOOM;//0.09;
    var multiply = 0;
    var zoomW = 0;
    var zoomH = 0;
    //  console.log("totalZoomInitial", this.totalZoomInitial, this.totalZoom);

    if (this.totalZoomInitial >= this.totalZoom && type == 'out') {
      //alert("no more zoom out");
      return;
    }
    if (35 < this.totalZoom && type == 'in') {
      //alert("no more zoom out");
      return;
    }
    if (this.totalZoom > 0) {
      var t = 1 + (AMOUNT_ZOOM * this.totalZoom);
      this.ctx.scale(-t, -t);
    }
    if (this.totalZoom < 0) {
      var t = 1 - (AMOUNT_ZOOM * this.totalZoom);
      this.ctx.scale(-t, -t);
    }
    //console.log('t', -t);
    if (type == 'in') {
      if (this.totalZoom == 0) {
        this.totalZoom = 1;
      } else {
        this.totalZoom = this.totalZoom + 1;
      }
      var scale = 1 + (AMOUNT_ZOOM * this.totalZoom);
      var zoomW = this.obj.origWidth * scale;
      var zoomH = this.obj.origHeight * scale;
      if (this.totalZoom < 0) {

        var totalZoom = -this.totalZoom;
        scale = 1 - (AMOUNT_ZOOM * totalZoom);

        var zoomW = this.obj.origWidth * scale;
        var zoomH = this.obj.origHeight * scale;
        //      console.log('scale',scale);
      }

      this.ctx.canvas.width = zoomW;
      this.ctx.canvas.height = zoomH;
      this.ctx.scale(scale, scale);

    } else {
      // zoom out

      if (this.totalZoom == 0) {
        this.totalZoom = -1;
      } else {
        this.totalZoom = this.totalZoom - 1;
      }

      var scale = (1 + (AMOUNT_ZOOM * this.totalZoom));

      this.totalScale = scale;
      //console.log(this.totalZoom);
      var zoomW = this.obj.origWidth * scale;
      var zoomH = this.obj.origHeight * scale;

      if (this.totalZoom < 0) {

        var totalZoom = -this.totalZoom;
        scale = 1 - (AMOUNT_ZOOM * totalZoom);
        var zoomW = this.obj.origWidth * scale;
        var zoomH = this.obj.origHeight * scale;
      }
      this.ctx.canvas.width = zoomW;
      this.ctx.canvas.height = zoomH;
      this.ctx.scale(scale, scale);
      //    this.ctx.scale(-0.1,-0.1);
    }

    if (this.totalZoomInitial >= this.totalZoom) {
      this.imagewrapperOverflow = 'hidden';
    } else {
      this.imagewrapperOverflow = "auto";
    }
    this.imagewrapper.nativeElement.scrollLeft = (this.imagewrapper.nativeElement.scrollWidth - this.imagewrapper.nativeElement.clientWidth) / 2

    var yMove = (zoomH - this.imagewrapperSizeheight);
    var xMove = (zoomW - this.imagewrapperSizeWidth);
    this.imagewrapperSizeWidth = zoomW;
    this.imagewrapperSizeheight = zoomH;

    this.imageSizeWidth = zoomW;
    this.imageSizeHeight = zoomH;
    this.redrawSimple();
    this.totalScale = 1 + (this.AMOUNT_ZOOM * this.totalZoom);

    if (this.wrappermarginTop > 0) {
      if (this.wrappermarginTop < (yMove / 2)) {
        this.wrappermarginTop = 0;
      } else {
        this.wrappermarginTop = this.wrappermarginTop - ( yMove / 2);
      }
    }
    if (yMove < 0 && this.windowRef.nativeWindow.innerHeight > this.imagewrapperSizeheight) {
      var x = (this.windowRef.nativeWindow.innerHeight - this.imagewrapperSizeheight);
      //console.log("x",x);
      if (x > this.showimageService.wrappermarginTop) {
        this.wrappermarginTop = this.showimageService.wrappermarginTop;
      }
    }
  }


  resetSize(direction) {
    var zoomH, zoomW;
    //console.log('resetSize totalZoom',this.totalZoom );
    if (this.totalZoom != 0) {
      if (direction == 'down') {
        zoomW = this.obj.origWidth;
        zoomH = this.obj.origHeight;
        this.ctx.canvas.width = zoomW;
        this.ctx.canvas.height = zoomH;

        this.imagewrapperSizeWidth = zoomW;
        this.imagewrapperSizeheight = zoomH;
        //  this.ctx.scale(-scale,-scale);
      } else {

        var scale = (this.AMOUNT_ZOOM * this.totalZoom);
        if (this.totalZoom < 0) {

          var totalZoom = -this.totalZoom;
          scale = 1 - (this.AMOUNT_ZOOM * totalZoom);
          zoomW = this.obj.origWidth * scale;
          zoomH = this.obj.origHeight * scale;
        } else {
          scale = 1 + scale;
          zoomW = this.obj.origWidth * scale;
          zoomH = this.obj.origHeight * scale;
        }
        this.ctx.canvas.width = zoomW;
        this.ctx.canvas.height = zoomH;

        this.imagewrapperSizeWidth = zoomW;
        this.imagewrapperSizeheight = zoomH;
        this.ctx.scale(scale, scale);
      }
    }
    //  console.log('reset',direction,zoomW,zoomH);
    this.imageSizeWidth = zoomW;
    this.imageSizeHeight = zoomH;
    this.redrawSimple();

  }

  getStyleBG() {

    if (this.isGreen == false) {
      return "url(" + this.assetsUrl + "'/assets/tools/background_chosen.png')";
    } else {
      //  this.colorBGElement.nativeElement.classList.add("fgChoosen");
      return "url(" + this.assetsUrl + "'/assets/tools/background_unchosen.png')";
    }
  }

  setBgButtonActive(flag) {
    if (this.colorBGElement == null) {
      return;
    }
    if (flag) {
      this.colorBGElement.nativeElement.classList.remove("bgUnChosen");
      this.colorBGElement.nativeElement.classList.add("bgChosen");
    } else {
      this.colorBGElement.nativeElement.classList.remove("bgChosen");
      this.colorBGElement.nativeElement.classList.add("bgUnChosen");
    }
  }

  setFgButtonActive(flag) {

    if (this.colorFGElement == null) {
      return;
    }
    if (flag) {
      this.colorFGElement.nativeElement.classList.remove("fgUnChosen");
      this.colorFGElement.nativeElement.classList.add("fgChosen");
    } else {
      this.colorFGElement.nativeElement.classList.remove("fgChosen");
      this.colorFGElement.nativeElement.classList.add("fgUnChosen");
    }
  }


  getStyleFG() {
    if (this.isGreen == false) {
      return "url(" + this.assetsUrl + "'/assets/tools/object_unchosen.png')";
    } else {
      return "url(" + this.assetsUrl + "'/assets/tools/object_chosen.png')";
    }
  }

  addClickSimple(x, y, dragging) {
    var totalScale = this.totalScale;

    x = x + 3;
    y = y + 3;

    var radius = 4;
    if (totalScale > 0) {
      x = x / totalScale;
      y = y / totalScale;
      radius = radius / totalScale;
    }
    if (this.totalScale < 0) {
      x = -(x * totalScale);
      y = -(y * totalScale);
      radius = -(radius * totalScale);
    }

    this.clickX_simple.push(x);
    this.clickY_simple.push(y);

    this.clickSend.push(x,y);

    this.clickDrag_simple.push(dragging);
    this.clickColor.push(this.colorChoosen);
    this.clickLineWidth.push(radius);
  }


  redrawSimple(redraw = false) {

    //console.log('in redrawSimple');
    this.clearCanvas_simple();

    this.ctx.lineJoin = "round";
    //  this.ctx.lineCap = 'round';
    //this.ctx.lineWidth = radius;
    if (this.showimageService.lastDataUrl.length > 1) {
      this.setImageToCanvas(this.showimageService.lastDataUrl);
    }

    for (var i = 0; i < this.clickX_simple.length; i++) {
      //console.log("inredraw");
      this.ctx.strokeStyle = this.clickColor[i];
      //      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.lineWidth = this.clickLineWidth[i];
      //  console.log('a');
      this.ctx.beginPath();
      if (this.clickDrag_simple[i] && i) {
        this.ctx.moveTo(this.clickX_simple[i - 1], this.clickY_simple[i - 1]);
      } else {
        this.ctx.moveTo(this.clickX_simple[i] - 1, this.clickY_simple[i]);
      }
      this.ctx.lineTo(this.clickX_simple[i], this.clickY_simple[i]);
      this.ctx.closePath();
      this.ctx.stroke();
    }
  }

  clearCanvas_simple() {
    //console.log('clearCanvas_simple',this.obj.origWidth, this.obj.origHeight);
    this.ctx.clearRect(0, 0, this.obj.origWidth, this.obj.origHeight);
    //  this.ctxTemp.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  onMouseDown(e) {
    if (e.which != 1){
      e.preventDefault();
      return false;
    }
    var mousePos = this.getMousePos(this.canvasElement.nativeElement, e);
    //  console.log(mousePos);
    this.paint_simple = true;

    this.addClickSimple(mousePos.x, mousePos.y, false);
    this.redrawSimple();
  }

  onMouseMove(e) {
    if (this.paint_simple) {
      //  console.log("paint_simple true");
      var mouseX = e.pageX - e.layerX;
      var mouseY = e.pageY - e.layerY;
      var mousePos = this.getMousePos(this.canvasElement.nativeElement, e);
      this.addClickSimple(mousePos.x, mousePos.y, true);
      //			this.addClickSimple(e.layerX, e.layerY, true);
      this.redrawSimple();
    }
  }

  onMouseUp(e) {
    if (e.which != 1){
      e.preventDefault();
      return false;
    }
    this.paint_simple = false;
    //  this.redrawSimple();
    this.preformEditRequest();
  }

  onMouseLeave(e) {
    if (this.paint_simple == true) {
      this.preformEditRequest();
    }
    this.paint_simple = false;
  }

  setColor(chossen) {

    if (chossen == 'colorFG') {
      this.colorChoosen = this.colorFG;
      this.setFgButtonActive(true);
      this.setBgButtonActive(false);
    } else {
      this.setFgButtonActive(false);
      this.setBgButtonActive(true);
      this.colorChoosen = this.colorBG;
    }

    if (this.flagShowResult) {
      this.showResultImage = "none";
      this.maskHidden = false;
      this.windowRef.nativeWindow.callbackEdit({'returnFromShowResult': true});
      if (this.undoButton != null) {
        this.undoButton.nativeElement.classList.remove("undoDisabled");
        this.undoButton.nativeElement.removeAttribute("disabled", "disabled");
      }
      //this.colorBGElement.nativeElement.classList.add("bgUnChosen");
      this.flagShowResult = false;
    }

    this.isGreen = (chossen == 'colorFG') ? true : false;
    this.getStyleFG();
    this.getStyleBG();
    this.colorBGElement.classMap;
  }

  backToEdit() {
    this.windowRef.nativeWindow.callbackEdit({'returnFromShowResult': true});
    this.setColor('colorBG');
  }

  // do matting
  showResult(value) {

    if(value && value.hasOwnProperty("removeShadow")){
      this.applyShadow = !value["removeShadow"];
    }
    if(value && value.hasOwnProperty("applyTransparent")){
      this.applyTransparent = value["applyTransparent"];
      this.showimageService.applyTransparent = this.applyTransparent;
    }

    if (this.flagShowResult) {
      this.backToEdit();
      return false;
    }
    this.windowRef.nativeWindow.ga('send', 'event', 'CLIENT', 'showResult',"customerId="+this.showimageService.customerId +",sessionId="+this.sessionId);

    var dataURL = this.canvasElement.nativeElement.toDataURL();

    this.setFgButtonActive(false);
    this.setBgButtonActive(false);
    if (this.undoButton != null) {
      this.undoButton.nativeElement.classList.add("undoDisabled");
      this.undoButton.nativeElement.setAttribute("disabled", "disabled");
    }

    this.runMatting(false);
    return false;
  }


  runMatting(isSaveRequest) {
    //  console.log(this.showimageService);
    var dataURL = this.canvasElement.nativeElement.toDataURL();
    this.displayLoader = 'block';
    this.startLoader();
    this.requestEditImage.search(dataURL,
      this.obj.originalImageUrl,
      this.obj.imageId,
      this.obj.customerId,
      this.obj.sessionId,
      this.apiProcessUrl,
      this.preversioResponseObj.resultEditMaskImageUrl,
      true,
      this.applyShadow,
      this.showimageService.applyTransparent, isSaveRequest
    ).subscribe(a => this.showResultResponse(a.response, isSaveRequest));
    this.startLoader();
  }

  startLoader() {
    this.windowRef.nativeWindow.callbackEdit({'loader': true});
  }

  stopLoader() {
    this.windowRef.nativeWindow.callbackEdit({'loader': false});
  }

  // after matting
  showResultResponse(ob, isSaveRequest) {
    //  console.log(ob);
    var that = this;
    var image = new Image();
    image.onload = function () {
      that.displayLoader = 'none';
      that.loaderImage = that.assetsUrl + "/assets/tools/smallloader.gif";
      that.stopLoader();
      that.srcImageResult = this.src;
      that.resultImageUrl = this.src;
      that.showResultImage = 'block';
      that.maskHidden = true;
      that.flagShowResult = true;
      that.cdr.detectChanges();

      if (isSaveRequest) {
        that.windowRef.nativeWindow.callbackEdit({'url': that.resultImageUrl});

//        that.openResultWindow();
      } else {
        that.windowRef.nativeWindow.callbackEdit({'callbackInShowResult': true});

      }
    }
    image.src = ob.resultImageUrl;
  }

  preformEditRequest() {
    var dataURL ;

    this.clickSend.unshift(this.ctx.lineWidth);
    if(this.colorChoosen == "rgb(0, 255, 0)"){
      this.clickSend.unshift("GREEN");
    } else {
      this.clickSend.unshift("RED");
    }

    if (this.totalZoom != 0) {
      this.resetSize('down');
      dataURL = this.canvasElement.nativeElement.toDataURL();
      this.resetSize('up');
    } else {
      dataURL = this.canvasElement.nativeElement.toDataURL();
    }
    // dataURL = this.clickSend;
    //console.log(dataURL);
    this.disableShowResult = true;
    this.disableSaveImage = true;
    this.disableUndoButton = true;

    if (this.isGreen == true) {
      this.disableColorBG = true;

    } else {
      this.disableColorFG = true;
    }
    this.displayLoader = 'block';
    this.loaderImage = this.assetsUrl + "/assets/tools/malabiloader.gif";
    this.startLoader();
    var creds = {
      "origImgUrl": this.obj.originalImageUrl,
      "imageId": this.obj.imageId,
      "sessionId": this.obj.sessionId,
      "directResponse": true,
      "customerId": this.obj.customerId,
      "doMatting": false,
      "userInputData" : this.clickSend,
      "previousMaskURL": this.preversioResponseObj.resultEditMaskImageUrl,
      "shadow": this.applyShadow,
      "transparent": this.showimageService.applyTransparent
      // "userInputImageData": dataURL
    };

    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    var credsa = this.param(creds);

    this.dataURL = dataURL;
    this.editRequestSubject.next({a: this.apiProcessUrl, b: credsa, header: headers});

  }


  /*
   * Call back function after edit response;
   */
  showEditResponse(a) {
    //console.log(a);
    this.undoDataUrl.push(this.dataURL);
    this.undoEditResponse.push(a);
    this.undoImageStack.push(this.dataURL);

    this.countEdits++;
    this.displayLoader = 'none';

    this.stopLoader();
    // was stop loader
    this.windowRef.nativeWindow.callbackEdit({'inEditMode': true});
    this.disableShowResult = false;
    this.disableSaveImage = false;
    this.disableUndoButton = false;

    if (this.isGreen == true) {
      this.disableColorBG = false;

    } else {
      this.disableColorFG = false;
    }
    if(a.data){
      this.preversioResponseObj = a;

      this.showimageService.resultEditMaskImageUrl = "data:image/png;base64,"+a.data;
      this.undoImageMaskStack.push(a.resultEditMaskImageUrl);
      this.clearCanvas_simple();
      this.cdr.detectChanges();
    } else {


      if (a.resultEditMaskImageUrl) {
        this.preversioResponseObj = a;
        //document.getElementById('image2Element').src = a.resultEditMaskImageUrl;
        var that = this;
        var imageObjMask = new Image();
        imageObjMask.onload = function () {
          that.showimageService.resultEditMaskImageUrl = a.resultEditMaskImageUrl;
          that.undoImageMaskStack.push(a.resultEditMaskImageUrl);
          that.clearCanvas_simple();
          that.cdr.detectChanges();

        };

        imageObjMask.src = a.resultEditMaskImageUrl;
      }
    }
    this.resetDrawing();
  }

  showInstructions() {
    this.displayShowInstructions = 'block';
  }

  ngAfterViewInit() {
    this.initializeCanvas();
  }

  initializeCanvas(){

    this.ctx = this.canvasElement.nativeElement.getContext("2d");
    this.ctx.scale(this.totalScale, this.totalScale);
    if (this.flagShouldInitizlize == true) {
      var dataURL = this.canvasElement.nativeElement.toDataURL();
      this.undoDataUrl.push(dataURL);
      this.undoEditResponse.push(this.obj);
    }
  }


  ngOnChanges() {
//        console.log("changes",document.getElementById('image1Element').offsetWidth);
  }

  ngOnInit() {
    // we need to detach the change detector initially, to prevent a
    // "changed after checked" error.
    var that = this;
    this.windowRef.nativeWindow.onresize = function () {
      that.cdr.detectChanges();
      //that.cdr.detach();
      //  that.calculateImageSize();
      //  console.log("resize");
      that.redrawSimple();
    };
  }

  beforeDismiss():boolean {
    return true;
  }

  saveImage(value) {
    if(value && value.hasOwnProperty("removeShadow")){
      this.applyShadow = !value["removeShadow"];
    }
    if(value && value.hasOwnProperty("applyTransparent")){
      this.applyTransparent = value["applyTransparent"];
      this.showimageService.applyTransparent = this.applyTransparent;
    }

    this.windowRef.nativeWindow.ga('send', 'event', 'CLIENT', 'saveImage',"customerId="+this.showimageService.customerId +",sessionId="+this.sessionId);
    this.runMatting(true);
    return false;
  }

  param(object) {
    var encodedString = '';
    for (var prop in object) {
      if (object.hasOwnProperty(prop)) {
        if (encodedString.length > 0) {
          encodedString += '&';
        }
        encodedString += encodeURI(prop + '=' + object[prop]);
      }
    }
    return encodedString;
  }

}
