import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { Subject } from 'rxjs';

import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { AuthService } from './auth.service';
export interface EnrollmentStatusEvent {
  id: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}
@Service()
export class LiveSyncService {
  private platformId = inject(PLATFORM_ID);
  private connection: HubConnection | null = null;
  private authService = inject(AuthService)
  private eventsSubject = new Subject<EnrollmentStatusEvent>();
  // expose events as an obseravble
  events$ = this.eventsSubject.asObservable();
  // connection state signal for ui status feedback
  connectionState = signal<'connected' | 'reconnecting' | 'disconnected'>('disconnected');
  connect() {
  if (this.connection) {
    console.log('SignalR connection already exists');
    return;
  }

  if (!isPlatformBrowser(this.platformId)) {
    console.log('No browser - skipping SignalR');
    return;
  }

  console.log('Creating SignalR connection...');
  this.connection = new HubConnectionBuilder()
    .withUrl('/hubs/tms', {  // use relative URL with proxy
      accessTokenFactory: () => this.authService.getAccessToken() ?? ''
    })
    .withAutomaticReconnect([0, 2000, 10000, 30000])
    .build();

  this.connection.on('ReceiveEnrollmentStatusUpdated', (enrollmentId, status) => {
    console.log('Signal event received:', enrollmentId, status);
    this.eventsSubject.next({ id: enrollmentId, status });
  });

  this.connection.onreconnecting((error) => {
    console.log('🔄 SignalR reconnecting...', error);
    this.connectionState.set('reconnecting');
  });

  this.connection.onreconnected((connectionId) => {
    console.log('SignalR reconnected:', connectionId);
    this.connectionState.set('connected');
  });

  this.connection.onclose((error) => {
    console.log('SignalR closed:', error);
    this.connectionState.set('disconnected');
  });

  this.connection
    .start()
    .then(() => {
      console.log('✅ SignalR CONNECTED');
      this.connectionState.set('connected');
    })
    .catch((err) => {
      console.error('SignalR connection error:', err);
      this.connectionState.set('disconnected');
    });
}
}
