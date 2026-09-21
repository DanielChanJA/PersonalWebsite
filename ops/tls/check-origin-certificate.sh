#!/bin/sh
set -eu

certificate="/etc/letsencrypt/live/danielchan.me/fullchain.pem"
warning_days="${PORTFOLIO_CERTIFICATE_WARNING_DAYS:-30}"

case "$warning_days" in
    ''|*[!0-9]*)
        echo "PORTFOLIO_CERTIFICATE_WARNING_DAYS must be a positive integer" >&2
        exit 2
        ;;
esac

if [ "$warning_days" -lt 1 ]; then
    echo "PORTFOLIO_CERTIFICATE_WARNING_DAYS must be at least 1" >&2
    exit 2
fi

warning_seconds="$((warning_days * 86400))"

test -r "$certificate"
/usr/bin/openssl x509 -checkend "$warning_seconds" -noout -in "$certificate"
/usr/bin/openssl x509 -enddate -noout -in "$certificate"
