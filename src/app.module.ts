import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';
import {UserModule} from './user/user.module';
import {MongooseModule} from '@nestjs/mongoose';
import {AuthMiddleware} from './user/middlewares/auth.middleware';
import { WeatherController } from './weather/weather.controller';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [UserModule, MongooseModule.forRoot('mongodb://127.0.0.1:27017/app'), CacheModule.register()],
  controllers: [WeatherController],
  providers: [  {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL
    })
  }
}