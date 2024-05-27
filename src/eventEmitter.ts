import { Service } from 'typedi';
import { Server } from 'socket.io';
import { createClient, RedisClientType } from 'redis';
import { Event } from './common/interfaces/event';


@Service()
export class EventEmitterService {
  private static ethPrice: number = 5000;
  private static redisClient: RedisClientType;

  static async init(io: Server) {
    this.redisClient = createClient();
    this.redisClient.on('error', (err: any) => {
      console.error('Redis error:', err);
    });
    await this.redisClient.connect();

    this.server = io;
  }

  private static server: Server;

  static async emitEvent(event: Event) {
    // console.log('Emitting event:', event);

    const eventString = JSON.stringify(event);
    const cacheEvent = async (key: string) => {
      try {
        await this.redisClient.lPush(key, eventString);
        await this.redisClient.lTrim(key, -100, -1);
      } catch (err) {
        console.error('Redis error:', err);
      }
    };

    this.server.to('all').emit('event', event);
    await cacheEvent('all');

    if (event.sender) {
      this.server.to(`sender:${event.sender}`).emit('event', event);
      // console.log("event.sender", event.sender);

      await cacheEvent(`sender:${event.sender}`);
    }
    if (event.receiver) {
      this.server.to(`receiver:${event.receiver}`).emit('event', event);
      await cacheEvent(`receiver:${event.receiver}`);
    }
    if (event.sender || event.receiver) {
      this.server.to(`address:${event.sender}`).emit('event', event);
      await cacheEvent(`address:${event.sender}`);
      this.server.to(`address:${event.receiver}`).emit('event', event);
      await cacheEvent(`address:${event.receiver}`);
    }

    const amountInUsd = (event.amount) * this.ethPrice;
    if (amountInUsd > 0 && amountInUsd <= 100) {
      this.server.to('range:0-100').emit('event', event);
      await cacheEvent('range:0-100');
    } else if (amountInUsd > 100 && amountInUsd <= 500) {
      this.server.to('range:100-500').emit('event', event);
      await cacheEvent('range:100-500');
    } else if (amountInUsd > 500 && amountInUsd <= 2000) {
      this.server.to('range:500-2000').emit('event', event);
      await cacheEvent('range:500-2000');
    } else if (amountInUsd > 2000 && amountInUsd <= 5000) {
      this.server.to('range:2000-5000').emit('event', event);
      await cacheEvent('range:2000-5000');
    } else if (amountInUsd > 5000) {
      this.server.to('range:>5000').emit('event', event);
      await cacheEvent('range:>5000');
    }
  }

  static async getCachedEvents(key: string): Promise<Event[]> {
    try {
      const events = await this.redisClient.lRange(key, 0, -1);
      return events.map(event => JSON.parse(event));
    } catch (err) {
      console.error('Redis lrange error:', err);
      return [];
    }
  }
}
