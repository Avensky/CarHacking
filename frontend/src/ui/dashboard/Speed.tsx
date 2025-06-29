import Speedometer, {
  Background,
  Arc,
  Needle,
  Progress,
  Marks,
  Indicator,
  // DangerPath
} from 'react-speedometer'
import { SpeedometerProps } from 'react-speedometer/dist/Speedometer'

interface SpeedProps {
  speed: number // Expect speed as a number
  size: number
}

export function Speed({ speed, size }: SpeedProps): JSX.Element {

  const width = 120 * size;
  const height = 120 * size;
  const speedometerProps: SpeedometerProps = {
    value: speed,
    max: 160,
    fontFamily: 'squada-one',
    rotation: -225,
    width: width,
    height: height,
    children: <Indicator />,
  }

  // Define the props type for Speed component
  return (
    <div className="speedometer">
      <Speedometer {...speedometerProps}>
        <Background />
        <Arc />
        <Needle
          // baseOffset={10}
          circleRadius={8}
          color="rgba(110, 6, 6, 1)"
          circleColor="rgba(0, 0, 0, 0.60)"
        />
        <Progress />
        <Marks
          // baseWidth={1}
          // numbersRadius={100}
          step={10}
          fontSize={10}
        />
        <Indicator
          // textAnchor='start'
          x={75}
          y={53}
          fontSize={20}
        />
      </Speedometer>
    </div>
  )
}
