---
title: Home
description: Forward authentication and system logs from your Unix/Linux servers to your SIEM — the simple, copy-paste guide.
---

# Unix/Linux SIEM Integration Guide

**Send your server's login and system logs to your SIEM — the easy way.**

This guide shows a system administrator how to forward **authentication logs** (who
logged in, who failed to log in) and **system logs** from their servers to a central
**SIEM** (Security Information and Event Management) system. It is written for
beginners: every step has a copy-paste command **and** the real output you should expect.

When it is done, every **successful login**, **logout**, and **failed password
attempt** on your servers will show up in your SIEM.

## What you get

- :white_check_mark: Logins and failed-password attempts visible in the SIEM
- :white_check_mark: One small config file per server — no agents, no paid tools
- :white_check_mark: Uses the built-in logger already on every Unix/Linux system
- :white_check_mark: Step-by-step for **FreeBSD**, **RHEL 6/7/8/9**, **Debian**, and **Ubuntu**

## Supported systems

| Operating system | Logging daemon | Where you add the config | How to restart |
| --- | --- | --- | --- |
| RHEL / CentOS / Rocky / Alma 6–9 | `rsyslog` | `/etc/rsyslog.d/` | `systemctl` (RHEL 6: `service`) |
| Debian | `rsyslog` | `/etc/rsyslog.d/` | `systemctl` |
| Ubuntu | `rsyslog` | `/etc/rsyslog.d/` | `systemctl` |
| FreeBSD | `syslogd` | `/etc/syslog.conf` | `service syslogd` |

## The 30-second version

The whole job is **two lines**. On a Linux server, create this file:

```bash title="/etc/rsyslog.d/99-siem.conf"
# Send ALL authentication events (login, logout, failed password)
auth,authpriv.*  @@192.168.1.100:514

# Send ALL system logs too
*.*              @@192.168.1.100:514
```

Then restart the logger:

```console
$ sudo systemctl restart rsyslog
```

!!! info "Replace the IP address"
    `192.168.1.100` is an **example**. Change it to your SIEM's real IP address
    (or hostname). `514` is the standard syslog port — change it only if your SIEM
    listens on a different port.

That's it. Now **read the guide below** to do it properly for your exact system,
test it, and fix anything that goes wrong.

## Before you start — what you need

1. **SIEM IP address and port** — ask your SIEM administrator. Default port is `514`.
2. **Root (or sudo) access** on the server you are configuring.
3. **Network access** — the server must be able to reach the SIEM on the syslog port.
4. (Recommended) **Correct time** — enable NTP so your events have the right timestamp.

## How to use this guide

| You want to… | Go to |
| --- | --- |
| Understand what the config does | [How it works](how-it-works.md) |
| Configure RHEL / CentOS / Rocky / Alma | [Red Hat (RHEL 6–9)](redhat.md) |
| Configure Debian or Ubuntu | [Debian & Ubuntu](debian-ubuntu.md) |
| Configure FreeBSD | [FreeBSD](freebsd.md) |
| Prove it works (see a login in the SIEM) | [Test & verify](verify.md) |
| Fix it when nothing appears | [Troubleshooting](troubleshoot.md) |
| Quick lookup tables & cheat sheet | [Reference & cheat sheet](reference.md) |
