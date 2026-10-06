---
title: Sorun giderme
description: Logların SIEM'inizde görünmemesinin en yaygın nedenlerini düzeltin.
---

# Sorun giderme

Bunları **sırayla** uygulayın. Çoğu sorun 1. veya 2. adımda çözülür.

## 1. Config geçerli mi?

Sözdizimi kontrolünü çalıştırın. Yazım hatası varsa rsyslog tam satırı söyler:

```console
$ sudo rsyslogd -N1
rsyslogd: error during parsing file /etc/rsyslog.d/99-siem.conf, on or before line 2: invalid character '@' in object definition - is there an invalid escape sequence somewhere?
rsyslogd: run failed with error -2111 (see rsyslog.h or try http://www.rsyslog.com/e/2111)
```

Belirttiği satırı düzeltin ve şunu görene kadar tekrar kontrol edin:

```console
rsyslogd: End of config validation run. Bye.
```

## 2. Servis çalışıyor mu?

=== "RHEL 7+ / Debian / Ubuntu (systemd)"

    ```console
    $ systemctl status rsyslog
    ● rsyslog.service - System Logging Service
         Loaded: loaded (/lib/systemd/system/rsyslog.service; enabled; vendor preset: enabled)
         Active: active (running) since Mon 2026-10-06 14:30:02 UTC; 4s ago
    ```

    **`Active: active (running)`** yazısına bakın. Başarısızsa nedenini okuyun:

    ```console
    $ journalctl -u rsyslog -n 30 --no-pager
    ```

=== "RHEL 6 (init.d)"

    ```console
    $ service rsyslog status
    rsyslogd (pid  812) is running...
    ```

=== "FreeBSD"

    ```console
    $ service syslogd status
    syslogd is running as pid 862.
    ```

## 3. Sunucu SIEM'e hiç ulaşabiliyor mu?

Ağ yolunu doğrudan test edin. **TCP** için:

```console
$ nc -vz 192.168.1.100 514
Connection to 192.168.1.100 514 port [tcp/syslog] succeeded!
```

Zaman aşımı veya red, firewall ya da ağ sorunu anlamına gelir:

```console
$ nc -vz 192.168.1.100 514
nc: connect to 192.168.1.100 port 514 (tcp) failed: Connection timed out
```

**UDP** için `nc -vzu 192.168.1.100 514` kullanın. Bunlar başarısız olursa,
rsyslog'a dokunmadan önce ağ yolunu düzeltin (SIEM'deki firewall, ana bilgisayar
firewall'u veya yönlendirme).

## 4. Paketler sunucudan gerçekten çıkıyor mu?

Bir test mesajı tetiklerken trafiği yakalayın:

```console
$ sudo tcpdump -i any -n 'port 514' -c 3
```

**Hiç paket görünmüyorsa**, rsyslog göndermiyor demektir (1–2. adımları tekrar
kontrol edin). Paketler görünüp SIEM hiçbir şey göstermiyorsa sorun SIEM
tarafındadır (dinleyici, port veya protokol uyuşmazlığı).

## 5. UDP vs TCP uyuşmazlığı

"Loglar görünmüyor" sorununun **en yaygın** nedeni: siz TCP (`@@`) yapılandırdınız
ama SIEM UDP dinliyor, ya da tam tersi.

| Config'iniz | SIEM şunu dinlemeli |
| --- | --- |
| `@host:514` (tek `@`) | UDP |
| `@@host:514` (çift `@`) | TCP |

SIEM yöneticinize hangi protokol ve portun kullanılacağını sorun ve config'inizi
buna uydurun.

## 6. SELinux engelliyor (yalnızca Red Hat)

```console
$ sudo ausearch -m avc -ts recent | grep rsyslog
type=AVC msg=audit(…): avc:  denied  { name_connect } for pid=812 comm="rsyslogd" …
```

`denied … rsyslogd` görüyor ve **standart olmayan bir port** kullanıyorsanız ekleyin:

```console
$ sudo semanage port -a -t syslogd_port_t -p tcp 30514
```

## 7. AppArmor engelliyor (Ubuntu/Debian)

```console
$ sudo dmesg | grep -i apparmor | grep rsyslog
[ 1234.567890] audit: type=1400 … apparmor="DENIED" operation="connect" … name="rsyslogd"
```

Varsayılan config'i kullanırken bir engelleme görürseniz profilin durumunu kontrol edin:

```console
$ sudo aa-status | grep rsyslog
```

## 8. SIEM'de yanlış zaman damgaları

Olaylar geliyor ama saat yanlışsa (saatlerce sapma), sunucu saati yanlıştır.
NTP'yi açın:

=== "RHEL 7+ / Debian / Ubuntu"

    ```console
    $ sudo timedatectl set-ntp true
    $ timedatectl
                   Local time: Mon 2026-10-06 14:30:02 UTC
               Universal time: Mon 2026-10-06 14:30:02 UTC
    System clock synchronized: yes
    ```

=== "RHEL 6"

    ```console
    $ sudo ntpdate 0.pool.ntp.org && sudo service ntpd start
    ```

=== "FreeBSD"

    ```console
    $ sudo ntpdate 0.freebsd.pool.ntp.org && sudo service ntpd start
    ```

## 9. FreeBSD: syslogd açılışta etkin değil

Yeniden başlatmadan sonra iletim duruyorsa syslogd etkin değildir:

```console
$ sysrc syslogd_enable="YES"
syslogd_enable:  -> YES
```

!!! note "`-s` bayrağı sorun değil"
    FreeBSD'nin varsayılan `syslogd_flags="-s"` ayarı yalnızca daemon'ın uzak
    logları **almasını** durdurur. Giden iletimi **durdurmaz**; o yüzden dokunmayın.

---

Hâlâ takıldınız mı? [İşletim sisteminizin config'ini](redhat.md) tekrar kontrol edin
veya SIEM tarafını SIEM yöneticinizle doğrulayın.
