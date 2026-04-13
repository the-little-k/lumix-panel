import { useEffect, useMemo, useState } from 'react';
import { ServerContext, ServerStatus } from '@/state/server';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { bytesToString, mbToBytes } from '@/lib/formatters';

export interface ServerLiveStats {
    memory: number;
    cpu: number;
    disk: number;
    tx: number;
    rx: number;
    uptime: number;
}

/**
 * Live CPU / RAM / disk / network from the Wings websocket STATS event.
 */
export function useServerWebsocketStats(): {
    stats: ServerLiveStats;
    status: ServerStatus;
    connected: boolean;
} {
    const [stats, setStats] = useState<ServerLiveStats>({
        memory: 0,
        cpu: 0,
        disk: 0,
        tx: 0,
        rx: 0,
        uptime: 0,
    });
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const status = ServerContext.useStoreState((state) => state.status.value);

    useEffect(() => {
        if (!connected || !instance) {
            return;
        }
        instance.send(SocketRequest.SEND_STATS);
    }, [connected, instance]);

    useWebsocketEvent(SocketEvent.STATS, (data) => {
        try {
            const parsed = JSON.parse(data);
            setStats({
                memory: parsed.memory_bytes,
                cpu: parsed.cpu_absolute,
                disk: parsed.disk_bytes,
                tx: parsed.network.tx_bytes,
                rx: parsed.network.rx_bytes,
                uptime: parsed.uptime || 0,
            });
        } catch {
            /* ignore malformed payload */
        }
    });

    return { stats, status, connected };
}

export function useServerResourceSummary() {
    const { stats, status, connected } = useServerWebsocketStats();
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);

    return useMemo(() => {
        const offline = status === 'offline';
        return {
            connected,
            cpu:
                offline || !connected
                    ? null
                    : limits.cpu
                    ? `${stats.cpu.toFixed(1)}% / ${limits.cpu}%`
                    : `${stats.cpu.toFixed(1)}%`,
            memory:
                offline || !connected
                    ? null
                    : limits.memory
                    ? `${bytesToString(stats.memory)} / ${bytesToString(mbToBytes(limits.memory))}`
                    : bytesToString(stats.memory),
            disk:
                limits.disk
                    ? `${bytesToString(stats.disk)} / ${bytesToString(mbToBytes(limits.disk))}`
                    : bytesToString(stats.disk),
        };
    }, [stats, status, connected, limits]);
}
