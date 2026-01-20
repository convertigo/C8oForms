import {
  Directive,
  ElementRef,
  Renderer2,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { clear } from 'console';

@Directive({
  selector: '[throttleEvent]',
  standalone: true,
  exportAs: 'throttleEvent'
})
export class ThrottleEventDirective implements OnInit, OnDestroy {
  @Input() throttleTime = 400; // in milliseconds
  @Input() throttleType = 'click'; // or 'tap', 'submit', etc.

  @Output() throttleEvent = new EventEmitter<Event>();

  private locked = false;
  private removeListener?: () => void;
  private timeoutId?: any;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // On attache dynamiquement l'événement
    this.removeListener = this.renderer.listen(
      this.el.nativeElement,
      this.throttleType,
      (event: Event) => this.handleEvent(event)
    );
  }

  private handleEvent(event: Event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (this.locked) {
      //console.log('[ThrottleEventDirective] prevented from ', this.throttleType);
      return;
    }

    this.locked = true;
    this.throttleEvent.emit(event);
    //console.log('[ThrottleEventDirective] emitted:', this.throttleType);

	if(this.throttleTime != -1){
		this.timeoutId = setTimeout(() => {
	      this.locked = false;
	      //console.log('[ThrottleEventDirective] unlocked after timeout:', this.throttleType);
	    }, this.throttleTime);
	}
  }

  unlock() {
    if(this.locked){
      //console.log('[ThrottleEventDirective] unlocked after action:', this.throttleType);
      clearTimeout(this.timeoutId);
      this.locked = false;
    }
  }

  ngOnDestroy() {
    if (this.removeListener) {
      this.removeListener();
    }
  }
}
