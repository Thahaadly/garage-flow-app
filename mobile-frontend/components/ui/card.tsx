import { ReactNode } from 'react';
import twrnc from 'twrnc';

import { ThemedView } from '@/components/themed-view';

type CardProps = {
  children: ReactNode;
  tone?: 'light' | 'muted';
  style?: any;
};

const toneStyles: Record<NonNullable<CardProps['tone']>, string> = {
  light: 'bg-white/95',
  muted: 'bg-slate-50',
};

export function Card({ children, tone = 'light', style }: CardProps) {
  return <ThemedView style={[twrnc`rounded-2xl p-5 ${toneStyles[tone]}`, style]}>{children}</ThemedView>;
}
