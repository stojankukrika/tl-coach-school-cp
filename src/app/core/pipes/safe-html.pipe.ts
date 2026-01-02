import {inject, Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {HttpService} from "../services/http.service";

@Pipe({
  name: 'safeHtml',
})
export class SafeHtmlPipe implements PipeTransform {

  private readonly sanitizer = inject(DomSanitizer);
  constructor(){}

  transform(html:any) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

}
