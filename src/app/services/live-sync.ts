import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { Subject } from 'rxjs';

import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
export interface EnrollmentStatusEvent {
  id: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}
@Service()
export class LiveSyncService {
  private platformId = inject(PLATFORM_ID);
  private connection: HubConnection | null = null;
  private eventsSubject = new Subject<EnrollmentStatusEvent>();
  // expose events as an obseravble
  events$ = this.eventsSubject.asObservable();
  // connection state signal for ui status feedback
  connectionState = signal<'connected' | 'reconnecting' | 'disconnected'>('disconnected');
  connect() {
    // guard against duplicate connectons if called more than once
    if (this.connection) {
      console.log('SignalR connection already exists');
      return;
    }

    // SignalR uses WebSocket which only exists in browsers, not on theNode.js server.
    // If SSR is enabled (Extension 1), this method runs during serverrender — skip it.
    if (!isPlatformBrowser(this.platformId)) {
      console.log('No browser- skipping signalr');
      return;
    }
    //  Same hub URL and reconnect strategy you tested in M7 Session 3browser DevTools
    console.log('Creating signal connection ....');
    this.connection = new HubConnectionBuilder()
      .withUrl('/hubs/tms')
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .build();
    // The event name matches the ITmsHubClient method you just addedon the backend.
    // SignalR strongly-typed hubs send the method name as the eventname automatically.
    this.connection.on(
      'ReceiveEnrollmentStatusUpdated',
      (enrollmentId: string, status: 'Pending' | 'Approved' | 'Rejected') => {
        console.log('Signal event rejectes:', enrollmentId, status);
        this.eventsSubject.next({ id: enrollmentId, status });
      },
    );
    this.connection.onreconnecting((error) => {
      console.log('🔄 SignalR reconnecting...', error);
      this.connectionState.set('reconnecting');
    });

    this.connection.onreconnected((connectionId) => {
      console.log('🟢 SignalR reconnected:', connectionId);
      this.connectionState.set('connected');
    });

    this.connection.onclose((error) => {
      console.log('🔴 SignalR closed:', error);
      this.connectionState.set('disconnected');
    });

    this.connection
      .start()
      .then(() => {
        console.log(' SignalR CONNECTED');
        this.connectionState.set('connected');
      })
      .catch((err) => console.error('SignalR connection error:', err));
  }
}
