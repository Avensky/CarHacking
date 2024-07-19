// import { Boost } from './Boost'
// import { Gauge } from './Gauge'
// import { Text } from './Text'
import Speedometer, {
    Background,
    Arc,
    Needle,
    Progress,
    Marks,
    Indicator,
    DangerPath
} from 'react-speedometer'

export function Dashboard(events: any): JSX.Element {
    return (
        <div className='dashboard'>
            <div className='dash-top'>
                <div className="misc">
                    <div className='fuel'>
                        <Speedometer
                            value={events.fuel * -1}
                            width={100}
                            height={100}
                            min={-500}
                            max={0}
                            angle={170}
                            rotation={275}
                        >
                            <Background
                                // rotation={360} 
                                angle={360}
                            />
                            {/* <Background rotation={90} angle={180} /> */}
                            <Arc arcWidth={4} />
                            <Needle
                                baseOffset={8}
                                baseWidth={1}
                                circleRadius={5}
                                circleColor='rgba(0, 0, 0, 0.60)'
                                color='rgba(110, 6, 6, 1)'
                            />
                            <DangerPath
                                arcWidth={2}
                                offset={0}
                                color='rgba(110, 6, 6, 1)'
                            />
                            <Marks
                                step={125}
                                fontSize={14}
                            >{(mark, i) => (
                                <g key={i}>
                                    (
                                    <line
                                        {...mark.coordinates}
                                        stroke="white"
                                    // strokeOpacity={1}
                                    />
                                    {(i === 0) ? < text
                                        {...mark.textProps}
                                        textAnchor="middle"
                                        alignmentBaseline="middle"
                                        fontSize={16}
                                        // opacity={0.6}
                                        fill="white"
                                    >{'F'}</text> : null}
                                    {/* {(i === 2) ? < text
                                    {...mark.textProps}
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    fontSize={16}
                                    // opacity={0.6}
                                    fill="white"
                                >
                                    <FontAwesomeIcon icon="fa-solid fa-heart" />
                                </text> : null} */}
                                    {(i === 4) ? < text
                                        {...mark.textProps}
                                        textAnchor="middle"
                                        alignmentBaseline="middle"
                                        fontSize={16}
                                        // opacity={0.6}
                                        fill="white"
                                    >
                                        {'E'}
                                    </text> : null}
                                    )
                                </g>
                            )}
                            </Marks>
                        </Speedometer>
                    </div>
                    <div className='temp'>
                        <Speedometer
                            value={events.temp}
                            width={100}
                            height={100}
                            min={100}
                            max={280}
                            angle={180}
                            rotation={90}

                        >
                            {/* <Background
                        angle={180}
                    rotation={180}
                    /> */}
                            <Arc arcWidth={4} />
                            <Needle
                                baseOffset={8}
                                baseWidth={1}
                                circleRadius={5}
                                circleColor='rgba(0, 0, 0, 0.60)'
                                color='rgba(110, 6, 6, 1)'
                            />
                            <DangerPath
                                arcWidth={2}
                                offset={0}
                                color='rgba(110, 6, 6, 1)'
                            />
                            <Marks
                                step={45}
                                fontSize={11}
                            />
                        </Speedometer>
                    </div>
                </div>

            </div>
            <div className='dash-bottom'>

                <div className="speedometer">
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
                <div className="rpms">
                    <Speedometer
                        value={events.rpms / 1000}
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
            </div>
        </div >
    )
}

