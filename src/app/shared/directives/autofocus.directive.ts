import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
  standalone: true
})
export class AutofocusDirective implements AfterViewInit {
  constructor(private el: ElementRef<HTMLInputElement | HTMLTextAreaElement>) {}

  ngAfterViewInit(): void {
    // small timeout so it works reliably in many render/animation scenarios
    setTimeout(() => {
      try { this.el.nativeElement.focus(); }
      catch { /* ignore if element not focusable */ }
    }, 20);
  }
}