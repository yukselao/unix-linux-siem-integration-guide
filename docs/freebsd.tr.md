---
title: FreeBSD
description: Yerleşik syslogd (veya TCP/TLS için pkg'den rsyslog) kullanarak FreeBSD'de auth ve sistem loglarını SIEM'inize iletin.
---

# FreeBSD

FreeBSD, rsyslog yerine kendi yerleşik loglayıcısı **`syslogd`**'yi kullanır.
Yapılandırma dosyası `/etc/syslog.conf`'dur.

!!! warning "Yerleşik syslogd = yalnızca UDP"
    FreeBSD'nin yerleşik `syslogd`'si logları **yalnızca UDP** üzerinden iletir.
    SIEM'iniz **TCP** veya **TLS** gerektiriyorsa, paket yöneticisinden `rsyslog`
    kurun (bu sayfanın altında gösteriliyor) ve Linux ile aynı config'i kullanın.

## Adım 1 — syslogd'nin çalıştığını kontrol edin

```console
# service syslogd status
syslogd is running as pid 862.
```

Açılışta etkin değilse emin olun:

```console
# sysrc syslogd_enable="YES"
syslogd_enable:  -> YES
```

## Adım 2 — /etc/syslog.conf dosyasını düzenleyin

`/etc/syslog.conf` dosyasının sonuna şu satırları ekleyin:

```text title="/etc/syslog.conf"
# ---- Unix/Linux SIEM Entegrasyonu ----
# Kimlik doğrulama olaylarını gönder (giriş, çıkış, hatalı şifre)
auth.*;authpriv.*   @192.168.1.100:514

# Tüm sistem loglarını gönder
*.*                 @192.168.1.100:514
```

!!! info "Bu satırlar ne anlama geliyor"
    - `@` = **uzak bir ana bilgisayara** gönder (FreeBSD, UDP için tek `@` kullanır).
    - `192.168.1.100:514` = **SIEM'inizin IP'si** ve portu — IP'yi değiştirin.
    - `auth.*;authpriv.*` = her giriş/çıkış/şifre olayı.
    - `*.*` = diğer tüm sistem logları da.
    - Seçicileri FreeBSD'de virgülle değil **noktalı virgülle** `;` ayırın.

## Adım 3 — syslogd'yi yeniden başlatın

```console
# service syslogd restart
Stopping syslogd.
Waiting for PIDS: 862.
Starting syslogd.
```

## Adım 4 — Auth logların yazıldığını doğrulayın

FreeBSD, auth olaylarını `/var/log/auth.log` dosyasına yazar:

```console
# tail -3 /var/log/auth.log
Oct  6 14:22:31 web-01 sshd[2914]: Accepted password for bob from 203.0.113.7 port 52217 ssh2
Oct  6 14:23:05 web-01 sshd[2931]: Failed password for root from 203.0.113.9 port 52240 ssh2
```

---

## Seçenek B — TCP / TLS için rsyslog kullanın

**TCP** veya **TLS** gerekiyorsa rsyslog'u kurun ve Linux ile birebir aynı
config'i kullanın:

```console
# pkg install rsyslog
Updating FreeBSD repository catalogue...
FreeBSD repository is up to date.
...
# sysrc rsyslogd_enable="YES"
rsyslogd_enable:  -> YES
# service rsyslogd start
Starting rsyslogd.
```

Ardından **TCP** (`@@`) ile config'i oluşturun:

```bash title="/usr/local/etc/rsyslog.d/99-siem.conf"
auth,authpriv.*  @@192.168.1.100:514
*.*              @@192.168.1.100:514
```

Ve yeniden başlatın:

```console
# service rsyslogd restart
```

---

## Tamamlandı!

Şimdi çalıştığını doğrulayın — bkz. [Test & doğrulama](verify.md). SIEM'de hiçbir
şey görünmüyorsa [Sorun giderme](troubleshoot.md) sayfasına gidin.
