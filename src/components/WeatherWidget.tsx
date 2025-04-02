
import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Thermometer, Wind, CloudSnow, CloudLightning } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface WeatherWidgetProps {
  userId: string;
}

interface WeatherData {
  location: string;
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';
  humidity: number;
  windSpeed: number;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ userId }) => {
  const [weather, setWeather] = useState<WeatherData>(() => {
    const savedWeather = localStorage.getItem(`webOS_weather_${userId}`);
    if (savedWeather) {
      return JSON.parse(savedWeather);
    }
    return {
      location: 'San Francisco',
      temperature: 68,
      condition: 'sunny',
      humidity: 65,
      windSpeed: 8
    };
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [locationInput, setLocationInput] = useState(weather.location);
  
  useEffect(() => {
    localStorage.setItem(`webOS_weather_${userId}`, JSON.stringify(weather));
  }, [weather, userId]);
  
  // Simulate weather data fetch (in a real app, this would be an API call)
  const fetchWeatherData = (location: string) => {
    // Simple random weather generator for demo purposes
    const conditions: Array<'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy'> = 
      ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const randomTemp = Math.floor(Math.random() * 50) + 40; // 40-90°F
    const randomHumidity = Math.floor(Math.random() * 50) + 30; // 30-80%
    const randomWind = Math.floor(Math.random() * 15) + 2; // 2-17 mph
    
    setWeather({
      location,
      temperature: randomTemp,
      condition: randomCondition,
      humidity: randomHumidity,
      windSpeed: randomWind
    });
    
    setIsSettingsOpen(false);
  };
  
  const renderWeatherIcon = () => {
    switch (weather.condition) {
      case 'sunny':
        return <Sun className="h-10 w-10 text-yellow-400" />;
      case 'cloudy':
        return <Cloud className="h-10 w-10 text-gray-400" />;
      case 'rainy':
        return <CloudRain className="h-10 w-10 text-blue-400" />;
      case 'snowy':
        return <CloudSnow className="h-10 w-10 text-blue-200" />;
      case 'stormy':
        return <CloudLightning className="h-10 w-10 text-purple-400" />;
      default:
        return <Sun className="h-10 w-10 text-yellow-400" />;
    }
  };
  
  return (
    <div>
      <Card className="w-full p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">{weather.location}</h3>
          <Button variant="ghost" size="sm" onClick={() => setIsSettingsOpen(true)}>
            Change
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {renderWeatherIcon()}
            <div className="ml-3">
              <div className="text-2xl font-bold">{weather.temperature}°F</div>
              <div className="text-sm capitalize">{weather.condition}</div>
            </div>
          </div>
          
          <div className="text-right text-sm">
            <div className="flex items-center justify-end">
              <Thermometer className="h-4 w-4 mr-1" />
              <span>Humidity: {weather.humidity}%</span>
            </div>
            <div className="flex items-center justify-end mt-1">
              <Wind className="h-4 w-4 mr-1" />
              <span>Wind: {weather.windSpeed} mph</span>
            </div>
          </div>
        </div>
      </Card>
      
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Weather Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input 
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Enter city name"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => fetchWeatherData(locationInput)}>
              Update Weather
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeatherWidget;
