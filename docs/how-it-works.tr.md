---
title: Nasıl çalışır
description: Sunucu loglarının rsyslog ve syslogd ile SIEM'inize nasıl ulaştığının basit zihinsel modeli.
---

# Nasıl çalışır

Bunun çalışması için syslog hakkında her şeyi bilmenize gerek yok — aşağıdaki tek
zihinsel model yeterli. **Sade anlatımla:** sunucunuz, biri her giriş yaptığında
veya şifre denemesi başarısız olduğunda zaten bir log kaydı yazar. Biz sadece
sunucunun yerleşik loglayıcısına bu kayıtları *ayrıca* ağ üzerinden SIEM'e
göndermesini söylüyoruz.

## Akış

<div class="surface">
  <div class="flow">
    <span class="flow-node primary">sshd / login / sudo</span>
    <span class="flow-arrow">→</span>
    <span class="flow-node">rsyslog / syslogd</span>
    <span class="flow-arrow">→</span>
    <span class="flow-node">ağ (port 514)</span>
    <span class="flow-arrow">→</span>
    <span class="flow-node dest">SIEM</span>
  </div>
</div>

1. Bir program (örneğin `sshd`) *"Accepted password for bob"* gibi bir log satırı yazar.
2. Loglayıcı (`rsyslog` Linux'ta, `syslogd` FreeBSD'de) bunu alır.
3. Loglayıcı kaydı yerel bir dosyaya (`/var/log/secure` veya `/var/log/auth.log`)
   yazar **ve** — config'imiz sayesinde — bir kopyasını SIEM'e gönderir.
4. SIEM bunu saklar ve görüntüler.

## Facility ve priority (ihtiyacınız olan iki kelime)

Her log mesajının iki etiketi vardır:

- **Facility** = mesajı *hangi alt sistemin* yazdığı. Bizim için önemli olanlar:

| Facility | Anlamı |
| --- | --- |
| `auth` | Giriş/çıkış/şifre olayları |
| `authpriv` | Özel auth olayları (aynı fikir, daha hassas) |
| `kern` | Çekirdek mesajları |
| `daemon` | Arka plan servisleri |
| `*` | **Her şey** |

- **Priority** = *ne kadar önemli* olduğu. En kritikten en az kritiğe:
  `emerg`, `alert`, `crit`, `err`, `warning`, `notice`, `info`, `debug`.
  Buradaki `*` **her öncelik seviyesi** anlamına gelir.

Yani `auth,authpriv.*` seçicisi şu anlama gelir: *"`auth` ve `authpriv`
facility'lerinden gelen her mesajı, her öncelikte gönder"*.

!!! tip "Neden `auth,authpriv`?"
    Girişler, çıkışlar, `sudo` ve **hatalı şifre denemeleri** `auth` / `authpriv`
    facility'si altında loglanır. SIEM'inizde tam olarak bunları istersiniz.

## `@` vs `@@` — UDP vs TCP

Config dosyasında tek `@` **UDP**, çift `@@` **TCP** anlamına gelir.

| Sözdizimi | Protokol | Davranış |
| --- | --- | --- |
| `@10.0.0.1:514` | UDP | Hızlı, ama ağ yoğunsa mesajlar sessizce kaybolabilir |
| `@@10.0.0.1:514` | TCP | Güvenilir, mesajların ulaşması garanti edilir (sırayla) |

!!! success "Öneri"
    SIEM'iniz özellikle UDP istemiyorsa **TCP** (`@@`) kullanın. TCP daha
    güvenilirdir ve çoğu modern SIEM (Splunk, QRadar, Wazuh, Graylog…) bunu bekler.
    Bu rehberdeki tüm örnekler TCP kullanır.

## Ham bir log satırı neye benzer

İşte sunucunuzdan tam olarak çıktığı haliyle bir satır (geleneksel `RFC3164` formatı):

```text
Oct  6 14:22:31 web-01 sshd[2914]: Accepted password for bob from 203.0.113.7 port 52217 ssh2
```

Ve başarısız bir giriş:

```text
Oct  6 14:23:05 web-01 sshd[2931]: Failed password for root from 203.0.113.9 port 52240 ssh2
```

Parçalara ayıralım:

| Kısım | Değer | Anlamı |
| --- | --- | --- |
| Zaman damgası | `Oct  6 14:22:31` | Ne zaman oldu |
| Host adı | `web-01` | Hangi sunucu |
| Program | `sshd[2914]` | Hangi program (process ID ile) |
| Mesaj | `Accepted password for bob…` | Ne oldu |

Bu SIEM'inize ulaştığında, SIEM bu parçaları aranabilir alanlara ayırır; böylece
*"son bir saatteki tüm hatalı girişleri göster"* diye sorgulayabilirsiniz.

## Modern format (RFC5424) ne olacak?

Yeni sistemler daha yapılandırılmış bir `RFC5424` formatı da gönderebilir
(`PRI`, `VERSION`, `MSGID` gibi alanlarla). Çoğu SIEM **ikisini de** kabul eder.
rsyslog'un varsayılanı klasik formattır ve buradaki örnekler bunu üretir. Hiçbir
şey değiştirmeniz gerekmez.

## Sıradaki adımlar

Şimdi işletim sisteminizi seçin ve yapılandırın:

- [Red Hat (RHEL 6–9)](redhat.md)
- [Debian & Ubuntu](debian-ubuntu.md)
- [FreeBSD](freebsd.md)
