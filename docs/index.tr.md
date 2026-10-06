---
title: Ana Sayfa
description: Unix/Linux sunucularınızdaki kimlik doğrulama ve sistem loglarını SIEM'inize iletin — basit, kopyala-yapıştır rehberi.
---

# Unix/Linux SIEM Entegrasyon Rehberi

**Sunucunuzun giriş ve sistem loglarını SIEM'inize gönderin — en kolay yoluyla.**

Bu rehber, bir sistem yöneticisine **kimlik doğrulama loglarını** (kim giriş yaptı,
kimin şifresi yanlış) ve **sistem loglarını** merkezi bir **SIEM** (Security
Information and Event Management) sistemine nasıl ileteceğini gösterir. Yeni
başlayanlar için yazılmıştır: her adımda kopyala-yapıştır bir komut **ve**
görmeniz gereken gerçek çıktı vardır.

İşlem bittiğinde, sunucularınızdaki her **başarılı giriş**, **çıkış** ve **hatalı
şifre denemesi** SIEM'inizde görünür.

## Ne elde edersiniz

- :white_check_mark: Girişler ve hatalı şifre denemeleri SIEM'de görünür
- :white_check_mark: Sunucu başına tek bir küçük config dosyası — ajan yok, ücretli araç yok
- :white_check_mark: Her Unix/Linux sistemde zaten kurulu olan loglayıcıyı kullanır
- :white_check_mark: **FreeBSD**, **RHEL 6/7/8/9**, **Debian** ve **Ubuntu** için adım adım

## Desteklenen sistemler

| İşletim sistemi | Loglama servisi | Config'i nereye ekleyeceksiniz | Nasıl yeniden başlatılır |
| --- | --- | --- | --- |
| RHEL / CentOS / Rocky / Alma 6–9 | `rsyslog` | `/etc/rsyslog.d/` | `systemctl` (RHEL 6: `service`) |
| Debian | `rsyslog` | `/etc/rsyslog.d/` | `systemctl` |
| Ubuntu | `rsyslog` | `/etc/rsyslog.d/` | `systemctl` |
| FreeBSD | `syslogd` | `/etc/syslog.conf` | `service syslogd` |

## 30 saniyelik özet

Bütün iş **iki satır**. Bir Linux sunucusunda şu dosyayı oluşturun:

```bash title="/etc/rsyslog.d/99-siem.conf"
# TÜM kimlik doğrulama olaylarını gönder (giriş, çıkış, hatalı şifre)
auth,authpriv.*  @@192.168.1.100:514

# TÜM sistem loglarını da gönder
*.*              @@192.168.1.100:514
```

Ardından loglayıcıyı yeniden başlatın:

```console
$ sudo systemctl restart rsyslog
```

!!! info "IP adresini değiştirin"
    `192.168.1.100` bir **örnektir**. Bunu SIEM'inizin gerçek IP adresiyle
    (veya host adıyla) değiştirin. `514` standart syslog portudur — SIEM'iniz
    farklı bir port dinliyorsa onu değiştirin.

Hepsi bu. Şimdi **aşağıdaki rehberi okuyarak** kendi sisteminiz için doğru şekilde
yapın, test edin ve aksayan her şeyi düzeltin.

## Başlamadan önce — gerekenler

1. **SIEM IP adresi ve portu** — SIEM yöneticinizden isteyin. Varsayılan port `514`'tür.
2. Yapılandırdığınız sunucuda **root (veya sudo) erişimi**.
3. **Ağ erişimi** — sunucu, syslog portundan SIEM'e ulaşabilmeli.
4. (Önerilir) **Doğru saat** — olaylarınızın doğru zaman damgasına sahip olması için NTP'yi açın.

## Bu rehber nasıl kullanılır

| İstediğiniz | Gidin |
| --- | --- |
| Config'in ne yaptığını anlamak | [Nasıl çalışır](how-it-works.md) |
| RHEL / CentOS / Rocky / Alma yapılandırma | [Red Hat (RHEL 6–9)](redhat.md) |
| Debian veya Ubuntu yapılandırma | [Debian & Ubuntu](debian-ubuntu.md) |
| FreeBSD yapılandırma | [FreeBSD](freebsd.md) |
| Çalıştığını kanıtlamak (SIEM'de bir giriş görmek) | [Test & doğrulama](verify.md) |
| Hiçbir şey görünmüyorsa düzeltmek | [Sorun giderme](troubleshoot.md) |
| Hızlı tablolar ve özet kartı | [Referans & özet kartı](reference.md) |
