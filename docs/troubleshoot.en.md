---
title: Troubleshooting
description: Fix the most common reasons why logs do not appear in your SIEM.
---

# Troubleshooting

Work through these **in order**. Most problems are fixed by step 1 or 2.

## 1. Is the config valid?

Run the syntax check. If there is a typo, rsyslog tells you the exact line:

```console
$ sudo rsyslogd -N1
rsyslogd: error during parsing file /etc/rsyslog.d/99-siem.conf, on or before line 2: invalid character '@' in object definition - is there an invalid escape sequence somewhere?
rsyslogd: run failed with error -2111 (see rsyslog.h or try http://www.rsyslog.com/e/2111)
```

Fix the line it names and re-check until you see:

```console
rsyslogd: End of config validation run. Bye.
```

## 2. Is the service running?

=== "RHEL 7+ / Debian / Ubuntu (systemd)"

    ```console
    $ systemctl status rsyslog
    ● rsyslog.service - System Logging Service
         Loaded: loaded (/lib/systemd/system/rsyslog.service; enabled; vendor preset: enabled)
         Active: active (running) since Mon 2026-10-06 14:30:02 UTC; 4s ago
    ```

    Look for **`Active: active (running)`**. If it failed, read the reason:

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

## 3. Can the server reach the SIEM at all?

Test the network path directly. For **TCP**:

```console
$ nc -vz 192.168.1.100 514
Connection to 192.168.1.100 514 port [tcp/syslog] succeeded!
```

A timeout or refusal means a firewall or network problem:

```console
$ nc -vz 192.168.1.100 514
nc: connect to 192.168.1.100 port 514 (tcp) failed: Connection timed out
```

For **UDP**, use `nc -vzu 192.168.1.100 514`. If these fail, fix the network path
(firewall on the SIEM, host firewall, or routing) before touching rsyslog again.

## 4. Are packets actually leaving the server?

Capture traffic while triggering a test message:

```console
$ sudo tcpdump -i any -n 'port 514' -c 3
```

If **no packets appear**, rsyslog isn't sending them (re-check steps 1–2). If
packets appear but the SIEM shows nothing, the problem is on the SIEM side
(listener, port, or protocol mismatch).

## 5. UDP vs TCP mismatch

The **most common** "logs don't appear" cause: you configured TCP (`@@`) but the
SIEM listens on UDP, or the other way around.

| Your config | SIEM must listen on |
| --- | --- |
| `@host:514` (one `@`) | UDP |
| `@@host:514` (two `@`) | TCP |

Ask your SIEM admin which protocol and port to use, and make your config match.

## 6. SELinux is blocking (Red Hat only)

```console
$ sudo ausearch -m avc -ts recent | grep rsyslog
type=AVC msg=audit(…): avc:  denied  { name_connect } for pid=812 comm="rsyslogd" …
```

If you see `denied … rsyslogd` and you use a **non-standard port**, add it:

```console
$ sudo semanage port -a -t syslogd_port_t -p tcp 30514
```

## 7. AppArmor is blocking (Ubuntu/Debian)

```console
$ sudo dmesg | grep -i apparmor | grep rsyslog
[ 1234.567890] audit: type=1400 … apparmor="DENIED" operation="connect" … name="rsyslogd"
```

If you see a denial while using the default config, check the profile state:

```console
$ sudo aa-status | grep rsyslog
```

## 8. Wrong timestamps in the SIEM

If events arrive but the time is wrong (hours off), the server clock is wrong.
Enable NTP:

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

## 9. FreeBSD: syslogd not enabled at boot

If forwarding stops after a reboot, syslogd isn't enabled:

```console
$ sysrc syslogd_enable="YES"
syslogd_enable:  -> YES
```

!!! note "`-s` flag is fine"
    FreeBSD's default `syslogd_flags="-s"` only stops the daemon from **receiving**
    remote logs. It does **not** stop outbound forwarding, so leave it alone.

---

Still stuck? Re-check the [config for your OS](redhat.md), or confirm the SIEM
side with your SIEM administrator.
