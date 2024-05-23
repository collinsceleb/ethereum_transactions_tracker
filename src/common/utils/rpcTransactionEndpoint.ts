import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpException } from '../../exceptions/HttpException';

export class RpcTransactionEndpoint {
  url: string;
  isWorking: boolean;

  constructor(url: string) {
    this.url = url;
    this.isWorking = true;
  }

  async checkEndpointHealth(): Promise<void> {
    try {
      // Check if the url is healthy and working
      const response: AxiosResponse = await axios.get(`${this.url}/health`);
      if (response.status === 200) {
        this.isWorking = true;
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        // Access denied but we can assume the endpoint is up but health check is restricted
        console.warn(`Access denied for health check at ${this.url}`);
        this.isWorking = true;
      } else {
        this.isWorking = false;
      }
    }
  }
}
