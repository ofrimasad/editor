import {Injectable} from "@angular/core";

@Injectable()
export class ShowimageService{

  img1:string = "";
  img2:string = "";
  lastDataUrl:string = "";
  native ;
  obj;
  originalImageUrl:string;
  resultImageUrl:string;
  imageSizeWidth;
  imageSizeHeight;
  customerId:number;
  apiUrl:string;
  applyShadow:boolean = true;
  applyTransparent:boolean = false;
  editedStuff;
  resultEditMaskImageUrl:any;
  resultUrl:string;
  showimageService:boolean;
  trackId:string;
  wrapperShadow:string;
  wrappermarginTop:number;

}
