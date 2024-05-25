import dotenv from 'dotenv';
import express from 'express';
import AuthenticationController from './auth.controller';
import Container from 'typedi';
dotenv.config();

const router = express.Router();
const authController = Container.get(AuthenticationController);
router.post('/login', authController.login);

export default router;
