import Speedometer, {
    Background,
    Arc,
    Needle,
    // Progress,
    Marks,
    // Indicator,
    DangerPath
} from 'react-speedometer'

export function Rpms(props: { carSim: { rpms: number } }): JSX.Element {
    return <div className="rpms">
        <Speedometer
            value={props.carSim.rpms / 1000}
            max={9}
            fontFamily='squada-one'
            // accentColor='black'
            // color='black'
            width={140}
            height={140}
        >
            <Background
                color='rgba(0,0,0, 1)'
            />
            <Arc
                arcWidth={60}
                color='rgba(255,255,255, 1'
            // lineCap="line" 
            />
            <Needle
                baseOffset={25}
                circleRadius={20}
                circleColor='rgba(0, 0, 0, 0.60)'
                color='rgba(110, 6, 6, 1)'
            />
            <DangerPath
                color='rgba(110, 6, 6, 1)'
                offset={0}
            // arcWidth
            />
            {/* <Progress arcWidth={10} /> */}
            <Marks
                step={1}
                lineColor='white'
                fontSize={20}
                lineOpacity={1}
            />
        </Speedometer>
    </div>
}
