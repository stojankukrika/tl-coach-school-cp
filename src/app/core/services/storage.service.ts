// src/app/core/services/storage.service.ts
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  // Save data (handles objects automatically via JSON.stringify)
  async set(key: string, value: any): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await Preferences.set({
      key: key,
      value: stringValue
    });
  }

  // Retrieve data
  async get(key: string): Promise<any> {
    const { value } = await Preferences.get({ key: key });
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch (e) {
      return value; // Return as raw string if it's not JSON
    }
  }

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key: key });
  }

  async clear(): Promise<void> {
    await Preferences.clear();
  }
}