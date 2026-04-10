import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AllocationRequest, CustomBotConfig, TradeLog, TradingAgent } from '../models/trade.model';

@Injectable({ providedIn: 'root' })
export class TradingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getLeaderboard(sortBy?: string): Observable<TradingAgent[]> {
    return this.http.get<TradingAgent[]>(`${this.apiUrl}/trading/leaderboard`, {
      params: sortBy ? { sort: sortBy } : {}
    });
  }

  allocate(request: AllocationRequest): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/trading/allocate`, request);
  }

  getTradeLog(agentTokenId: number): Observable<TradeLog[]> {
    return this.http.get<TradeLog[]>(`${this.apiUrl}/trading/${agentTokenId}/trades`);
  }

  getPnLData(agentTokenId: number, period: string): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/trading/${agentTokenId}/pnl`, {
      params: { period }
    });
  }

  createCustomBot(config: CustomBotConfig): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/trading/custom/create`, config);
  }

  getTrainingProgress(trainingId: string): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/trading/custom/training/${trainingId}`);
  }

  getMyAllocations(ownerAddress: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.apiUrl}/trading/allocations/${ownerAddress}`);
  }
}
