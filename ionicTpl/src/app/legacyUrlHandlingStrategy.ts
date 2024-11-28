import { Injectable } from '@angular/core';
import { UrlHandlingStrategy, UrlTree, DefaultUrlSerializer } from '@angular/router';
import { Location } from '@angular/common';

@Injectable()
export class LegacyUrlHandlingStrategy implements UrlHandlingStrategy {
  private defaultUrlSerializer = new DefaultUrlSerializer();

  constructor(private location: Location) {}

  shouldProcessUrl(url: UrlTree): boolean {
    return true; // Traiter tous les URL
  }

  extract(url: UrlTree): UrlTree {
    const urlWithHash = this.getUrlWithoutHash(url);

    // Nettoyer l'URL si nécessaire
    if (url.toString().includes('#')) {
      setTimeout(() => {
        // Utiliser Location pour remplacer l'état de l'URL sans recharger la page
        this.location.replaceState(urlWithHash);
      }, 0);
    }

    return this.defaultUrlSerializer.parse(urlWithHash);
  }

  merge(newUrlPart: UrlTree, rawUrl: UrlTree): UrlTree {
    return newUrlPart;
  }

  private getUrlWithoutHash(url: UrlTree): string {
    const path = url.toString();
    const hashIndex = path.indexOf('#');
    if (hashIndex !== -1) {
      const newPath = path.substring(hashIndex + 1);
      // S'assurer que le chemin commence par '/'
      return newPath.startsWith('/') ? newPath : '/' + newPath;
    }
    return path;
  }
}

