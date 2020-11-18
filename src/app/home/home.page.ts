import { Component } from '@angular/core';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  public depends = true;
  public viewCount = 0;
  public daily = {
    todayCases: 0,
    active: 50646,
    critical: 3657
  };
  public showDaily = false;
  public currentFormatedDate = DateTime.local().setLocale('tr').toLocaleString(DateTime.DATE_FULL);
  public result: { header: 'Çıkamazsın!' | 'Çıkabilirsin!'; reason: string; canGoOut: boolean } = {
    header: 'Çıkamazsın!',
    reason: '',
    canGoOut: false
  };
  public ageGroup = 'adult';
  public works = 'yes';
  constructor() {}

  ionViewWillEnter() {
    this.calculate();
    this.fetchData();
    this.fetchViewCount();
  }

  calculate() {
    const dt = DateTime.local();
    const h20 = dt.set({ hour: 20, minute: 0 });
    const h10 = dt.set({ hour: 10, minute: 0 });
    const isWeekend = dt.weekday > 5;

    // weekend general
    if (isWeekend && (dt < h10 || dt > h20)) {
      this.depends = false;
      this.result = {
        header: 'Çıkamazsın!',
        reason: dt < h10 ? "Saat 10'dan önce." : "Saat 20'dan sonra.",
        canGoOut: false
      };
      return;
    }

    // Working
    if (!isWeekend && this.works === 'yes') {
      this.result = {
        header: 'Çıkabilirsin!',
        reason: 'Çalışanlar çıkabilir.',
        canGoOut: true
      };
      return;
    }

    this.calculateByAge(dt, h10);
  }

  calculateByAge(dt: DateTime, h10: DateTime) {
    const h16 = dt.set({ hour: 16, minute: 0 });
    if (this.ageGroup === 'adult') {
      this.result = {
        header: 'Çıkabilirsin!',
        reason: 'Yaş grubundan dolayı çıkabilirsin.',
        canGoOut: true
      };
    } else if (dt > h16 || dt < h10) {
      this.result = {
        header: 'Çıkamazsın!',
        reason: dt < h10 ? "Saat 10'dan önce." : "Saat 16'dan sonra.",
        canGoOut: false
      };
    } else {
      this.result = {
        header: 'Çıkabilirsin!',
        reason: 'Yaş grubun bu saatte çıkabilir, dikkatlı olmanı tavsiye ediyoruz!',
        canGoOut: true
      };
    }
  }

  fetchData() {
    fetch('https://coronavirus-19-api.herokuapp.com/countries/turkey')
      .then(response => response.json())
      .then(data => {
        this.daily = {
          todayCases: data.todayCases,
          active: data.active,
          critical: data.critical
        };
        this.showDaily = true;
      })
      .catch(e => console.log(e));
  }

  fetchViewCount() {
    fetch('https://api.countapi.xyz/hit/cikabilirmiyim/visits')
      .then(response => response.json())
      .then(data => {
        this.viewCount = data.value;
      })
      .catch(e => console.log(e));
  }
}
