import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { RpcEndpointCheck } from '../utils/rpcEndpointCheck';
import { Service } from 'typedi';
@Service()
export class RpcConnectionManager {
  endpoints: RpcEndpointCheck[];
  currentIndex: number;

  constructor(endpoints: string[]) {
    this.endpoints = endpoints.map(url => new RpcEndpointCheck(url));
    this.currentIndex = 0;
  }

  getCurrentEndpoint(): RpcEndpointCheck {
    return this.endpoints[this.currentIndex];
  }

  switchToNextEndpoint(): void {
    this.currentIndex = (this.currentIndex + 1) % this.endpoints.length;
  }

  async makeRequest(path: string, method: 'GET' | 'POST' = 'GET', data?: any, config?: AxiosRequestConfig): Promise<any> {
    for (let i = 0; i < this.endpoints.length; i++) {
      const currentEndpoint = this.getCurrentEndpoint();
      if (!currentEndpoint.isWorking) {
        this.switchToNextEndpoint();
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

      this.switchToNextEndpoint();
    }
    throw new Error('All RPC endpoints are down.');
  }

  async healthCheck(): Promise<void> {
    await Promise.all(this.endpoints.map(endpoint => endpoint.checkEndpointHealth()));
  }
}
