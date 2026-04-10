import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AgentConfig, ForgeRequest, ForgeResponse } from '../models/agent.model';

@Injectable({ providedIn: 'root' })
export class AgentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  forgeAgent(request: ForgeRequest): Observable<ForgeResponse> {
    return this.http.post<ForgeResponse>(`${this.apiUrl}/agents/forge`, request);
  }

  previewForge(request: ForgeRequest): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/agents/forge/preview`, request);
  }

  getAgent(tokenId: number): Observable<AgentConfig> {
    return this.http.get<AgentConfig>(`${this.apiUrl}/agents/${tokenId}`);
  }

  getMyAgents(ownerAddress: string): Observable<AgentConfig[]> {
    return this.http.get<AgentConfig[]>(`${this.apiUrl}/agents/owner/${ownerAddress}`);
  }

  getAgentMemory(tokenId: number): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.apiUrl}/agents/${tokenId}/memory`);
  }

  getEvolutionHistory(tokenId: number): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.apiUrl}/agents/${tokenId}/evolution`);
  }

  getContentSpecializations(): string[] {
    return [
      'cyberpunk_image_gen',
      'anime_art',
      'photorealistic_portraits',
      'abstract_art',
      'cinematic_video',
      'lofi_aesthetic',
      'seo_blog_writer',
      'social_media_content',
      'technical_writer',
      'creative_fiction'
    ];
  }

  getTradingSpecializations(): string[] {
    return [
      'momentum_trader',
      'mean_reversion',
      'trend_following',
      'scalping',
      'swing_trader',
      'options_strategy',
      'futures_strategy'
    ];
  }
}
