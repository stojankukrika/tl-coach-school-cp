// src/app/core/services/storage.service.ts
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  // Save data (objects/arrays will be stringified automatically)
  async set(key: string, value: any): Promise<void> {
    await Preferences.set({
      key: key,
      value: JSON.stringify(value)
    });
  }

  // Retrieve data
  async get(key: string): Promise<any> {
    const { value } = await Preferences.get({ key: key });
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch (e) {
      return value; // Return as string if not JSON
    }
  }

  // Remove specific key
  async remove(key: string): Promise<void> {
    await Preferences.remove({ key: key });
  }

  // Clear all storage
  async clear(): Promise<void> {
    await Preferences.clear();
  }
}