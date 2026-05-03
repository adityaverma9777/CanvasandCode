'use client';
import { useEffect } from 'react';

const HF_HEALTH = `${process.env.NEXT_PUBLIC_SOCKET_URL}/health`;
const INTERVAL_MS = 30_000;

export default function KeepAlive() {
  useEffect(() => {
    const ping = () => {
      fetch(HF_HEALTH, { method: 'GET', mode: 'cors' }).catch(() => {});
    };

    ping();

    const id = setInterval(ping, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return null;
}
