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
}

export function Speed({ speed }: SpeedProps): JSX.Element {
  const speedometerProps: SpeedometerProps = {
    value: speed,
    max: 160,
    fontFamily: 'squada-one',
    rotation: -225,
    width: 120,
    height: 120,
    children: <Indicator />,
  }

  // Define the props type for Speed component
  return (
    <div className="speedometer">
      <Speedometer {...speedometerProps}>
        <Background />
        <Arc />
        <Needle color="rgba(110, 6, 6, 1)" circleColor="rgba(0, 0, 0, 0.60)" />
        <Progress />
        <Marks
          // baseWidth={1}
          step={10}
          fontSize={10}
        />
        <Indicator
          // textAnchor='start'
          x={96}
          y={69}
          fontSize={26}
        />
      </Speedometer>
    </div>
  )
}
