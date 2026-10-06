---
title: Referans & özet kartı
description: Unix/Linux SIEM entegrasyon rehberi için hızlı başvuru tabloları.
---

# Referans & özet kartı

İhtiyacınız olan her şey, tek sayfada.

## İşletim sistemine göre tek satırlık config

`192.168.1.100` yerine SIEM'inizin IP'sini koyun.

| İS | Config dosyası | Eklenecek satırlar |
| --- | --- | --- |
| RHEL / CentOS / Rocky / Alma 6–9 | `/etc/rsyslog.d/99-siem.conf` | `auth,authpriv.* @@192.168.1.100:514`<br>`*.* @@192.168.1.100:514` |
| Debian | `/etc/rsyslog.d/99-siem.conf` | `auth,authpriv.* @@192.168.1.100:514`<br>`*.* @@192.168.1.100:514` |
| Ubuntu | `/etc/rsyslog.d/99-siem.conf` | `auth,authpriv.* @@192.168.1.100:514`<br>`*.* @@192.168.1.100:514` |
| FreeBSD (yerleşik syslogd, UDP) | `/etc/syslog.conf` | `auth.*;authpriv.* @192.168.1.100:514`<br>`*.* @192.168.1.100:514` |

## Yeniden başlatma ve durum komutları

| İS | Yeniden başlat | Açılışta etkinleştir |
| --- | --- | --- |
| RHEL 7/8/9 | `systemctl restart rsyslog` | `systemctl enable rsyslog` |
| RHEL 6 | `service rsyslog restart` | `chkconfig rsyslog on` |
| Debian / Ubuntu | `systemctl restart rsyslog` | `systemctl enable rsyslog` |
| FreeBSD | `service syslogd restart` | `sysrc syslogd_enable="YES"` |

## Yerel log dosyası konumları

| İS | Auth logu | Genel log |
| --- | --- | --- |
| RHEL 6–9 | `/var/log/secure` | `/var/log/messages` |
| Debian / Ubuntu | `/var/log/auth.log` | `/var/log/syslog` |
| FreeBSD | `/var/log/auth.log` | `/var/log/messages` |

## İlginizi çekecek facility'ler

| Facility | Anlamı |
| --- | --- |
| `auth` | Giriş/çıkış/şifre olayları |
| `authpriv` | Özel auth olayları (SSH/sudo ile giriş) |
| `kern` | Çekirdek |
| `daemon` | Arka plan servisleri |
| `user` | Kullanıcı programları |
| `cron` | Zamanlanmış işler |
| `*` | Her şey |

## Öncelikler (en kritik → en az kritik)

| Öncelik | Anlamı |
| --- | --- |
| `emerg` | Sistem kullanılamaz |
| `alert` | Hemen önlem alınmalı |
| `crit` | Kritik durum |
| `err` | Hata |
| `warning` | Uyarı |
| `notice` | Normal ama önemli |
| `info` | Bilgilendirme |
| `debug` | Hata ayıklama detayı |

## `@` vs `@@`

| Sözdizimi | Protokol | Ne zaman |
| --- | --- | --- |
| `@host:514` | UDP | SIEM UDP gerektiriyorsa; kayıp tolere edilebilir loglar için |
| `@@host:514` | TCP | Önerilir; güvenilir teslimat |

## Örnek SIEM panosu

Sunucularınız iletim yapmaya başladığında SIEM'iniz size şöyle bir görünüm verir.
(Bunlar **örnek sayılardır** — gerçek panonuz kendi verilerinizle dolar.)

<div class="chart-box">
  <canvas id="chart-logins"></canvas>
</div>

<div class="chart-box">
  <canvas id="chart-facilities"></canvas>
</div>

## Özet (TL;DR)

1. `/etc/rsyslog.d/99-siem.conf` dosyasında (FreeBSD'de `/etc/syslog.conf`) iki satırlık config'i oluşturun.
2. `rsyslogd -N1` (sözdizimi kontrolü).
3. Daemon'ı yeniden başlatın.
4. Bir giriş / hatalı şifre tetikleyin ve SIEM'e ulaştığını izleyin.
