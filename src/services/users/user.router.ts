import dotenv from 'dotenv';
import express from 'express';
import UserController from './user.controller';
import Container from 'typedi';
dotenv.config();

const router = express.Router();
const userController = Container.get(UserController);
router.post('/create-user', userController.createUser);

export default router;
