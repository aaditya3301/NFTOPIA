import { Injectable, computed, signal } from '@angular/core';
import { ethers } from 'ethers';
import { environment } from '../../../environments/environment';

interface ChainConfig {
  chainId: string;
  chainName: string;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

@Injectable({ providedIn: 'root' })
export class Web3Service {
  private readonly _walletAddress = signal<string | null>(null);
  private readonly _isConnected = signal(false);
  private readonly _chainId = signal<number | null>(null);
  private readonly _provider = signal<ethers.BrowserProvider | null>(null);
  private readonly _signer = signal<ethers.Signer | null>(null);

  readonly walletAddress = this._walletAddress.asReadonly();
  readonly isConnected = this._isConnected.asReadonly();
  readonly chainId = this._chainId.asReadonly();

  readonly shortAddress = computed(() => {
    const addr = this._walletAddress();
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  });

  readonly isCorrectChain = computed(() => this._chainId() === environment.helaChainId);

  private readonly contractAddresses = {
    agentNFT: environment.contracts.agentNFT,
    forgeToken: environment.contracts.forgeToken,
    erc6551Registry: environment.contracts.erc6551Registry,
    jobEscrow: environment.contracts.jobEscrow,
    rentalMarket: environment.contracts.rentalMarket
  };

  private readonly helaConfig: ChainConfig = {
    chainId: '0xA2D08',
    chainName: 'HeLa Testnet',
    rpcUrls: [environment.helaRpcUrl],
    blockExplorerUrls: [environment.helaExplorerUrl],
    nativeCurrency: { name: 'HLUSD', symbol: 'HLUSD', decimals: 18 }
  };

  async connectWallet(): Promise<string> {
    const eth = (window as Window & { ethereum?: { request: (args: unknown) => Promise<unknown>; on: (event: string, callback: (...args: unknown[]) => void) => void } }).ethereum;

    if (!eth) {
      throw new Error('MetaMask not installed');
    }

    const provider = new ethers.BrowserProvider(eth as ethers.Eip1193Provider);
    const accounts = (await provider.send('eth_requestAccounts', [])) as string[];
    const signer = await provider.getSigner();
    const network = await provider.getNetwork();

    this._provider.set(provider);
    this._signer.set(signer);
    this._walletAddress.set(accounts[0]);
    this._chainId.set(Number(network.chainId));
    this._isConnected.set(true);

    if (Number(network.chainId) !== environment.helaChainId) {
      await this.switchToHela();
    }

    eth.on('accountsChanged', (changedAccounts: unknown) => {
      const nextAccounts = changedAccounts as string[];
      this._walletAddress.set(nextAccounts[0] || null);
      this._isConnected.set(nextAccounts.length > 0);
    });

    eth.on('chainChanged', (newChainId: unknown) => {
      this._chainId.set(parseInt(newChainId as string, 16));
    });

    return accounts[0];
  }

  async switchToHela(): Promise<void> {
    const eth = (window as Window & { ethereum?: { request: (args: unknown) => Promise<unknown> } }).ethereum;

    if (!eth) {
      throw new Error('MetaMask not installed');
    }

    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: this.helaConfig.chainId }]
      });
    } catch (error) {
      const unknownError = error as { code?: number };
      if (unknownError.code === 4902) {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [this.helaConfig]
        });
      } else {
        throw error;
      }
    }

    this._chainId.set(environment.helaChainId);
  }

  disconnectWallet(): void {
    this._walletAddress.set(null);
    this._isConnected.set(false);
    this._provider.set(null);
    this._signer.set(null);
    this._chainId.set(null);
  }

  private getContract(address: string, abi: ethers.InterfaceAbi): ethers.Contract {
    const signer = this._signer();
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    if (!address) {
      throw new Error('Contract address missing in environment configuration');
    }

    return new ethers.Contract(address, abi, signer);
  }

  async mintAgent(_dnaMetadata: unknown): Promise<ethers.TransactionReceipt> {
    throw new Error('Implement after Phase 2 contract deployment');
  }

  async getAgentDNA(_tokenId: number): Promise<unknown> {
    throw new Error('Implement after Phase 2 contract deployment');
  }

  async getAgentsByOwner(_owner: string): Promise<unknown[]> {
    throw new Error('Implement after Phase 2 contract deployment');
  }

  async getForgeBalance(_address: string): Promise<string> {
    throw new Error('Implement after Phase 2 contract deployment');
  }

  async approveForge(_spender: string, _amount: string): Promise<void> {
    throw new Error('Implement after Phase 2 contract deployment');
  }

  async createJob(_agentTokenId: number, _amount: string): Promise<void> {
    throw new Error('Implement after Phase 2 contract deployment');
  }

  async listForRent(_tokenId: number, _pricePerDay: string, _duration: number): Promise<void> {
    throw new Error('Implement after Phase 2 contract deployment');
  }

  async rentAgent(_tokenId: number, _days: number): Promise<void> {
    throw new Error('Implement after Phase 2 contract deployment');
  }

  getAddressSnapshot(): string | null {
    return this._walletAddress();
  }

  // Kept for Phase 2 ABI wiring.
  getContractInstance(address: string, abi: ethers.InterfaceAbi): ethers.Contract {
    return this.getContract(address, abi);
  }

  getContractAddresses() {
    return this.contractAddresses;
  }
}
