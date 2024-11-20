import React, { useState } from 'react';
import gasPedalImage from '/images/gasPedal.png';
import brakePedalImage from '/images/brakePedal.png'
function Pedals(): JSX.Element {
  const [gasPedal, setGasPedal] = useState(0);
  const [brakePedal, setBrakePedal] = useState(0);

  const handleGasPedalChange = (value:any) => {
    setGasPedal(value);
  };

  const handleBrakePedalChange = (value:any) => {
    setBrakePedal(value);
  };

  return (
    <div className="Pedals">
      <div>
        <label htmlFor="gasPedal">Gas Pedal:</label>
        <input
          type="range"
          id="gasPedal"
          min="0"
          max="100"
          value={gasPedal}
          onChange={(e) => handleGasPedalChange(e.target.value)}
        />
        <span>{gasPedal}%</span>
      </div>
      <div>
        <label htmlFor="brakePedal">Brake Pedal:</label>
        <input
          type="range"
          id="brakePedal"
          min="0"
          max="100"
          value={brakePedal}
          onChange={(e) => handleBrakePedalChange(e.target.value)}
        />
        <span>{brakePedal}%</span>
      </div>
      <div className='split'>
        <div className='brakePedal'style={{ backgroundImage: `url(${brakePedalImage})` }}></div>
        <div className='gasPedal'style={{ backgroundImage: `url(${gasPedalImage})` }}></div>
      </div>
    </div>
  );
}

export default Pedals;