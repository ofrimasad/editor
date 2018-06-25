import {Injectable} from '@angular/core';
import { URLSearchParams} from '@angular/http';
import {Http, Response, Headers} from '@angular/http';


@Injectable()
export class RequestEditImage {

  constructor(private http: Http) {}

  search (imageId:number, imageSecret:string, apiId:string, apiUrl, maskName, shadow, transparent, saveResult) {
    
    let url = apiUrl + imageId + "/settings";//'http://10.0.0.110:8080/Camera51Server/processImage';
    
    var headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('secret', imageSecret);
      headers.append('x-api-id', apiId);
    
    var background = (transparent ? "transparent" : "white");
    var shadowName = (shadow ? "drop" : "none");

    var body = {
      "save": saveResult,
      "mask_name": maskName,
      "settings": {
        "background" : background,
        "shadow" : shadowName,
      }
    };
    
    var bodyString = JSON.stringify(body);

    // TODO: Add error handling
    return this.http.put(url,  bodyString,{ headers: headers})
               .map(res => res.json());
  }
  
}
