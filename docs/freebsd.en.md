---
title: FreeBSD
description: Forward auth and system logs to your SIEM on FreeBSD using the native syslogd (or rsyslog from pkg for TCP/TLS).
---

# FreeBSD

FreeBSD uses its own built-in logger, **`syslogd`**, instead of rsyslog. The
configuration file is `/etc/syslog.conf`.

!!! warning "Native syslogd = UDP only"
    FreeBSD's built-in `syslogd` forwards logs over **UDP only**. If your SIEM
    requires **TCP** or **TLS**, install `rsyslog` from the package manager (shown
    at the bottom of this page) and use the same config as Linux.

## Step 1 — Check syslogd is running

```console
# service syslogd status
syslogd is running as pid 862.
```

If it isn't enabled at boot, make sure:

```console
# sysrc syslogd_enable="YES"
syslogd_enable:  -> YES
```

## Step 2 — Edit /etc/syslog.conf

Add these lines to the end of `/etc/syslog.conf`:

```text title="/etc/syslog.conf"
# ---- Unix/Linux SIEM Integration ----
# Forward authentication events (login, logout, failed password)
auth.*;authpriv.*   @192.168.1.100:514

# Forward all system logs
*.*                 @192.168.1.100:514
```

!!! info "What these lines mean"
    - `@` = forward to a **remote host** (FreeBSD uses a single `@` for UDP).
    - `192.168.1.100:514` = **your SIEM's IP** and port — replace the IP.
    - `auth.*;authpriv.*` = every login/logout/password event.
    - `*.*` = every other system log too.
    - Separate selectors with a **semicolon** `;` (not a comma) on FreeBSD.

## Step 3 — Restart syslogd

```console
# service syslogd restart
Stopping syslogd.
Waiting for PIDS: 862.
Starting syslogd.
```

## Step 4 — Confirm auth logs are being written

FreeBSD writes auth events to `/var/log/auth.log`:

```console
# tail -3 /var/log/auth.log
Oct  6 14:22:31 web-01 sshd[2914]: Accepted password for bob from 203.0.113.7 port 52217 ssh2
Oct  6 14:23:05 web-01 sshd[2931]: Failed password for root from 203.0.113.9 port 52240 ssh2
```

---

## Option B — use rsyslog for TCP / TLS

If you need **TCP** or **TLS**, install rsyslog and use the exact same config as
Linux:

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

Then create the config with **TCP** (`@@`):

```bash title="/usr/local/etc/rsyslog.d/99-siem.conf"
auth,authpriv.*  @@192.168.1.100:514
*.*              @@192.168.1.100:514
```

And restart:

```console
# service rsyslogd restart
```

---

## Done!

Now verify it works — see [Test & verify](verify.md). If nothing appears in the
SIEM, go to [Troubleshooting](troubleshoot.md).
