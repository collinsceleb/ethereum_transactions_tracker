import { Container } from 'typedi';
import { createClient } from 'redis';
import axios from 'axios';

// Register Redis client
Container.set('RedisClient', createClient());

// Register Axios HTTP client
Container.set('HttpClient', axios);
