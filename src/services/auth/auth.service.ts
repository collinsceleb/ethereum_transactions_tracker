import * as argon2 from 'argon2';
import { HttpException } from '../../exceptions/HttpException';
import { Service } from 'typedi';
import { User } from '../../entity/User';
import { AppDataSource } from '../../data-source';
import { AuthDto } from './dto/auth.dto';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import UAParser from 'ua-parser-js';
import { RefreshToken } from '../../entity/RefreshToken';
import { Device } from '../../entity/Device';
import { Request } from 'express';
import * as crypto from 'crypto';
import axios from 'axios';

dotenv.config();
@Service()
class AuthenticationService {
  private readonly userRepository = AppDataSource.getRepository(User);
  private readonly refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
  private readonly deviceRepository = AppDataSource.getRepository(Device);
  private readonly JWT_EXPIRATION_IN_MILLISECONDS = parseInt(process.env.JWT_EXPIRY_TIME) * 1000;

  constructor() {
    const opts = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_KEY,
    };

    passport.use(
      new JwtStrategy(opts, (jwt_payload, done) => {
        const user = this.userRepository.findOneBy({ id: jwt_payload.sub });
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      }),
    );
  }
  async generateTokens(user: User, request: Request) {
    const userAgent = request.headers['user-agent'];
    const deviceDetails = this.getUserAgentInfo(userAgent);
    const jwtId = crypto.randomUUID();
    const ipAddress = request.ip;
    const location = await this.getLocation(ipAddress);
    const payload = {
      sub: user.id,
      email: user.email,
      jwtId: jwtId,
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    let device = await this.deviceRepository.findOneBy({
      user: { id: user.id },
      deviceType: deviceDetails.device.type,
      deviceVendor: deviceDetails.device.vendor,
      deviceModel: deviceDetails.device.model,
      browserName: deviceDetails.browser.name,
      osName: deviceDetails.os.name,
    });
    let uniqueDeviceId: string;
    if (device) {
      uniqueDeviceId = device.uniqueDeviceId;
      device.osVersion = deviceDetails.os.version;
      device.browserVersion = deviceDetails.browser.version;
    } else {
      uniqueDeviceId = crypto.randomUUID();
      device = this.deviceRepository.create({
        uniqueDeviceId: uniqueDeviceId,
        deviceType: deviceDetails.device.type,
        deviceVendor: deviceDetails.device.vendor,
        deviceModel: deviceDetails.device.model,
        browserName: deviceDetails.browser.name,
        osName: deviceDetails.os.name,
        osVersion: deviceDetails.os.version,
        browserVersion: deviceDetails.browser.version,
        user: { id: user.id },
        ip: ipAddress,
        userAgent,
        // city: location.city,
        // country: location.country,
        // region: location.region,
        // latitude: location.latitude,
        // longitude: location.longitude,
      });
      await this.deviceRepository.save(device);
    }
    const refreshPayload = { ...payload, uniqueDeviceId: uniqueDeviceId };
    const refreshToken = jwt.sign(refreshPayload, process.env.JWT_SECRET_KEY, { expiresIn: this.JWT_EXPIRATION_IN_MILLISECONDS });
    const newRefreshToken = this.refreshTokenRepository.create({
      token: refreshToken,
      device: { id: device.id },
      user: { id: user.id },
      expiresAt: new Date(Date.now() + this.JWT_EXPIRATION_IN_MILLISECONDS),
    });
    await this.refreshTokenRepository.save(newRefreshToken);
    return {accessToken, refreshToken: newRefreshToken.token, uniqueDeviceId};
  }

  authenticate = passport.authenticate('jwt', { session: false });

  /**
   * async login
   */
  public async login(authdto: AuthDto, request: Request) {
    const existingUser = await this.userRepository.findOneBy({ email: authdto.email });
    const comparePassword = await argon2.verify(existingUser.password, authdto.password);


    if (!existingUser) {
      throw new HttpException(404, 'User not found');
    }
    if (!comparePassword) {
      throw new HttpException(404, 'Incorrect Password');
    }
    delete existingUser.password;
   return await this.generateTokens(existingUser, request);
  }
  // Function to retrieve device information based on the user agent
  private getUserAgentInfo(userAgent: string) {
    const userAgentInfo = UAParser(userAgent);
    return {
      browser: {
        name: userAgentInfo.browser.name || 'Unknown',
        version: userAgentInfo.browser.version || 'Unknown',
      },
      os: {
        name: userAgentInfo.os.name || 'Unknown',
        version: userAgentInfo.browser.version || 'unknown',
      },
      device: {
        type: userAgentInfo.device.type || 'Unknown',
        vendor: userAgentInfo.device.vendor || 'unknown',
        model: userAgentInfo.device.model || 'unknown',
      },
    };
  }
  async getLocation(ipAddress: string) {
    try {
      const ipstackApiKey = process.env.IPSTACK_API_KEY;
      const response = await axios.get(`http://api.ipstack.com/${ipAddress}?access_key=${ipstackApiKey}`);
      const { city, region_name, country_name, latitude, longitude }: LocationData = response.data;
      return {
        city,
        region: region_name,
        country: country_name,
        latitude,
        longitude,
      };
    } catch (error) {
      throw new HttpException(400, 'Unable to retrieve location information');
    }
  }
}

export default AuthenticationService;
