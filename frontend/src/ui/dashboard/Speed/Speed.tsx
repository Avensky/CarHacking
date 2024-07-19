import Speedometer, {
    Background,
    Arc,
    Needle,
    Progress,
    Marks,
    Indicator,
    // DangerPath
} from 'react-speedometer'

export function Speed(events: any): JSX.Element {
    return <div className="speedometer">
        <Speedometer
            value={events.speed}
            max={160}
            fontFamily='squada-one'
            rotation={-225}
            width={120}
            height={120}
        >
            <Background />
            <Arc />
            <Needle
                color='rgba(110, 6, 6, 1)'
                circleColor='rgba(0, 0, 0, 0.60)'
            />
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
                fontSize={26} />
        </Speedometer>
    </div>
}
