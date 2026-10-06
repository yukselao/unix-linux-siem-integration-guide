---
title: Test & verify
description: Prove your SIEM integration works by triggering real login and failed-password events and watching them flow to the SIEM.
---

# Test & verify

After configuring, **prove it works** in three steps:

1. Send a harmless test message.
2. Trigger a **real login** and a **real failed password**.
3. Watch the packets leave your server (and confirm they show up in the SIEM).

---

## Step 1 — Send a test message

The `logger` command writes a message to the syslog daemon from the command line:

```console
$ logger "SIEM integration test from $(hostname)"
```

No output means success. Now check the local log to see it:

=== "Red Hat"

    ```console
    $ tail -1 /var/log/messages
    Oct  6 14:40:02 web-01 root[3102]: SIEM integration test from web-01
    ```

=== "Debian / Ubuntu"

    ```console
    $ tail -1 /var/log/syslog
    Oct  6 14:40:02 web-01 root[3102]: SIEM integration test from web-01
    ```

If the message appears locally, rsyslog received it. Search your SIEM for
`SIEM integration test` — it should appear there too.

---

## Step 2 — Trigger a real login

Log in to the server over SSH **from another machine**:

```console
$ ssh bob@web-01
bob@web-01's password:
Last login: Mon Oct  6 14:22:31 2026 from 203.0.113.7
```

Then, on the server, confirm the login event was recorded:

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

The key line is **`Accepted password for bob`** — this is exactly what your SIEM
should now show as a successful login.

---

## Step 3 — Trigger a failed password (this is the one you really want)

Try to log in with a **wrong password** (or as a user that does not exist):

```console
$ ssh bob@web-01
bob@web-01's password:   # type a wrong password here
Permission denied, please try again.
```

On the server you will now see **failed password** entries:

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

!!! success "That's the money line"
    `Failed password for ...` is the event you want to see in your SIEM. If it
    appears in the SIEM, your integration is **working**.

---

## Step 4 — Watch the packets leave the server

If the events show up locally but **not** in the SIEM, check that packets are
actually leaving your server. Trigger a `logger` while capturing traffic:

```console
$ sudo tcpdump -i any -n 'port 514' -c 3
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on any, link-type LINUX_SLL (Linux cooked v1), capture size 262144 bytes
14:58:01.123456 IP 192.168.1.50.514 > 192.168.1.100.514: UDP, length 186
14:58:01.124001 IP 192.168.1.50.514 > 192.168.1.100.514: UDP, length 191
```

You should see lines going **to** your SIEM's IP (`192.168.1.100`). If you use TCP,
confirm the connection is established:

```console
$ ss -tnp | grep 514
ESTAB  0  0  192.168.1.50:39750  192.168.1.100:514  users:(("rsyslogd",pid=812,fd=7))
```

---

## Step 5 — Confirm in the SIEM

In your SIEM, search for:

- the hostname of your server (`web-01`), or
- the exact string `SIEM integration test`, or
- `Failed password` / `Accepted password`.

!!! note "Give it a minute"
    Some SIEMs buffer or index events for a short time. If it doesn't show up
    immediately, wait 30–60 seconds and search again.

If it still doesn't appear, go to [Troubleshooting](troubleshoot.md).
