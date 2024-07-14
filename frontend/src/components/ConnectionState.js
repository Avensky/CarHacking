import React from 'react';
import PropTypes from 'prop-types';

export function ConnectionState({ isConnected }) {
    return <p>Live Socket Connection: {'' + isConnected}</p>;
}

ConnectionState.propTypes = {
    isConnected: PropTypes.any
}