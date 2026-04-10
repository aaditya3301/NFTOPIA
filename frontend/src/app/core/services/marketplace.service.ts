import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AgentListing, PlatformStats, RentalListingRequest } from '../models/marketplace.model';
import { ContentNft } from '../models/content.model';

@Injectable({ providedIn: 'root' })
export class MarketplaceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getContent(filters?: Record<string, string>): Observable<ContentNft[]> {
    return this.http.get<ContentNft[]>(`${this.apiUrl}/marketplace/content`, {
      params: filters
    });
  }

  getAgents(filters?: Record<string, string>): Observable<AgentListing[]> {
    return this.http.get<AgentListing[]>(`${this.apiUrl}/marketplace/agents`, {
      params: filters
    });
  }

  getPlatformStats(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(`${this.apiUrl}/stats/platform`);
  }

  listForRent(payload: RentalListingRequest): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/rental/list`, payload);
  }

  getActiveRentals(ownerAddress: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.apiUrl}/rental/active/${ownerAddress}`);
  }
}
