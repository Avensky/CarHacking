import { OrbitControls as DreiOrbitControls } from '@react-three/drei'
import React, { forwardRef } from 'react'

// Forward ref to the OrbitControls component
const OrbitControlsWithRef = forwardRef((props, ref) => <DreiOrbitControls ref={ref} {...props} />)

export default OrbitControlsWithRef
