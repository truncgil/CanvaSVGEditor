---
name: Canva SVG Editor Plugin
overview: Canva üzerinde çalışan bir SVG düzenleme plugin'i geliştirilecek. Plugin, seçilen SVG'leri parçalarına ayırma (Ctrl+U), gruplama (Ctrl+G) ve renk değiştirme özelliklerini sağlayacak.
todos:
  - id: setup
    content: Canva plugin proje yapısını kur (package.json, tsconfig, webpack, manifest.json)
    status: completed
  - id: svg-parser
    content: SVG parser ve manipülasyon utility fonksiyonlarını oluştur (svgParser.ts, svgSplitter.ts, svgGrouper.ts)
    status: completed
    dependencies:
      - setup
  - id: canva-api
    content: Canva API entegrasyonunu yap (seçim okuma, element oluşturma, güncelleme) - useCanvaSelection hook'u
    status: completed
    dependencies:
      - setup
  - id: keyboard-shortcuts
    content: Klavye kısayolları sistemini kur (Ctrl+U, Ctrl+G) - useKeyboardShortcuts hook'u
    status: completed
    dependencies:
      - canva-api
  - id: color-picker
    content: Renk seçici paneli componentini oluştur (ColorPicker.tsx)
    status: completed
    dependencies:
      - canva-api
  - id: inline-editor
    content: Inline renk düzenleyici componentini oluştur (InlineColorEditor.tsx)
    status: completed
    dependencies:
      - canva-api
  - id: main-app
    content: Ana App component'ini ve SVGEditor component'ini oluştur, tüm özellikleri entegre et
    status: completed
    dependencies:
      - svg-parser
      - keyboard-shortcuts
      - color-picker
      - inline-editor
  - id: color-changer
    content: Renk değiştirme utility fonksiyonlarını oluştur (colorChanger.ts)
    status: completed
    dependencies:
      - svg-parser
---

# Canva SVG Editor Plugin Geliştirme Planı

## Proje Yapısı

Plugin, Canva Design API kullanarak geliştirilecek ve aşağıdaki dosya yapısına sahip olacak:

```
svg_editor/
├── src/
│   ├── index.tsx              # Ana plugin entry point
│   ├── App.tsx                 # Ana React component
│   ├── components/
│   │   ├── ColorPicker.tsx    # Renk seçici paneli
│   │   ├── InlineColorEditor.tsx # Inline renk düzenleyici
│   │   └── SVGEditor.tsx      # SVG düzenleme ana component
│   ├── utils/
│   │   ├── svgParser.ts       # SVG parsing ve manipülasyon
│   │   ├── svgSplitter.ts     # SVG parçalama işlemleri
│   │   ├── svgGrouper.ts      # SVG gruplama işlemleri
│   │   └── colorChanger.ts    # Renk değiştirme işlemleri
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts # Klavye kısayolları hook'u
│   │   └── useCanvaSelection.ts    # Canva seçim yönetimi
│   └── types/
│       └── index.ts           # TypeScript type tanımları
├── public/
│   └── manifest.json          # Canva plugin manifest
├── package.json
├── tsconfig.json
└── webpack.config.js          # Build konfigürasyonu
```

## Temel Özellikler

### 1. SVG Parçalama (Ctrl+U)

- Seçili SVG elementini analiz etme
- Path elementlerini ayrı objelere dönüştürme
- Group elementlerini ungroup etme
- Her parçayı Canva'da ayrı bir element olarak oluşturma

### 2. SVG Gruplama (Ctrl+G)

- Seçili birden fazla SVG elementini grup içine alma
- Grup oluşturma ve Canva'ya ekleme

### 3. Renk Değiştirme

- **Color Picker Paneli**: Sidebar'da renk seçici
- **Inline Editor**: Seçili element üzerinde hızlı renk değiştirme
- SVG içindeki fill ve stroke renklerini değiştirme

## Teknik Detaylar

### Canva API Entegrasyonu

- `@canva/app-ui-kit` - UI bileşenleri için
- `@canva/design-api` - Design API için
- Seçim yönetimi: `selection.get()` ve `selection.set()`
- Element oluşturma: `design.addNativeElement()` veya `design.addImage()`

### SVG Manipülasyon

- SVG string parsing: DOMParser kullanarak
- Path elementlerini ayrıştırma ve her birini ayrı SVG olarak oluşturma
- Group elementlerini recursive olarak ungroup etme
- Renk değiştirme: `fill` ve `stroke` attribute'larını güncelleme

### Klavye Kısayolları

- `useKeyboardShortcuts` hook'u ile global event listener
- Ctrl+U: Ungroup/Parçalama
- Ctrl+G: Group/Gruplama
- Canva içinde çalışacak şekilde event handling

### React Yapısı

- Functional components ve hooks
- State management: React useState/useEffect
- Canva API ile async işlemler için proper error handling

## Geliştirme Adımları

1. **Proje Kurulumu**

   - Canva plugin template'i ile başlangıç
   - React, TypeScript, Webpack konfigürasyonu
   - Canva SDK bağımlılıklarını ekleme

2. **SVG Parser ve Manipülasyon**

   - SVG string'ini DOM'a parse etme
   - Path ve Group elementlerini tespit etme
   - Her elementi ayrı SVG string'ine dönüştürme

3. **Canva API Entegrasyonu**

   - Seçili elementleri okuma
   - Yeni elementler oluşturma
   - Element özelliklerini güncelleme

4. **Klavye Kısayolları**

   - Global keyboard event listener
   - Ctrl+U ve Ctrl+G handler'ları
   - Canva context'inde çalışma

5. **Renk Değiştirme UI**

   - Color picker component (sidebar)
   - Inline color editor (hover/selection üzerinde)
   - SVG renk attribute'larını güncelleme

6. **Test ve Optimizasyon**

   - Farklı SVG formatlarını test etme
   - Performans optimizasyonu
   - Hata yönetimi ve kullanıcı geri bildirimi

## Önemli Notlar

- Canva Design API'nin güncel versiyonunu kullanmak gerekecek
- SVG parsing için browser-native DOMParser kullanılacak
- Klavye kısayolları Canva'nın kendi kısayollarıyla çakışmamalı
- Plugin, Canva'nın güvenlik politikalarına uygun olmalı