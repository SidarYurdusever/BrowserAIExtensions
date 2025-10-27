# PDF Dosyalarında AI Metin Asistanı Kullanımı

Chrome'un yerleşik PDF görüntüleyicisi eklentileri desteklemez. Bu yüzden PDF dosyalarında AI Metin Asistanı'nı kullanmak için özel bir çözüm sunuyoruz.

## 📖 PDF Viewer Özelliği

Eklentimiz, metin seçimi yapabileceğiniz özel bir PDF görüntüleyici içeriyor.

### 🚀 Nasıl Kullanılır?

#### Yöntem 1: PDF Viewer'ı Doğrudan Kullanın

1. PDF dosyanızın URL'ini kopyalayın
2. Yeni bir sekmede şu adresi açın:
   ```
   chrome-extension://[EKLENTI_ID]/pdf-viewer.html?file=[PDF_URL]
   ```

**Örnek:**
```
chrome-extension://abcdefghijk123456/pdf-viewer.html?file=https://example.com/document.pdf
```

#### Yöntem 2: Yerel PDF Dosyaları İçin

1. PDF dosyanızı bir web sitesine yükleyin (Google Drive, Dropbox, vb.)
2. PDF'in direkt linkini alın
3. Yukarıdaki Yöntem 1'i kullanın

### ⚡ PDF Viewer Özellikleri

- **Metin Seçimi:** PDF'deki metinleri seçebilir ve AI Metin Asistanı'nı kullanabilirsiniz
- **Sayfa Gezinme:** ◀ Önceki / Sonraki ▶ butonları
- **Zoom:** +/- butonları ile yakınlaştırma
- **Klavye Kısayolları:**
  - `←` `→` : Sayfa değiştir
  - `+` `-` : Zoom yap

### 🎯 AI Özelliklerini Kullanma

PDF Viewer'da metin seçtikten sonra:
1. Metni seçin
2. Yüzen AI butonuna tıklayın
3. veya **sağ tıklayıp** "AI Metin Asistanı" menüsünden işlem seçin

## 🔧 Eklenti ID'sini Bulma

1. `chrome://extensions/` sayfasını açın
2. "Geliştirici modu"nu açın
3. AI Metin Asistanı eklentisinin altında "ID:" yazısının yanındaki kodu kopyalayın

## 💡 İpucu

Sık kullandığınız PDF URL'lerini yer imlerine ekleyebilirsiniz:
```
chrome-extension://YOUR_ID/pdf-viewer.html?file=https://example.com/document.pdf
```

## ⚠️ Sınırlamalar

- Chrome'un güvenlik politikaları nedeniyle doğrudan file:// URL'leri çalışmayabilir
- PDF dosyası internetten erişilebilir olmalıdır
- CORS (Cross-Origin) kısıtlaması olan sitelerden PDF yüklenemeyebilir
