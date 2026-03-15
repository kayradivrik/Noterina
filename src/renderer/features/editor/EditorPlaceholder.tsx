import { FileText } from 'lucide-react'

export function EditorPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-[#0b0c1a] text-slate-500 dark:text-slate-400">
      <div className="size-16 rounded-2xl bg-slate-100 dark:bg-primary/10 flex items-center justify-center">
        <FileText size={32} className="text-slate-400 dark:text-primary/60" strokeWidth={1.2} />
      </div>
      <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">Bir not seçin veya yeni not oluşturun</p>
      <p className="text-sm text-center max-w-sm">
        Sol menüden &quot;Yeni Not&quot; ile başlayabilir veya listeden bir not seçebilirsiniz.
      </p>
    </div>
  )
}
