import { contextBridge, ipcRenderer } from 'electron'
import type { Note, AppSettings } from '../shared/types'

const notesApi = {
  getAll: (includeDeleted?: boolean) => ipcRenderer.invoke('notes:getAll', includeDeleted),
  getById: (id: string) => ipcRenderer.invoke('notes:getById', id),
  create: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => ipcRenderer.invoke('notes:create', note),
  update: (id: string, updates: Partial<Note>) => ipcRenderer.invoke('notes:update', id, updates),
  delete: (id: string, permanent?: boolean) => ipcRenderer.invoke('notes:delete', id, permanent),
  toggleFavorite: (id: string) => ipcRenderer.invoke('notes:toggleFavorite', id),
  search: (query: string) => ipcRenderer.invoke('notes:search', query),
  exportNotes: (format: 'json' | 'markdown') => ipcRenderer.invoke('notes:export', format),
  importNotes: (data: string, format: 'json') => ipcRenderer.invoke('notes:import', data, format),
  replaceAll: (notes: Note[]) => ipcRenderer.invoke('notes:replaceAll', notes),
}

const settingsApi = {
  get: () => ipcRenderer.invoke('settings:get') as Promise<AppSettings>,
  set: (settings: Record<string, unknown>) => ipcRenderer.invoke('settings:set', settings) as Promise<AppSettings>,
}

const storageApi = {
  info: () => ipcRenderer.invoke('storage:info'),
  openDataFolder: () => ipcRenderer.invoke('storage:openDataFolder'),
}

const supabaseApi = {
  getConfig: () => ipcRenderer.invoke('supabase:getConfig') as Promise<{ url: string; anonKey: string }>,
  setConfig: (config: { url: string; anonKey: string }) => ipcRenderer.invoke('supabase:setConfig', config),
}

contextBridge.exposeInMainWorld('electronAPI', {
  notes: notesApi,
  settings: settingsApi,
  storage: storageApi,
  supabase: supabaseApi,
})

export type ElectronAPI = typeof notesApi & typeof settingsApi & typeof storageApi
