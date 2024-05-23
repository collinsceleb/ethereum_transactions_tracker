import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { RpcTransactionEndpoint } from "../common/utils/rpcTransactionEndpoint";

export class RpcConnectionManager {
  endpoints: RpcTransactionEndpoint[];
  currentIndex: number;

  constructor(endpoints: string[]) {
    this.endpoints = endpoints.map(url => new RpcTransactionEndpoint(url));
    this.currentIndex = 0;
  }

  getCurrentEndpoint(): RpcTransactionEndpoint {
    return this.endpoints[this.currentIndex];
  }

  switchToNext(): void {
    this.currentIndex = (this.currentIndex + 1) % this.endpoints.length;
  }

  async makeRequest(path: string, method: 'GET' | 'POST' = 'GET', data?: any, config?: AxiosRequestConfig): Promise<any> {
    for (let i = 0; i < this.endpoints.length; i++) {
      const currentEndpoint = this.getCurrentEndpoint();
      if (!currentEndpoint.isWorking) {
        this.switchToNext();
        continue;
      }

      try {
        const url = `${currentEndpoint.url}${path}`;
        const response: AxiosResponse = await axios.request({ url, method, data, ...config });
        if (response.status === 200) {
          return response.data;
        } else {
          currentEndpoint.isWorking = false;
        }
      } catch (error) {
        currentEndpoint.isWorking = false;
      }

      this.switchToNext();
    }
    throw new Error('All RPC endpoints are down.');
  }

  async healthCheck(): Promise<void> {
    await Promise.all(this.endpoints.map(endpoint => endpoint.checkEndpointHealth()));
  }
}
