import { Elderly, ActivityStatus, DeviceInfo } from './Types';

// Local class implementations for strict typing and initialization
export class LocationCoords {
  latitude: number = 0;
  longitude: number = 0;
}

export class DeviceInfoLocal implements DeviceInfo {
  deviceId: string = '';
  name: string = '';
  batteryLevel: number = 0;
  isOnline: boolean = false;
  lastOnlineTime: string = '';
}

export class ElderlyLocal implements Elderly {
  id: string = '';
  name: string = '';
  age: number = 0;
  avatarUrl: string = '';
  phone: string = '';
  currentStatus: ActivityStatus = ActivityStatus.STILL;
  currentLocation: string = '';
  locationCoords: LocationCoords = new LocationCoords();
  device: DeviceInfoLocal = new DeviceInfoLocal();
  relation: string = ''; 

  constructor(data: Object) {
    // Helper to safely access properties of 'unknown' type
    const safeData = data as Record<string, unknown>;

    this.id = (safeData.id as string) || '';
    this.name = (safeData.name as string) || '未知';
    this.phone = (safeData.phone as string) || '';
    this.relation = (safeData.relation as string) || '亲属';
    this.age = (safeData.age as number) || 60;
    this.avatarUrl = (safeData.avatarUrl as string) || 'app.media.ic_public_contacts';
    
    // Map status string to Enum if needed, or just use string
    this.currentStatus = (safeData.currentStatus as ActivityStatus) || ActivityStatus.STILL;
    this.currentLocation = (safeData.currentLocation as string) || '未知位置';
    
    this.locationCoords = new LocationCoords();
    const coords = safeData.locationCoords as Record<string, unknown>;
    if (coords) {
        this.locationCoords.latitude = (coords.latitude as number) || 0;
        this.locationCoords.longitude = (coords.longitude as number) || 0;
    }

    this.device = new DeviceInfoLocal();
    const deviceData = safeData.device as Record<string, unknown>;
    if (deviceData) {
        this.device.deviceId = (deviceData.deviceId as string) || '';
        this.device.name = (deviceData.name as string) || '';
        this.device.batteryLevel = (deviceData.batteryLevel as number) || 0;
        this.device.isOnline = (deviceData.isOnline as boolean) || false;
        this.device.lastOnlineTime = (deviceData.lastOnlineTime as string) || '';
    }
  }
}
