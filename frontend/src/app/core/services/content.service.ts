import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContentNft, GenerationRequest, GenerationResponse } from '../models/content.model';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  generate(request: GenerationRequest): Observable<GenerationResponse> {
    return this.http.post<GenerationResponse>(`${this.apiUrl}/content/generate`, request);
  }

  getAgentContent(agentId: number): Observable<ContentNft[]> {
    return this.http.get<ContentNft[]>(`${this.apiUrl}/content/agent/${agentId}`);
  }

  getMarketplaceContent(filters?: Record<string, string>): Observable<ContentNft[]> {
    return this.http.get<ContentNft[]>(`${this.apiUrl}/content/marketplace`, {
      params: filters
    });
  }

  buyContent(contentTokenId: number): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/content/buy/${contentTokenId}`, {});
  }

  tipContent(contentTokenId: number, amount: number): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/content/tip/${contentTokenId}`, { amount });
  }
}
