---
title: Red Hat (RHEL 6–9)
description: RHEL, CentOS, Rocky Linux ve AlmaLinux 6.x ila 9.x üzerinde auth ve sistem loglarını SIEM'e iletmek için rsyslog yapılandırması.
---

# Red Hat — RHEL 6.x / 7.x / 8.x / 9.x

Bu sayfa **RHEL** ile ücretsiz türevleri **CentOS**, **Rocky Linux** ve
**AlmaLinux**'un **6 ile 9** arası sürümlerini kapsar. Hepsi varsayılan olarak
**rsyslog** daemon'ını içerir; yani kurulacak bir şey yoktur.

!!! note "Sürümler arasındaki iki küçük fark"
    - **RHEL 6** `service rsyslog restart` (init.d) kullanır. **RHEL 7, 8, 9**
      `systemctl restart rsyslog` (systemd) kullanır.
    - rsyslog **sürümü** farklıdır ama config dosyası hepsinde aynıdır.

---

## Adım 1 — rsyslog'un kurulu olduğunu doğrulayın

```console
# rpm -q rsyslog
rsyslog-8.2102.0-13.el8.x86_64
```

Bir paket adı ve sürüm görürseniz hazırsınız. RHEL 6'da şöyle görünür:

```console
# rpm -q rsyslog
rsyslog-5.8.10-10.el6_6.x86_64
```

## Adım 2 — SIEM config dosyasını oluşturun

Tek bir yeni dosya oluşturun (adı `.conf` ile bitmeli):

```bash title="/etc/rsyslog.d/99-siem.conf"
# ---- Unix/Linux SIEM Entegrasyonu ----
# Kimlik doğrulama olaylarını gönder (giriş, çıkış, hatalı şifre)
auth,authpriv.*  @@192.168.1.100:514

# Tüm sistem loglarını gönder
*.*              @@192.168.1.100:514
```

!!! info "Bu satırlar ne anlama geliyor"
    - `@@` = **TCP** üzerinden gönder (güvenilir). Yalnızca SIEM'iniz UDP
      istiyorsa tek `@` kullanın.
    - `192.168.1.100` = **SIEM'inizin IP'si**. Değiştirin.
    - `514` = standart syslog portu.
    - `auth,authpriv.*` = her giriş/çıkış/şifre olayı.
    - `*.*` = diğer tüm sistem logları da.

??? tip "UDP istiyor musunuz?"
    İlk `@` çiftini tek `@` ile değiştirin:

    ```text
    auth,authpriv.*  @192.168.1.100:514
    *.*              @192.168.1.100:514
    ```

## Adım 3 — Config'in geçerli olduğunu kontrol edin

Yeniden başlatmadan önce bunu mutlaka yapın — yazım hatalarını yakalar:

```console
# rsyslogd -N1
rsyslogd: version 8.2102.0-13.el8, config validation run (level 1), master config /etc/rsyslog.conf
rsyslogd: End of config validation run. Bye.
```

`End of config validation run. Bye.` satırı (**üstünde hata olmadan**) config'in
doğru olduğu anlamına gelir.

## Adım 4 — rsyslog'u yeniden başlatın

=== "RHEL 7 / 8 / 9 (systemd)"

    ```console
    # systemctl restart rsyslog
    # systemctl enable rsyslog
    Created symlink /etc/systemd/system/multi-user.target.wants/rsyslog.service → /usr/lib/systemd/system/rsyslog.service.
    # systemctl status rsyslog
    ● rsyslog.service - System Logging Service
       Loaded: loaded (/usr/lib/systemd/system/rsyslog.service; enabled; vendor preset: enabled)
       Active: active (running) since Mon 2026-10-06 14:30:02 UTC; 4s ago
    ```

=== "RHEL 6 (init.d)"

    ```console
    # service rsyslog restart
    Shutting down system logger:                               [  OK  ]
    Starting system logger:                                    [  OK  ]
    # chkconfig rsyslog on
    ```

---

## Sadece RHEL'e özgü notlar

### SELinux

RHEL'de SELinux varsayılan olarak **enforcing** durumdadır. İyi haber: standart
`514` portundan log göndermek **zaten izinlidir** — değişiklik gerekmez.

Yalnızca **özel bir port** kullanıyorsanız SELinux'a bildirmeniz gerekir:

```console
# semanage port -a -t syslogd_port_t -p tcp 30514
```

SELinux'un engellediğinden şüphelenirseniz audit logunu kontrol edin:

```console
# ausearch -m avc -ts recent | grep rsyslog
```

### firewalld

Giden trafik normalde serbesttir; bu yüzden istemci genellikle **hiçbir** firewall
değişikliği gerektirmez. Eğer ana bilgisayarınızda katı bir giden trafik politikası
varsa portu açın:

```console
# firewall-cmd --permanent --add-port=514/tcp
success
# firewall-cmd --reload
success
```

---

## Tamamlandı!

Şimdi çalıştığını doğrulayın — bkz. [Test & doğrulama](verify.md). SIEM'de hiçbir
şey görünmüyorsa [Sorun giderme](troubleshoot.md) sayfasına gidin.
