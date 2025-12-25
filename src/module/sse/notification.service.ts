import { Injectable } from '@nestjs/common';
import { SseRegistry } from './sse.registry';
import { finalize, Observable, Subject } from 'rxjs';

@Injectable()
export class NotificationService {
  constructor(private readonly registry: SseRegistry) {}

  createClientStream(userId: string): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>();
    this.registry.register(userId, subject);

    return subject.asObservable().pipe(
      finalize(() => {
        this.registry.unregister(userId, subject);
        subject.complete();
      }),
    );
  }

  sendTo(userId: string, payload: any, event?: string) {
    this.registry.emitTo(userId, payload, event);
  }

  broadcast(payload: any, event?: string) {
    this.registry.broadcast(payload, event);
  }
}
