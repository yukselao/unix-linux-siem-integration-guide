---
title: Red Hat (RHEL 6–9)
description: Configure rsyslog on RHEL, CentOS, Rocky Linux and AlmaLinux 6.x to 9.x to forward auth and system logs to your SIEM.
---

# Red Hat — RHEL 6.x / 7.x / 8.x / 9.x

This page covers **RHEL** and its free rebuilds: **CentOS**, **Rocky Linux** and
**AlmaLinux**, versions **6 through 9**. All of them ship the **rsyslog** daemon
by default, so there is nothing to install.

!!! note "Two small differences between versions"
    - **RHEL 6** uses `service rsyslog restart` (init.d). **RHEL 7, 8, 9** use
      `systemctl restart rsyslog` (systemd).
    - The rsyslog **version** differs, but the config file is identical on all of them.

---

## Step 1 — Confirm rsyslog is installed

```console
# rpm -q rsyslog
rsyslog-8.2102.0-13.el8.x86_64
```

If you see a package name and version, you're good. On RHEL 6 it looks like this:

```console
# rpm -q rsyslog
rsyslog-5.8.10-10.el6_6.x86_64
```

## Step 2 — Create the SIEM config file

Create one new file (the name must end in `.conf`):

```bash title="/etc/rsyslog.d/99-siem.conf"
# ---- Unix/Linux SIEM Integration ----
# Forward authentication events (login, logout, failed password)
auth,authpriv.*  @@192.168.1.100:514

# Forward all system logs
*.*              @@192.168.1.100:514
```

!!! info "What these lines mean"
    - `@@` = send over **TCP** (reliable). Use a single `@` only if your SIEM needs UDP.
    - `192.168.1.100` = **your SIEM's IP**. Replace it.
    - `514` = the standard syslog port.
    - `auth,authpriv.*` = every login/logout/password event.
    - `*.*` = every other system log too.

??? tip "Want UDP instead of TCP?"
    Change the first `@` pair to a single `@`:

    ```text
    auth,authpriv.*  @192.168.1.100:514
    *.*              @192.168.1.100:514
    ```

## Step 3 — Check the config is valid

Always do this before restarting — it catches typos:

```console
# rsyslogd -N1
rsyslogd: version 8.2102.0-13.el8, config validation run (level 1), master config /etc/rsyslog.conf
rsyslogd: End of config validation run. Bye.
```

The last line `End of config validation run. Bye.` (with **no error above it**)
means the config is fine.

## Step 4 — Restart rsyslog

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

## RHEL-only notes

### SELinux

On RHEL, SELinux is **enforcing** by default. Good news: sending logs on the
standard port `514` is **already allowed** — no change needed.

Only if you use a **custom port** do you need to tell SELinux:

```console
# semanage port -a -t syslogd_port_t -p tcp 30514
```

If you ever suspect SELinux is blocking, check the audit log:

```console
# ausearch -m avc -ts recent | grep rsyslog
```

### firewalld

Outbound traffic is normally allowed, so the client usually needs **no** firewall
change. If your host has a strict outbound policy, allow the port:

```console
# firewall-cmd --permanent --add-port=514/tcp
success
# firewall-cmd --reload
success
```

---

## Done!

Now verify it works — see [Test & verify](verify.md). If nothing appears in the
SIEM, go to [Troubleshooting](troubleshoot.md).
