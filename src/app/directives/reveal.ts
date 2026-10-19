import { AfterViewInit, Directive, ElementRef, OnDestroy, inject } from '@angular/core';

/** Fades an element in the first time it scrolls into view. */
@Directive({ selector: '[appReveal]', host: { class: 'reveal' } })
export class Reveal implements AfterViewInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private io?: IntersectionObserver;

  ngAfterViewInit() {
    if (typeof IntersectionObserver === 'undefined') {
      this.el.classList.add('in');
      return;
    }
    this.io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.el.classList.add('in');
          this.io?.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    this.io.observe(this.el);
  }

  ngOnDestroy() {
    this.io?.disconnect();
  }
}
