export interface NoteTemplate {
  id: string
  name: string
  icon: string
  title: string
  content: string
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'blank',
    name: 'Boş not',
    icon: '📄',
    title: 'Başlıksız Not',
    content: '<p></p>',
  },
  {
    id: 'todo',
    name: 'Yapılacak listesi',
    icon: '✅',
    title: 'Yapılacaklar',
    content: `<p><strong>Bugün</strong></p>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label contenteditable="false"><input type="checkbox"><span>Görev 1</span></label></li>
  <li data-type="taskItem" data-checked="false"><label contenteditable="false"><input type="checkbox"><span>Görev 2</span></label></li>
  <li data-type="taskItem" data-checked="false"><label contenteditable="false"><input type="checkbox"><span>Görev 3</span></label></li>
</ul>
<p><strong>Bu hafta</strong></p>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label contenteditable="false"><input type="checkbox"><span>Haftalık hedef</span></label></li>
</ul>`,
  },
  {
    id: 'meeting',
    name: 'Toplantı notu',
    icon: '📋',
    title: 'Toplantı Notu',
    content: `<h2>Toplantı — [Tarih]</h2>
<p><strong>Katılımcılar:</strong> </p>
<p><strong>Gündem:</strong></p>
<ol>
  <li><p>Madde 1</p></li>
  <li><p>Madde 2</p></li>
</ol>
<p><strong>Kararlar:</strong></p>
<ul>
  <li><p>Karar 1</p></li>
</ul>
<p><strong>Aksiyonlar:</strong></p>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label contenteditable="false"><input type="checkbox"><span>Yapılacak — Sahip</span></label></li>
</ul>`,
  },
  {
    id: 'project',
    name: 'Proje planı',
    icon: '🎯',
    title: 'Proje Planı',
    content: `<h2>Proje Adı</h2>
<p>Kısa açıklama.</p>
<h3>Hedefler</h3>
<ul>
  <li><p>Hedef 1</p></li>
  <li><p>Hedef 2</p></li>
</ul>
<h3>Görevler</h3>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label contenteditable="false"><input type="checkbox"><span>Görev</span></label></li>
</ul>
<h3>Notlar</h3>
<p></p>`,
  },
  {
    id: 'daily',
    name: 'Günlük',
    icon: '📅',
    title: 'Günlük',
    content: `<h2>📅 [Tarih]</h2>
<p><strong>Bugün ne yaptım?</strong></p>
<p></p>
<p><strong>Yarın yapacaklarım:</strong></p>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false"><label contenteditable="false"><input type="checkbox"><span></span></label></li>
</ul>`,
  },
  {
    id: 'ideas',
    name: 'Fikirler',
    icon: '💡',
    title: 'Fikirler',
    content: `<p>Fikir listesi — istediğin gibi düzenle.</p>
<ul>
  <li><p>Fikir 1</p></li>
  <li><p>Fikir 2</p></li>
</ul>`,
  },
]
