import { AfterViewInit, Component, OnInit } from '@angular/core';

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
    const base64ColumnOffset = Number.parseInt(columns[7]);
    if (base64ColumnOffset && base64ColumnOffset !== NaN) {
      this.imgUrl = this.createBase64Source(columns, base64ColumnOffset);
    } else if (columns[4]) {
      this.imgUrl = columns[4];
    }
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
export class AppComponent implements OnInit {
  title = 'ac-amiibo-card-app';
  selected: string = '';
  characters = new Map<string, Character>();
  idsSorted: string[] = [];

  public ngOnInit(): void {
    fetch(
      //'https://docs.google.com/spreadsheets/d/e/2PACX-1vTaNwbk3ge14yq_8jXzLIuQ-kTL1KHCLjujI7bYourD4qXJGM7p502RX_ltrWVIaAKoVJtCELwQAuB5/pub?output=csv',
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkbDvXTEDxtMrbHaLw0_SpO4zWskaL6lX_WkhTfwmZ_cifkTuPQwZkacJwSOO5i1geS6RMOYOW_4aq/pub?output=csv',
      {
        method: 'GET',
      }
    )
      .then((response) => response.text())
      .then((body) => {
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
      });
  }

  // public padSelectLabel(label: string) {
  //   const n = 30 - label.length;
  //   for (let i = 0; i < n; i++) label = label + '&nbsp;';
  //   return label;
  // }

  // getNumberOfCards(): [number, number] {
  //   return [this.characters.keys().length, this.characters.values().filter(i => i.owned )]
  // }
}
