import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import axios from 'axios';
import { ExpressRequest } from '../user/middlewares/auth.middleware';
import { ApiTags, ApiParam } from '@nestjs/swagger';

class WeatherParams {
  @IsNotEmpty({ message: 'City cannot be empty' })
  @IsString({ message: 'City must be a string' })
  city: string;
}

class WeatherForecast {
  city: string;
  forecast: WeatherData[];
}

class WeatherData {
  date: string;
  temperature: number;
  description: string;
  humidity: number;
  pressure: number;
  windSpeed: number;
  sunrise: string;
  sunset: string;
}

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  @ApiParam({ name: 'city', example: 'London', description: 'City name' })
  @Get(':city')
  async getWeather(
    @Param() params: WeatherParams,
    @Request() request: ExpressRequest,
  ) {
    try {
      if (!request.user) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      const apiKey = 'cc3ca09823a4b0909f4229c13e0d090b';
      const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${params.city}&appid=${apiKey}&units=metric`;

      const response = await axios.get(apiUrl);
      const forecastData = response.data;

      if (!forecastData || forecastData.cod !== '200') {
        throw new HttpException(
          'Weather forecast data not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const filteredData: WeatherData[] = [];
      const processedDates: Set<string> = new Set();

      forecastData.list.forEach((data) => {
        const date = new Date(data.dt * 1000).toLocaleDateString();

        if (!processedDates.has(date)) {
          processedDates.add(date);

          filteredData.push({
            date,
            temperature: data.main.temp,
            description: data.weather[0].description,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            windSpeed: data.wind.speed,
            sunrise: new Date(
              forecastData.city.sunrise * 1000,
            ).toLocaleTimeString(),
            sunset: new Date(
              forecastData.city.sunset * 1000,
            ).toLocaleTimeString(),
          });
        }
      });

      const formattedData: WeatherForecast = {
        city: forecastData.city.name,
        forecast: filteredData,
      };

      return formattedData;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          `Unable to fetch weather forecast data for ${params.city}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
