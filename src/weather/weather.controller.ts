// weather.controller.ts

import { Controller, Get, Param, HttpException, HttpStatus, Request } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { plainToClass } from 'class-transformer';
import axios from 'axios';
import { ExpressRequest } from '../user/middlewares/auth.middleware'; // Adjust the path as needed
import { ApiTags, ApiParam } from '@nestjs/swagger';



class WeatherParams {
  @IsNotEmpty({ message: 'City cannot be empty' })
  @IsString({ message: 'City must be a string' })
  city: string;
}

@ApiTags('weather') 
@Controller('weather')
export class WeatherController {
  @ApiParam({ name: 'city', example: 'London', description: 'City name' })
  @Get(':city')
  async getWeather(@Param() params: WeatherParams, @Request() request: ExpressRequest) {
    try {
      if (!request.user) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      const apiKey = 'cc3ca09823a4b0909f4229c13e0d090b';
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${params.city}&appid=${apiKey}&units=metric`;

      const response = await axios.get(apiUrl);
      const weatherData = response.data;

      if (!weatherData || weatherData.cod !== 200) {
        throw new HttpException('Weather data not found', HttpStatus.NOT_FOUND);
      }

      const formattedData = plainToClass(WeatherParams, {
        city: weatherData.name,
        temperature: weatherData.main.temp,
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        windSpeed: weatherData.wind.speed,
        sunrise: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString(),
        sunset: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString(),
      });

      return formattedData;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          `Unable to fetch weather data for ${params.city}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}
