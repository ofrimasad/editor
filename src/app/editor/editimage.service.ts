import {Injectable} from '@angular/core';
import { URLSearchParams} from '@angular/http';
import {Http, Response, Headers} from '@angular/http';


@Injectable()
export class RequestEditImage {

  constructor(private http: Http) {}

  search (term, origImgUrl:string, imageId:string, customerId, sessionId, apiUrl, maskUrl, doMatting = false, shadow = true, transparent, saveResult = false) {

    //let wikiUrl = 'http://cam51-lb-1440631109.us-east-1.elb.amazonaws.com/Camera51Server/processImage';

    let wikiUrl = apiUrl;//'http://10.0.0.110:8080/Camera51Server/processImage';

    //console.log('term',term);

    var headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      //headers.append('Content-Type', 'application/json');

    //  headers.append("Content-Type", 'application/xml');
    //  headers.append("Content-Type", 'charset-utf-8');

//var x= term.replace(/^data:image\/(png|jpg);base64,/, "");
var creds = {"origImgUrl": origImgUrl,
  "imageId": imageId,
  "sessionId": sessionId,
  "saveResult": saveResult,
  "customerId": customerId,
  "doMatting": doMatting,
  "previousMaskUrl": maskUrl,
  "shadow": shadow,
  "transparent" : transparent,
  "userInputImageData": term
};

var  credsa = this.param(creds);

 //var a = new AA('aa=3434');
 //creds = JSON.stringify(send);
    /*data: {"origImgUrl": imageUrl,
      "imageId": imageId,
      "": sessionId,
      "userInputImageData": userImgData,
      "customerId": customerId
    }
    */
  //  params.set('callback', 'JSONP_CALLBACK');

    // TODO: Add error handling
    return this.http.post(wikiUrl,  credsa,{ headers: headers})
               .map(res => res.json());
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
