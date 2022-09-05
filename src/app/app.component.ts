import { AfterViewInit, Component } from '@angular/core';

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
  imgUrl: string;

  constructor(private row: string) {
    const columns = row.split(',');
    this.id = columns[0];
    this.name = columns[1];
    this.type = columns[2];
    this.birthday = columns[3];
    this.imgUrl = columns[4];
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  title = 'ac-amiibo-card-app';
  selected: string = '';
  characters = new Map<string, Character>();

  ngAfterViewInit(): void {
    fetch(
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
          this.characters.set(id, c);
        }
      });
  }
}
