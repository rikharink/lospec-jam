//ADAPTED FROM: https://basarat.gitbook.io/typescript/main-1/typed-event
import { Disposable } from '../interfaces/disposable';
import { Listener } from '../interfaces/listener';

export class EventEmitter<T> {
  private listeners: Listener<T>[] = [];
  private listenersOncer: Listener<T>[] = [];

  public on(listener: Listener<T>): Disposable {
    this.listeners.push(listener);
    return {
      dispose: () => this.off(listener),
    };
  }

  public once(listener: Listener<T>): void {
    this.listenersOncer.push(listener);
  }

  public off(listener: Listener<T>) {
    var callbackIndex = this.listeners.indexOf(listener);
    if (callbackIndex > -1) this.listeners.splice(callbackIndex, 1);
  }

  public emit(event: T) {
    this.listeners.forEach((listener) => listener(event));
    if (this.listenersOncer.length > 0) {
      const toCall = this.listenersOncer;
      this.listenersOncer = [];
      toCall.forEach((listener) => listener(event));
    }
  }

  pipe(te: EventEmitter<T>): Disposable {
    return this.on((e) => te.emit(e));
  }
}
