import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ContentNft, GenerationRequest, GenerationResponse } from '../models/content.model';

interface BackendGenerationResponse {
  content_id: string;
  content_url: string;
  content_type: string;
  agent_token_id: number;
  prompt: string;
  metadata_uri?: string;
  content_nft_token_id?: number | null;
  tx_hash?: string;
}

interface BackendContentNft {
  content_id?: string;
  content_nft_token_id?: number | null;
  content_url: string;
  content_type: string;
  agent_token_id: number;
  creator_address: string;
  price_forge: number;
  popularity_score: number;
  views: number;
  purchases: number;
  tips_received: number;
  created_at: string;
}

interface BackendMintResponse {
  content_id: string;
  content_nft_token_id: number;
  price_forge: number;
  tx_hash: string;
}

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private mapGenerationResponse(item: BackendGenerationResponse): GenerationResponse {
    return {
      contentId: item.content_id,
      contentUrl: item.content_url,
      contentNftTokenId: item.content_nft_token_id ?? 0,
      agentId: item.agent_token_id,
      prompt: item.prompt,
      contentType: item.content_type,
      metadataURI: item.metadata_uri ?? '',
      txHash: item.tx_hash ?? ''
    };
  }

  private mapContent(item: BackendContentNft): ContentNft {
    return {
      tokenId: item.content_nft_token_id ?? 0,
      contentUrl: item.content_url,
      contentType: item.content_type,
      creatorAgent: item.agent_token_id,
      creatorOwner: item.creator_address,
      price: item.price_forge,
      popularityScore: item.popularity_score,
      views: item.views,
      purchases: item.purchases,
      tips: item.tips_received,
      createdAt: item.created_at,
      contentId: item.content_id ?? ''
    };
  }

  generate(request: GenerationRequest): Observable<GenerationResponse> {
    return this.http
      .post<BackendGenerationResponse>(`${this.apiUrl}/content/generate`, {
        agent_id: request.agentId,
        prompt: request.prompt,
        content_type: request.contentType
      })
      .pipe(map((item) => this.mapGenerationResponse(item)));
  }

  getAgentContent(agentId: number): Observable<ContentNft[]> {
    return this.http
      .get<BackendContentNft[]>(`${this.apiUrl}/content/agent/${agentId}`)
      .pipe(map((items) => items.map((item) => this.mapContent(item))));
  }

  getMarketplaceContent(filters?: Record<string, string>): Observable<ContentNft[]> {
    return this.http
      .get<BackendContentNft[]>(`${this.apiUrl}/content/marketplace`, {
        params: filters
      })
      .pipe(map((items) => items.map((item) => this.mapContent(item))));
  }

  buyContent(contentId: string): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/marketplace/content/buy`, { content_id: contentId });
  }

  tipContent(contentId: string, amount: number): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/marketplace/content/tip`, {
      content_id: contentId,
      amount_forge: amount
    });
  }

  mintContent(contentId: string, priceForge: number): Observable<{ contentNftTokenId: number; txHash: string }> {
    return this.http
      .post<BackendMintResponse>(`${this.apiUrl}/content/mint/${contentId}`, { price_forge: priceForge })
      .pipe(
        map((res) => ({
          contentNftTokenId: res.content_nft_token_id,
          txHash: res.tx_hash
        }))
      );
  }
}
