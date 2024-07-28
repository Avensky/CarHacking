import Speedometer, {
    Background,
    Arc,
    Needle,
    // Progress,
    Marks,
    // Indicator,
    DangerPath
} from 'react-speedometer'

export function FuelTemp(props: { carSim: { temp: number, fuel: number } }): JSX.Element {
    return <div className="misc">
        <div className='fuel'>
            <Speedometer
                value={props.carSim.fuel * -1}
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
                value={props.carSim.temp}
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
}
