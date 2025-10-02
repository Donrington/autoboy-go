
import Svg, { Circle } from 'react-native-svg';
import { View } from 'react-native';

export default function DonutChart({
  radius = 24,
  stroke = 6,
  progress = 0.5,
  color = '#3b82f6',
}: {
  radius?: number;
  stroke?: number;
  progress?: number; // 0..1
  color?: string;
}) {
  const size = radius * 2;
  const center = radius;
  const circumference = 2 * Math.PI * (radius - stroke / 2);
  const dash = Math.max(0, Math.min(1, progress)) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius - stroke / 2}
          stroke="#E5E7EB"
          strokeWidth={stroke}
          fill="transparent"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius - stroke / 2}
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${dash}, ${circumference}`}
          strokeLinecap="round"
          fill="transparent"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
    </View>
  );
}
