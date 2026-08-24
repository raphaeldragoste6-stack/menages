//POUR ACTIVER LES REQUETES VERS RENDER





import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
   
    provideHttpClient()
  ]
};
