import { ipcMain, IpcMainInvokeEvent, shell } from 'electron'
import { storage } from '../storage'
import type { Note } from '../../shared/types'

const channel = {
  notes: {
    getAll: 'notes:getAll',
    getById: 'notes:getById',
    create: 'notes:create',
    update: 'notes:update',
    delete: 'notes:delete',
    toggleFavorite: 'notes:toggleFavorite',
    search: 'notes:search',
    exportNotes: 'notes:export',
    importNotes: 'notes:import',
    replaceAll: 'notes:replaceAll',
  },
  settings: {
    get: 'settings:get',
    set: 'settings:set',
  },
  storage: {
    info: 'storage:info',
    openDataFolder: 'storage:openDataFolder',
  },
  supabase: {
    getConfig: 'supabase:getConfig',
    setConfig: 'supabase:setConfig',
  },
} as const

export function registerIpcHandlers(): void {
  ipcMain.handle(channel.notes.getAll, async (_event: IpcMainInvokeEvent, includeDeletedOrOptions?: boolean | { includeDeleted?: boolean }) => {
    const includeDeleted =
      typeof includeDeletedOrOptions === 'boolean'
        ? includeDeletedOrOptions
        : (includeDeletedOrOptions?.includeDeleted ?? false)
    return storage.getNotes(includeDeleted)
  })

  ipcMain.handle(channel.notes.getById, async (_event: IpcMainInvokeEvent, id: string) => {
    return storage.getNoteById(id)
  })

  ipcMain.handle(channel.notes.create, async (_event: IpcMainInvokeEvent, note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    return storage.createNote(note)
  })

  ipcMain.handle(channel.notes.update, async (_event: IpcMainInvokeEvent, id: string, updates: Partial<Note>) => {
    return storage.updateNote(id, updates)
  })

  ipcMain.handle(channel.notes.delete, async (_event: IpcMainInvokeEvent, id: string, permanent?: boolean) => {
    return storage.deleteNote(id, permanent ?? false)
  })

  ipcMain.handle(channel.notes.toggleFavorite, async (_event: IpcMainInvokeEvent, id: string) => {
    return storage.toggleFavorite(id)
  })

  ipcMain.handle(channel.notes.search, async (_event: IpcMainInvokeEvent, query: string) => {
    return storage.searchNotes(query)
  })

  ipcMain.handle(channel.notes.exportNotes, async (_event: IpcMainInvokeEvent, format: 'json' | 'markdown') => {
    return storage.exportNotes(format)
  })

  ipcMain.handle(channel.notes.importNotes, async (_event: IpcMainInvokeEvent, data: string, format: 'json') => {
    return storage.importNotes(data, format)
  })

  ipcMain.handle(channel.notes.replaceAll, async (_event: IpcMainInvokeEvent, notes: Note[]) => {
    storage.replaceAllNotes(notes)
  })

  ipcMain.handle(channel.settings.get, async () => {
    return storage.getSettings()
  })

  ipcMain.handle(channel.settings.set, async (_event: IpcMainInvokeEvent, settings: Record<string, unknown>) => {
    return storage.setSettings(settings)
  })

  ipcMain.handle(channel.storage.info, async () => {
    return storage.getStorageInfo()
  })

  ipcMain.handle(channel.storage.openDataFolder, async () => {
    const { path: dataPath } = storage.getStorageInfo()
    await shell.openPath(dataPath)
  })

  ipcMain.handle(channel.supabase.getConfig, async () => {
    return storage.getSupabaseConfig()
  })

  ipcMain.handle(channel.supabase.setConfig, async (_event: IpcMainInvokeEvent, config: { url: string; anonKey: string }) => {
    storage.setSupabaseConfig(config)
  })
}

export { channel as ipcChannel }
