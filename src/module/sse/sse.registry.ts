import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class SseRegistry {
  private readonly connections: Map<string, Set<Subject<MessageEvent>>> =
    new Map();

  register(userId: string, subject: Subject<MessageEvent>) {
    const set =
      this.connections.get(userId) ?? new Set<Subject<MessageEvent>>();
    set.add(subject);
    this.connections.set(userId, set);
  }

  unregister(userId: string, subject: Subject<MessageEvent>) {
    const set = this.connections.get(userId);
    if (!set) return;
    set.delete(subject);
    if (set.size === 0) this.connections.delete(userId);
  }

  emitTo(userId: string, payload: any, event?: string) {
    const set = this.connections.get(userId);
    if (!set) return;
    const msg: MessageEvent = { data: JSON.stringify(payload) } as any;
    if (event) {
      (msg as any).type = event;
      // keep legacy field for safety (some clients might look for it)
      (msg as any).event = event;
    }
    set.forEach((s) => s.next(msg));
  }

  broadcast(payload: any, event?: string) {
    const msg: MessageEvent = { data: JSON.stringify(payload) } as any;
    if (event) {
      (msg as any).type = event;
      (msg as any).event = event;
    }
    this.connections.forEach((set) => {
      set.forEach((s) => s.next(msg));
    });
  }
}
