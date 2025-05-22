import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Importació dels components de l'aplicació
import { HomeComponent } from './components/public-home/home.component';
import { PrivateHomeComponent } from './components/private-home/private-home.component';
import { CookiesInfoComponent } from './components/cookies-info/cookies-info.component';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MyProfileComponent } from './components/my-profile/my-profile.component';

import { MyExchangesComponent } from './components/my-exchanges/my-exchanges.component';
import { NotificationsComponent } from './components/notifications/notifications.component';

import { NewObjectComponent } from './components/new-object/new-object.component';
import { DetailObjectComponent } from './components/detail-object/detail-object.component';
import { ExchangeCreateComponent } from './components/exchange-create/exchange-create.component';

import { RedirectComponent } from './components/redirect/redirect.component';
// Guards per controlar l'accés a determinades rutes
import { authGuard } from './auth.guard';
import { CookieConsentGuard } from './guards/cookie-consent.guard';

export const routes: Routes = [
    // Ruta per la pàgina d'inici pública
    { path: '', component: HomeComponent },
    // Ruta per la pàgina de login, només accessible si l'usuari ha acceptat les cookies
    { path: 'login', component: LoginComponent, canActivate:[CookieConsentGuard] },
    // Ruta per la pàgina de registre, només accessible si l'usuari ha acceptat les cookies
    { path: 'register', component: RegisterComponent, canActivate:[CookieConsentGuard] },
    // Ruta per la pàgina d'informació sobre les cookies
    { path: 'cookies-info', component:CookiesInfoComponent},
    {
    // Ruta per les seccions privades de l'aplicació, protegides pel 'authGuard'
        path: 'app',
        canActivate: [authGuard],  // Només accessible si l'usuari està autenticat
        children: [
            // Ruta per la pàgina d'inici privada
            { path: '', component: PrivateHomeComponent },
            // Ruta per crear un nou objecte
            { path: 'new-object', component: NewObjectComponent },
            // Ruta per veure les intercanvis de l'usuari
            { path: 'my-exchanges', component: MyExchangesComponent },
            // Ruta per veure les notificacions de l'usuari
            { path: 'notifications', component: NotificationsComponent },
            // Ruta per veure o editar el perfil de l'usuari
            { path: 'my-profile', component: MyProfileComponent },
            // Ruta per crear un nou intercanvi
            { path: 'exchange', component: ExchangeCreateComponent},    
            // Ruta per editar un objecte
            { path: 'new-object/:id', component: NewObjectComponent },
            // Ruta per veure el detall d'un objecte en concret
            { path: 'item-detail/:id', component: DetailObjectComponent},
        ]
    },
    // Ruta per manejar qualsevol ruta no definida, redirigeix a una pàgina especial
    { path: '**', component: RedirectComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }