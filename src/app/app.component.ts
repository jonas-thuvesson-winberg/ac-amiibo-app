import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { RxJSHttpClient } from 'rxjs-http-client';
interface Character2 {
  id: string;
  name: string;
  type: string;
  birthday: string;
  imgUrl?: string;
}

class Character {
  id: string;
  name: string;
  type: string;
  birthday: string;
  imgUrl: string | undefined;
  orientation: string;
  owned: boolean;

  constructor(private row: string) {
    const columns = row.split(',');
    this.id = columns[0];
    this.name = columns[1];
    this.type = columns[2];
    this.birthday = columns[3];
    this.orientation = columns[5];
    this.owned = columns[6].toLowerCase().trim() === 'true';
    this.imgUrl = `${
      window.location.protocol +
      '//' +
      window.location.host +
      window.location.pathname
    }assets/cards/${this.id}-${this.name}.png`;
  }

  private createBase64Source(columns: string[], offset: number): string {
    const mime = columns[offset++];
    let tempBase64 = `data:${mime};base64, `;
    while (true) {
      if (offset > columns.length - 1) break;
      const part = columns[offset++]?.trim();
      if (part && part.length > 0) {
        tempBase64 += part;
      } else {
        break;
      }
    }
    return tempBase64;
  }

  hasEssentialProperties(): boolean {
    return !!this.id && !!this.name;
  }

  asObject(): object {
    return { ...this };
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ac-amiibo-card-app';
  selected: string = '';
  characters = new Map<string, Character>();
  idsSorted: string[] = [];
  subscriptionCutter$ = new Subject<void>();
  httpClient: RxJSHttpClient | undefined;
  dataSub: Subscription | undefined;

  ngOnDestroy(): void {
    this.subscriptionCutter$.next();
    this.subscriptionCutter$.unsubscribe();
    this.dataSub?.unsubscribe();
  }

  public ngOnInit(): void {
    console.log(decodeURI(window.location.search));

    let target: string;
    if (window.location.search) {
      target = window.location.search.split('=')[1];
    }

    this.httpClient = new RxJSHttpClient();
    this.dataSub = this.httpClient
      .get(
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkbDvXTEDxtMrbHaLw0_SpO4zWskaL6lX_WkhTfwmZ_cifkTuPQwZkacJwSOO5i1geS6RMOYOW_4aq/pub?output=csv'
      )
      .pipe(
        switchMap((res) => res.text()),
        takeUntil(this.subscriptionCutter$)
      )
      .subscribe((body) => {
        const rows = body.split('\n');
        for (let i = 1; i < rows.length; i++) {
          const id = rows[i].split(',')[0];
          const c = new Character(rows[i]);
          if (c.hasEssentialProperties()) this.characters.set(id, c);
        }

        this.idsSorted = Array.from(this.characters.keys());
        this.idsSorted.sort((a, b) => {
          a = a.toLowerCase();
          b = b.toLowerCase();

          if (a.indexOf('s') != -1 && b.indexOf('s') === -1) return -1;
          else if (b.indexOf('s') != -1 && a.indexOf('s') === -1) return 1;
          else if (a.indexOf('s') != -1 && b.indexOf('s') != -1) {
            a = a.substring(1);
            b = b.substring(1);
          }

          if (a.length > b.length) return 1;
          else if (b.length > a.length) return -1;

          const aAsNum = Number.parseInt(a);
          const bAsNum = Number.parseInt(b);

          if (aAsNum > bAsNum) return 1;
          else if (bAsNum > aAsNum) return -1;
          else return 0;
        });

        if (target) {
          this.selected = target.split('-')[0];
        }
      });
  }

  handleSelect(event: any) {
    console.log(event);
    window.history.pushState(
      undefined,
      '',
      `?char=${event.value}-${this.characters.get(event.value)!.name}`
    );
  }
}
