export const USER_COLORS = [
  '#4f8ef7','#a78bfa','#34d399','#f59e0b','#f87171','#22d3ee','#fb7185','#a3e635','#60a5fa','#c084fc',
];

export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function randomColor(): string {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}


