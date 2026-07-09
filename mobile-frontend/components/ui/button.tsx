import { Pressable } from 'react-native';
import twrnc from 'twrnc';

import { ThemedText } from '@/components/themed-text';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'danger' | 'ghost';
};

const toneStyles: Record<NonNullable<ButtonProps['tone']>, string> = {
  primary: 'bg-slate-900',
  danger: 'bg-red-600',
  ghost: 'bg-transparent',
};

const labelStyles: Record<NonNullable<ButtonProps['tone']>, string> = {
  primary: 'text-white',
  danger: 'text-white',
  ghost: 'text-slate-800',
};

export function Button({ label, onPress, disabled, tone = 'primary' }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={twrnc`rounded-xl px-4 py-3 ${toneStyles[tone]} ${disabled ? 'opacity-60' : ''}`}>
      <ThemedText style={twrnc`text-center ${labelStyles[tone]}`}>{label}</ThemedText>
    </Pressable>
  );
}
