---
title: Reference & cheat sheet
description: Quick lookup tables for the Unix/Linux SIEM integration guide.
---

# Reference & cheat sheet

Everything you need, on one page.

## One-line config per OS

Replace `192.168.1.100` with your SIEM's IP.

| OS | Config file | Lines to add |
| --- | --- | --- |
| RHEL / CentOS / Rocky / Alma 6–9 | `/etc/rsyslog.d/99-siem.conf` | `auth,authpriv.* @@192.168.1.100:514`<br>`*.* @@192.168.1.100:514` |
| Debian | `/etc/rsyslog.d/99-siem.conf` | `auth,authpriv.* @@192.168.1.100:514`<br>`*.* @@192.168.1.100:514` |
| Ubuntu | `/etc/rsyslog.d/99-siem.conf` | `auth,authpriv.* @@192.168.1.100:514`<br>`*.* @@192.168.1.100:514` |
| FreeBSD (native syslogd, UDP) | `/etc/syslog.conf` | `auth.*;authpriv.* @192.168.1.100:514`<br>`*.* @192.168.1.100:514` |

## Restart & status commands

| OS | Restart | Enable at boot |
| --- | --- | --- |
| RHEL 7/8/9 | `systemctl restart rsyslog` | `systemctl enable rsyslog` |
| RHEL 6 | `service rsyslog restart` | `chkconfig rsyslog on` |
| Debian / Ubuntu | `systemctl restart rsyslog` | `systemctl enable rsyslog` |
| FreeBSD | `service syslogd restart` | `sysrc syslogd_enable="YES"` |

## Local log file locations

| OS | Auth log | General log |
| --- | --- | --- |
| RHEL 6–9 | `/var/log/secure` | `/var/log/messages` |
| Debian / Ubuntu | `/var/log/auth.log` | `/var/log/syslog` |
| FreeBSD | `/var/log/auth.log` | `/var/log/messages` |

## Facilities you'll care about

| Facility | Meaning |
| --- | --- |
| `auth` | Login/logout/password events |
| `authpriv` | Private auth events (login via SSH/sudo) |
| `kern` | Kernel |
| `daemon` | Background services |
| `user` | User programs |
| `cron` | Scheduled jobs |
| `*` | Everything |

## Priorities (most → least critical)

| Priority | Meaning |
| --- | --- |
| `emerg` | System unusable |
| `alert` | Action must be taken immediately |
| `crit` | Critical condition |
| `err` | Error |
| `warning` | Warning |
| `notice` | Normal but significant |
| `info` | Informational |
| `debug` | Debug detail |

## `@` vs `@@`

| Syntax | Protocol | When to use |
| --- | --- | --- |
| `@host:514` | UDP | SIEM requires UDP; ok for loss-tolerant logs |
| `@@host:514` | TCP | Recommended; reliable delivery |

## Example SIEM dashboard

Once your servers are forwarding, this is the kind of view your SIEM gives you.
(These are **sample numbers** — your real dashboard fills in from your own data.)

<div class="chart-box">
  <canvas id="chart-logins"></canvas>
</div>

<div class="chart-box">
  <canvas id="chart-facilities"></canvas>
</div>

## TL;DR

1. Create the two-line config in `/etc/rsyslog.d/99-siem.conf` (or `/etc/syslog.conf` on FreeBSD).
2. `rsyslogd -N1` (syntax check).
3. Restart the daemon.
4. Trigger a login / failed password and watch it arrive in the SIEM.
