---
title: How it works
description: The simple mental model of how server logs reach your SIEM via rsyslog and syslogd.
---

# How it works

You don't need to know everything about syslog to make this work — just the one
mental model below. **In plain words:** your server already writes a log entry
every time someone logs in or fails a password. We simply tell the server's
built-in logger to *also* send those entries to the SIEM over the network.

## The flow

<div class="surface">
  <div class="flow">
    <span class="flow-node primary">sshd / login / sudo</span>
    <span class="flow-arrow">→</span>
    <span class="flow-node">rsyslog / syslogd</span>
    <span class="flow-arrow">→</span>
    <span class="flow-node">network (port 514)</span>
    <span class="flow-arrow">→</span>
    <span class="flow-node dest">SIEM</span>
  </div>
</div>

1. A program (for example `sshd`) writes a log line like *"Accepted password for bob"*.
2. The logger (`rsyslog` on Linux, `syslogd` on FreeBSD) picks it up.
3. The logger writes it to a local file (`/var/log/secure` or `/var/log/auth.log`)
   **and** — because of our config — sends a copy to the SIEM.
4. The SIEM stores and displays it.

## Facility and priority (the only two words you need)

Every log message has two labels:

- **Facility** = *which subsystem* wrote it. The important ones for us are:

| Facility | What it means |
| --- | --- |
| `auth` | Login/logout/password events |
| `authpriv` | Private auth events (same idea, more sensitive) |
| `kern` | Kernel messages |
| `daemon` | Background services |
| `*` | **Everything** |

- **Priority** = *how important* it is. From most to least critical:
  `emerg`, `alert`, `crit`, `err`, `warning`, `notice`, `info`, `debug`.
  A `*` here means **every priority**.

So the selector `auth,authpriv.*` means: *"send every message from the `auth`
and `authpriv` facilities, at any priority"*.

!!! tip "Why `auth,authpriv`?"
    Logins, logouts, `sudo`, and **failed password attempts** are logged under the
    `auth` / `authpriv` facility. This is exactly what you want in your SIEM.

## `@` vs `@@` — UDP vs TCP

In the config file, a single `@` means **UDP**, a double `@@` means **TCP**.

| Syntax | Protocol | Behaviour |
| --- | --- | --- |
| `@10.0.0.1:514` | UDP | Fast, but messages can be silently lost if the network is busy |
| `@@10.0.0.1:514` | TCP | Reliable, messages are guaranteed to arrive (in order) |

!!! success "Recommendation"
    Use **TCP** (`@@`) unless your SIEM specifically requires UDP. TCP is more
    reliable and is what most modern SIEMs (Splunk, QRadar, Wazuh, Graylog…)
    expect. All examples in this guide use TCP.

## What a raw log line looks like

Here is one line exactly as it leaves your server (traditional `RFC3164` format):

```text
Oct  6 14:22:31 web-01 sshd[2914]: Accepted password for bob from 203.0.113.7 port 52217 ssh2
```

And a failed login:

```text
Oct  6 14:23:05 web-01 sshd[2931]: Failed password for root from 203.0.113.9 port 52240 ssh2
```

Broken down:

| Part | Value | Meaning |
| --- | --- | --- |
| Timestamp | `Oct  6 14:22:31` | When it happened |
| Hostname | `web-01` | Which server |
| Program | `sshd[2914]` | Which program (with process ID) |
| Message | `Accepted password for bob…` | What happened |

When this reaches your SIEM, the SIEM splits these parts into searchable fields
so you can query *"show me every failed login in the last hour"*.

## What about the modern format (RFC5424)?

Newer systems can also send a more structured `RFC5424` format (with fields like
`PRI`, `VERSION`, `MSGID`). Most SIEMs accept **both**. rsyslog's default is the
classic format, and that is what the examples here produce. You don't need to
change anything.

## Next steps

Now pick your operating system and configure it:

- [Red Hat (RHEL 6–9)](redhat.md)
- [Debian & Ubuntu](debian-ubuntu.md)
- [FreeBSD](freebsd.md)
