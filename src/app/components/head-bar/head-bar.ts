import { AfterViewInit, Component, OnDestroy, input, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-head-bar',
  styleUrl: './head-bar.css',
  templateUrl: './head-bar.html',
})
export class HeadBar implements AfterViewInit, OnDestroy {
  carCount = input(0);
  brandCount = input(0);
  minPrice = input(0);

  readonly stats = signal({ cars: 0, brands: 0, from: 0 });
  private raf = 0;

  ngAfterViewInit() {
    const to = { cars: this.carCount(), brands: this.brandCount(), from: this.minPrice() };
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      this.stats.set(to);
      return;
    }
    const start = performance.now();
    const duration = 1100;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      this.stats.set({
        cars: Math.round(to.cars * e),
        brands: Math.round(to.brands * e),
        from: Math.round(to.from * e),
      });
      if (p < 1) this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.raf);
  }
}
