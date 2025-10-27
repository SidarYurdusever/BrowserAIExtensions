# Metin Yardımcısı

Metin çevirisi, düzenleme ve iyileştirme yapan Chrome eklentisi.

## Özellikler

### 🌐 Metin Çevirisi
Seçili metni hedef dile çevirir
- 10 dil arasında geçiş: Türkçe, İngilizce, İspanyolca, Fransızca, Almanca, İtalyanca, Portekizce, Rusça, Kürtçe, Zazaca
- Çeviri sonrası diller arasında anlık geçiş

### 📧 Mail Formatı
Metni profesyonel e-posta formatına dönüştür (konu, selamlama, imza)

### ✍️ Noktalama ve Yazım Düzeltme
Yazım hatalarını ve noktalama işaretlerini otomatik düzeltir

### 📝 Metin Uzatma
Metni daha detaylı ve kapsamlı hale getirir

### 📄 Metin Kısaltma
Metni özetleyerek kısa ve öz hale getirir

### ⭐ Metin İyileştirme
Metni daha akıcı, anlaşılır ve profesyonel hale getirir

## Kurulum

1. Chrome'da `chrome://extensions/` adresine gidin
2. Sağ üst köşedeki "Geliştirici modu"nu etkinleştirin
3. "Paketlenmemiş öğe yükle" butonuna tıklayın
4. Bu projenin dizinini seçin

## Dosya Yapısı

- `manifest.json` - Eklenti yapılandırma dosyası
- `popup.html` - Eklenti popup arayüzü
- `popup.css` - Popup stil dosyası
- `popup.js` - Popup JavaScript kodu
- `background.js` - Arka plan service worker
- `content.js` - Web sayfalarında çalışan script
- `icons/` - Eklenti ikonları dizini

## İkonlar

İkonlar dizinine aşağıdaki boyutlarda PNG dosyaları eklemeniz gerekiyor:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)


## Geliştirme

Kod değişiklikleri yaptıktan sonra:
1. `chrome://extensions/` sayfasında eklentinin altındaki yenile butonuna tıklayın
2. Değişiklikleri test edin

