---
title: Test & doğrulama
description: Gerçek giriş ve hatalı şifre olayları tetikleyip SIEM'e aktığını izleyerek entegrasyonunuzun çalıştığını kanıtlayın.
---

# Test & doğrulama

Yapılandırmadan sonra **çalıştığını kanıtlayın** — üç adımda:

1. Zararsız bir test mesajı gönderin.
2. **Gerçek bir giriş** ve **gerçek bir hatalı şifre** tetikleyin.
3. Paketlerin sunucunuzdan çıktığını izleyin (ve SIEM'de göründüğünü doğrulayın).

---

## Adım 1 — Bir test mesajı gönderin

`logger` komutu, komut satırından syslog daemon'ına bir mesaj yazar:

```console
$ logger "SIEM entegrasyon testi: $(hostname)"
```

Çıktı yoksa başarılı demektir. Şimdi mesajı görmek için yerel logu kontrol edin:

=== "Red Hat"

    ```console
    $ tail -1 /var/log/messages
    Oct  6 14:40:02 web-01 root[3102]: SIEM entegrasyon testi: web-01
    ```

=== "Debian / Ubuntu"

    ```console
    $ tail -1 /var/log/syslog
    Oct  6 14:40:02 web-01 root[3102]: SIEM entegrasyon testi: web-01
    ```

Mesaj yerelde görünüyorsa rsyslog onu almıştır. SIEM'inizde `SIEM entegrasyon
testi` diye arayın — orada da görünmeli.

---

## Adım 2 — Gerçek bir giriş tetikleyin

**Başka bir makineden** SSH ile sunucuya giriş yapın:

```console
$ ssh bob@web-01
bob@web-01's password:
Last login: Mon Oct  6 14:22:31 2026 from 203.0.113.7
```

Ardından sunucuda giriş olayının kaydedildiğini doğrulayın:

=== "Red Hat (/var/log/secure)"

    ```console
    $ sudo tail -2 /var/log/secure
    Oct  6 14:50:12 web-01 sshd[3201]: Accepted password for bob from 203.0.113.7 port 52299 ssh2
    Oct  6 14:50:12 web-01 sshd[3201]: pam_unix(sshd:session): session opened for user bob by (uid=0)
    ```

=== "Debian / Ubuntu (/var/log/auth.log)"

    ```console
    $ sudo tail -2 /var/log/auth.log
    Oct  6 14:50:12 web-01 sshd[3201]: Accepted password for bob from 203.0.113.7 port 52299 ssh2
    Oct  6 14:50:12 web-01 sshd[3201]: pam_unix(sshd:session): session opened for user bob by (uid=0)
    ```

=== "FreeBSD (/var/log/auth.log)"

    ```console
    $ tail -2 /var/log/auth.log
    Oct  6 14:50:12 web-01 sshd[3201]: Accepted password for bob from 203.0.113.7 port 52299 ssh2
    ```

Kilit satır **`Accepted password for bob`** — SIEM'inizin artık başarılı bir giriş
olarak göstermesi gereken tam olarak budur.

---

## Adım 3 — Hatalı bir şifre tetikleyin (asıl istediğiniz bu)

**Yanlış bir şifreyle** (veya var olmayan bir kullanıcıyla) giriş deneyin:

```console
$ ssh bob@web-01
bob@web-01's password:   # buraya yanlış bir şifre yazın
Permission denied, please try again.
```

Sunucuda artık **hatalı şifre** kayıtlarını göreceksiniz:

=== "Red Hat (/var/log/secure)"

    ```console
    $ sudo tail -2 /var/log/secure
    Oct  6 14:55:03 web-01 sshd[3244]: Failed password for bob from 203.0.113.7 port 52310 ssh2
    Oct  6 14:55:09 web-01 sshd[3244]: Failed password for invalid user admin from 203.0.113.7 port 52310 ssh2
    ```

=== "Debian / Ubuntu (/var/log/auth.log)"

    ```console
    $ sudo tail -2 /var/log/auth.log
    Oct  6 14:55:03 web-01 sshd[3244]: Failed password for bob from 203.0.113.7 port 52310 ssh2
    Oct  6 14:55:09 web-01 sshd[3244]: Failed password for invalid user admin from 203.0.113.7 port 52310 ssh2
    ```

!!! success "İşte asıl istediğiniz satır"
    `Failed password for ...` SIEM'de görmek istediğiniz olaydır. SIEM'de
    görünüyorsa entegrasyonunuz **çalışıyor** demektir.

---

## Adım 4 — Paketlerin sunucudan çıktığını izleyin

Olaylar yerelde görünüp SIEM'de **görünmüyorsa**, paketlerin sunucunuzdan gerçekten
çıkıp çıkmadığını kontrol edin. Trafik yakalarken bir `logger` tetikleyin:

```console
$ sudo tcpdump -i any -n 'port 514' -c 3
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on any, link-type LINUX_SLL (Linux cooked v1), capture size 262144 bytes
14:58:01.123456 IP 192.168.1.50.514 > 192.168.1.100.514: UDP, length 186
14:58:01.124001 IP 192.168.1.50.514 > 192.168.1.100.514: UDP, length 191
```

SIEM'inizin IP'sine (`192.168.1.100`) giden satırları görmelisiniz. TCP
kullanıyorsanız bağlantının kurulduğunu doğrulayın:

```console
$ ss -tnp | grep 514
ESTAB  0  0  192.168.1.50:39750  192.168.1.100:514  users:(("rsyslogd",pid=812,fd=7))
```

---

## Adım 5 — SIEM'de doğrulayın

SIEM'inizde şunları arayın:

- sunucunuzun host adı (`web-01`), veya
- tam olarak `SIEM entegrasyon testi` dizesi, veya
- `Failed password` / `Accepted password`.

!!! note "Bir dakika tanıyın"
    Bazı SIEM'ler olayları kısa bir süre ara belleğe alır veya indeksler. Hemen
    görünmüyorsa 30–60 saniye bekleyip tekrar arayın.

Hâlâ görünmüyorsa [Sorun giderme](troubleshoot.md) sayfasına gidin.
