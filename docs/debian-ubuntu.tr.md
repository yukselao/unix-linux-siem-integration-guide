---
title: Debian & Ubuntu
description: Auth ve sistem loglarını SIEM'inize iletmek için Debian ve Ubuntu üzerinde rsyslog yapılandırması.
---

# Debian & Ubuntu

**Debian** ve **Ubuntu** da varsayılan olarak **rsyslog** daemon'ını kullanır; bu
yüzden adımlar Red Hat ile neredeyse aynıdır. Tek gerçek farklar log dosyasının
konumu ve yeniden başlatma komutudur.

## Adım 1 — rsyslog'un kurulu olduğunu doğrulayın

```console
$ dpkg -l rsyslog | tail -1
ii  rsyslog   8.2402.0-1ubuntu2   amd64   reliable system and kernel logging daemon
```

Baştaki `ii` kurulu olduğu anlamına gelir.

## Adım 2 — SIEM config dosyasını oluşturun

```bash title="/etc/rsyslog.d/99-siem.conf"
# ---- Unix/Linux SIEM Entegrasyonu ----
# Kimlik doğrulama olaylarını gönder (giriş, çıkış, hatalı şifre)
auth,authpriv.*  @@192.168.1.100:514

# Tüm sistem loglarını gönder
*.*              @@192.168.1.100:514
```

!!! info "Bu satırlar ne anlama geliyor"
    - `@@` = **TCP**. Yalnızca UDP için tek `@` kullanın.
    - `192.168.1.100` = **SIEM'inizin IP'si** — değiştirin.
    - `514` = standart syslog portu.
    - `auth,authpriv.*` = her giriş/çıkış/şifre olayı.
    - `*.*` = diğer tüm sistem logları da.

## Adım 3 — Config'in geçerli olduğunu kontrol edin

```console
$ sudo rsyslogd -N1
rsyslogd: version 8.2402.0-1ubuntu2, config validation run (level 1), master config /etc/rsyslog.conf
rsyslogd: End of config validation run. Bye.
```

## Adım 4 — rsyslog'u yeniden başlatın

```console
$ sudo systemctl restart rsyslog
$ sudo systemctl enable rsyslog
Synchronizing state of rsyslog.service with SysV service script with /lib/systemd/systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install enable rsyslog
$ sudo systemctl status rsyslog
● rsyslog.service - System Logging Service
     Loaded: loaded (/lib/systemd/system/rsyslog.service; enabled; vendor preset: enabled)
     Active: active (running) since Mon 2026-10-06 14:35:10 UTC; 3s ago
```

!!! note "Eski Debian/Ubuntu sürümleri"
    Hâlâ SysV init kullanan çok eski sürümlerde (Debian 7 veya öncesi), `sudo
    service rsyslog restart` ile yeniden başlatın.

---

## Sadece Debian/Ubuntu'ya özgü notlar

### AppArmor

Ubuntu (ve AppArmor etkin Debian) rsyslog'u bir **AppArmor** profiliyle kısıtlar.
Varsayılan profil **ağ çıkışına izin verir**; bu yüzden yukarıdaki standart config
değişiklik yapmadan çalışır. Bir engellemeden şüphelenirseniz şuna bakın:

```console
$ sudo dmesg | grep -i apparmor | grep rsyslog
```

### Auth logların yeri

Debian/Ubuntu'da auth olayları **`/var/log/auth.log`** dosyasına yazılır (Red
Hat'ta `/var/log/secure`). Config'in çalıştığını doğrulamak için bu dosyayı
kullanacaksınız — bkz. [Test & doğrulama](verify.md).

```console
$ sudo tail -3 /var/log/auth.log
Oct  6 14:22:31 web-01 sshd[2914]: Accepted password for bob from 203.0.113.7 port 52217 ssh2
Oct  6 14:23:05 web-01 sshd[2931]: Failed password for root from 203.0.113.9 port 52240 ssh2
Oct  6 14:24:11 web-01 sudo:     bob : TTY=pts/0 ; PWD=/home/bob ; USER=root ; COMMAND=/usr/bin/ls
```

---

## Tamamlandı!

Şimdi çalıştığını doğrulayın — bkz. [Test & doğrulama](verify.md). SIEM'de hiçbir
şey görünmüyorsa [Sorun giderme](troubleshoot.md) sayfasına gidin.
