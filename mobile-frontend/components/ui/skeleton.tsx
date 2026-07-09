import { View } from 'react-native';
import twrnc from 'twrnc';

export function Skeleton({ style, className }: { style?: any, className?: string }) {
  return (
    <View
      style={[
        twrnc`bg-slate-200 rounded animate-pulse`,
        className ? twrnc`${className}` : null,
        style,
      ]}
    />
  );
}
