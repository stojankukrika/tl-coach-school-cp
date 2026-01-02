import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader  } from '@ngx-translate/http-loader';
import { AppRoutingModule } from './app-routing.module';
import { QuillModule } from 'ngx-quill';
import { APP_CONFIG, BaseAppConfig } from './core/config/app.config';
import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { customAnimation } from './core/config/nav.animation';
import { authInterceptor } from './core/interceptors/auth.interceptor';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        IonicModule.forRoot({navAnimation:customAnimation, mode:'md'}),
        AppRoutingModule,
        QuillModule.forRoot({
          modules: {
            toolbar: [
              ['bold', 'italic', 'underline'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'script': 'sub'}, { 'script': 'super' }],
              ['link', 'image']
            ]
          }
        })
    ],
    providers: [
        { provide: APP_CONFIG, useValue: BaseAppConfig },
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideTranslateService({
        loader: provideTranslateHttpLoader({ prefix: 'assets/i18n/', suffix: '.json' }),
    }),
    provideHttpClient(withInterceptors([authInterceptor]))
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

