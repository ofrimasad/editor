import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { Angulartics2Module } from 'angulartics2';
import {WindowRef} from "./WindowRef";

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    Angulartics2Module.forChild()
  ],
  providers: [WindowRef],
  bootstrap: [AppComponent]
})
export class AppModule { }
