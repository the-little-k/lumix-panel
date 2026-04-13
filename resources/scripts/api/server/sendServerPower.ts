import http from '@/api/http';

export type PowerSignal = 'start' | 'stop' | 'restart' | 'kill';

export default function sendServerPowerSignal(serverUuid: string, signal: PowerSignal): Promise<void> {
    return http.post(`/api/client/servers/${serverUuid}/power`, { signal }).then(() => undefined);
}
