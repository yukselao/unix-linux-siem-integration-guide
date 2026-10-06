# Unix/Linux SIEM Integration Guide

A bilingual (English / Türkçe) MkDocs documentation site that teaches system
administrators how to forward **authentication and system logs** from their
Unix/Linux servers to a **SIEM** using `rsyslog` (Linux) and `syslogd` (FreeBSD).

## What it covers

| OS | Logging daemon | Config file |
| --- | --- | --- |
| RHEL / CentOS / Rocky / Alma 6–9 | rsyslog | `/etc/rsyslog.d/` |
| Debian | rsyslog | `/etc/rsyslog.d/` |
| Ubuntu | rsyslog | `/etc/rsyslog.d/` |
| FreeBSD | syslogd (native) | `/etc/syslog.conf` |

## Local development

```bash
pip install -r requirements.txt
mkdocs serve
```

## Build

```bash
mkdocs build
```

The site is built and deployed to GitHub Pages automatically on every push to
`main` by the workflow in `.github/workflows/deploy.yml`.

Live URL: <https://yukselao.github.io/unix-linux-siem-integration-guide/>

## Languages

- English — site root `/`
- Türkçe — `/tr/`

Translations live side-by-side in `docs/` using the `.en.md` / `.tr.md` suffix
convention handled by `mkdocs-static-i18n`.
