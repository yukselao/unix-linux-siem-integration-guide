---
title: Debian & Ubuntu
description: Configure rsyslog on Debian and Ubuntu to forward auth and system logs to your SIEM.
---

# Debian & Ubuntu

**Debian** and **Ubuntu** also use the **rsyslog** daemon by default, so the steps
are almost identical to Red Hat. The only real differences are the log file
location and the restart command.

## Step 1 — Confirm rsyslog is installed

```console
$ dpkg -l rsyslog | tail -1
ii  rsyslog   8.2402.0-1ubuntu2   amd64   reliable system and kernel logging daemon
```

The `ii` at the start means it is installed.

## Step 2 — Create the SIEM config file

```bash title="/etc/rsyslog.d/99-siem.conf"
# ---- Unix/Linux SIEM Integration ----
# Forward authentication events (login, logout, failed password)
auth,authpriv.*  @@192.168.1.100:514

# Forward all system logs
*.*              @@192.168.1.100:514
```

!!! info "What these lines mean"
    - `@@` = **TCP**. Use a single `@` only for UDP.
    - `192.168.1.100` = **your SIEM's IP** — replace it.
    - `514` = the standard syslog port.
    - `auth,authpriv.*` = every login/logout/password event.
    - `*.*` = every other system log too.

## Step 3 — Check the config is valid

```console
$ sudo rsyslogd -N1
rsyslogd: version 8.2402.0-1ubuntu2, config validation run (level 1), master config /etc/rsyslog.conf
rsyslogd: End of config validation run. Bye.
```

## Step 4 — Restart rsyslog

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

!!! note "Older Debian/Ubuntu releases"
    On very old releases (Debian 7 or earlier) that still use SysV init, restart
    with `sudo service rsyslog restart` instead.

---

## Debian/Ubuntu-only notes

### AppArmor

Ubuntu (and Debian with AppArmor enabled) confines rsyslog with an **AppArmor**
profile. The default profile **allows network output**, so the standard config
above works without changes. If you suspect a denial, look here:

```console
$ sudo dmesg | grep -i apparmor | grep rsyslog
```

### Where auth logs live

On Debian/Ubuntu, auth events are written to **`/var/log/auth.log`** (on Red Hat
it is `/var/log/secure`). You'll use this file to confirm the config works — see
[Test & verify](verify.md).

```console
$ sudo tail -3 /var/log/auth.log
Oct  6 14:22:31 web-01 sshd[2914]: Accepted password for bob from 203.0.113.7 port 52217 ssh2
Oct  6 14:23:05 web-01 sshd[2931]: Failed password for root from 203.0.113.9 port 52240 ssh2
Oct  6 14:24:11 web-01 sudo:     bob : TTY=pts/0 ; PWD=/home/bob ; USER=root ; COMMAND=/usr/bin/ls
```

---

## Done!

Now verify it works — see [Test & verify](verify.md). If nothing appears in the
SIEM, go to [Troubleshooting](troubleshoot.md).
