#!/bin/sh
set -eu

# Pinned from Cloudflare's authoritative ips-v4 and ips-v6 lists on 2026-09-20.
# Review those lists before changing this file.
cloudflare_ipv4="
173.245.48.0/20
103.21.244.0/22
103.22.200.0/22
103.31.4.0/22
141.101.64.0/18
108.162.192.0/18
190.93.240.0/20
188.114.96.0/20
197.234.240.0/22
198.41.128.0/17
162.158.0.0/15
104.16.0.0/13
104.24.0.0/14
172.64.0.0/13
131.0.72.0/22
"

cloudflare_ipv6="
2400:cb00::/32
2606:4700::/32
2803:f800::/32
2405:b500::/32
2405:8100::/32
2a06:98c0::/29
2c0f:f248::/32
"

ipv4_rules="$(mktemp)"
ipv6_rules="$(mktemp)"

cleanup() {
    rm -f "$ipv4_rules" "$ipv6_rules"
}
trap cleanup EXIT HUP INT TERM

write_rules() {
    family="$1"
    command="$2"
    chain="$3"
    ranges="$4"
    output="$5"
    has_hook=false

    if "$command" -C INPUT -j "$chain" 2>/dev/null; then
        has_hook=true
    fi

    {
        printf '*filter\n'
        printf ':%s - [0:0]\n' "$chain"
        printf -- '-F %s\n' "$chain"
        printf -- '-A %s -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT\n' "$chain"
        printf -- '-A %s -i lo -j ACCEPT\n' "$chain"
        printf -- '-A %s -i tailscale0 -j ACCEPT\n' "$chain"
        printf -- '-A %s -p udp --dport 41641 -j ACCEPT\n' "$chain"

        if [ "$family" = "ipv4" ]; then
            printf -- '-A %s -p udp --sport 67 --dport 68 -j ACCEPT\n' "$chain"
            printf -- '-A %s -p icmp -j ACCEPT\n' "$chain"
        else
            printf -- '-A %s -p udp --sport 547 --dport 546 -j ACCEPT\n' "$chain"
            printf -- '-A %s -p ipv6-icmp -j ACCEPT\n' "$chain"
        fi

        for range in $ranges; do
            printf -- '-A %s -p tcp -s %s -m multiport --dports 80,443 -j ACCEPT\n' "$chain" "$range"
        done

        printf -- '-A %s -j DROP\n' "$chain"
        if [ "$has_hook" = true ]; then
            printf -- '-D INPUT -j %s\n' "$chain"
        fi
        printf -- '-I INPUT 1 -j %s\n' "$chain"
        printf 'COMMIT\n'
    } > "$output"
}

remove_legacy_web_chain() {
    command="$1"
    chain="$2"

    while "$command" -C INPUT -p tcp -m multiport --dports 80,443 -j "$chain" 2>/dev/null; do
        "$command" -D INPUT -p tcp -m multiport --dports 80,443 -j "$chain"
    done
    "$command" -F "$chain" 2>/dev/null || true
    "$command" -X "$chain" 2>/dev/null || true
}

remove_legacy_ssh_chain() {
    command="$1"
    chain="$2"

    while "$command" -C INPUT -p tcp --dport 22 -j "$chain" 2>/dev/null; do
        "$command" -D INPUT -p tcp --dport 22 -j "$chain"
    done
    "$command" -F "$chain" 2>/dev/null || true
    "$command" -X "$chain" 2>/dev/null || true
}

write_rules ipv4 /sbin/iptables PORTFOLIO_INPUT "$cloudflare_ipv4" "$ipv4_rules"
write_rules ipv6 /sbin/ip6tables PORTFOLIO_INPUT6 "$cloudflare_ipv6" "$ipv6_rules"

# Each family commits as one ruleset transaction. An interrupted or invalid
# restore leaves the prior family rules unchanged.
/sbin/iptables-restore --noflush < "$ipv4_rules"
/sbin/ip6tables-restore --noflush < "$ipv6_rules"

# Remove chains created by the earlier port-specific implementation only after
# the effective default-deny chains are active.
remove_legacy_web_chain /sbin/iptables PORTFOLIO_WEB
remove_legacy_web_chain /sbin/ip6tables PORTFOLIO_WEB6
remove_legacy_ssh_chain /sbin/iptables PORTFOLIO_SSH
remove_legacy_ssh_chain /sbin/ip6tables PORTFOLIO_SSH6
