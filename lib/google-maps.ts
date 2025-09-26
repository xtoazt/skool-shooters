// Google Maps Street View integration
import { Loader } from '@googlemaps/js-api-loader';

export interface StreetViewConfig {
  position: { lat: number; lng: number };
  pov: { heading: number; pitch: number };
  zoom: number;
  visible: boolean;
}

export class GoogleMapsService {
  private loader: Loader;
  private map: google.maps.Map | null = null;
  private streetView: google.maps.StreetViewPanorama | null = null;
  private isInitialized = false;

  constructor(apiKey: string = 'AIzaSyB9vKASqiPS-xWAVBy5YlqOJLEvLwpA6iw') {
    this.loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.loader.load();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to load Google Maps API:', error);
      throw error;
    }
  }

  createMap(container: HTMLElement, options: google.maps.MapOptions): google.maps.Map {
    this.map = new google.maps.Map(container, options);
    return this.map;
  }

  createStreetView(container: HTMLElement, config: StreetViewConfig): google.maps.StreetViewPanorama {
    this.streetView = new google.maps.StreetViewPanorama(container, {
      position: config.position,
      pov: config.pov,
      zoom: config.zoom,
      visible: config.visible,
      disableDefaultUI: true,
      clickToGo: false,
      scrollwheel: false,
      disableDoubleClickZoom: true,
      keyboardShortcuts: false
    });
    return this.streetView;
  }

  getStreetView(): google.maps.StreetViewPanorama | null {
    return this.streetView;
  }

  getMap(): google.maps.Map | null {
    return this.map;
  }

  // Get random location in a city
  async getRandomLocationInCity(city: string, country: string): Promise<{ lat: number; lng: number } | null> {
    if (!this.isInitialized) {
      throw new Error('Google Maps not initialized');
    }

    try {
      const geocoder = new google.maps.Geocoder();
      const results = await geocoder.geocode({
        address: `${city}, ${country}`
      });

      if (results.results.length > 0) {
        const bounds = results.results[0].geometry.bounds;
        if (bounds) {
          // Generate random point within city bounds
          const lat = bounds.getSouthWest().lat() + 
            Math.random() * (bounds.getNorthEast().lat() - bounds.getSouthWest().lat());
          const lng = bounds.getSouthWest().lng() + 
            Math.random() * (bounds.getNorthEast().lng() - bounds.getSouthWest().lng());
          
          return { lat, lng };
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting random location:', error);
      return null;
    }
  }

  // Check if Street View is available at location
  async isStreetViewAvailable(lat: number, lng: number): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Google Maps not initialized');
    }

    return new Promise((resolve) => {
      const streetViewService = new google.maps.StreetViewService();
      streetViewService.getPanorama({
        location: { lat, lng },
        radius: 50
      }, (data, status) => {
        resolve(status === google.maps.StreetViewStatus.OK);
      });
    });
  }

  // Get Street View data for a location
  async getStreetViewData(lat: number, lng: number): Promise<{
    position: { lat: number; lng: number };
    pov: { heading: number; pitch: number };
  } | null> {
    if (!this.isInitialized) {
      throw new Error('Google Maps not initialized');
    }

    return new Promise((resolve) => {
      const streetViewService = new google.maps.StreetViewService();
      streetViewService.getPanorama({
        location: { lat, lng },
        radius: 50
      }, (data, status) => {
        if (status === google.maps.StreetViewStatus.OK && data) {
          resolve({
            position: {
              lat: data.location!.latLng!.lat(),
              lng: data.location!.latLng!.lng()
            },
            pov: {
              heading: data.tiles!.centerHeading!,
              pitch: 0
            }
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  // Popular cities for random selection
  static getPopularCities(): Array<{ city: string; country: string; lat: number; lng: number }> {
    return [
      { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
      { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
      { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
      { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
      { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
      { city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437 },
      { city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
      { city: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
      { city: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734 },
      { city: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041 }
    ];
  }

  // Get random city
  static getRandomCity(): { city: string; country: string; lat: number; lng: number } {
    const cities = this.getPopularCities();
    return cities[Math.floor(Math.random() * cities.length)];
  }
}
