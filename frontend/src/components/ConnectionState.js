import React from 'react';
import PropTypes from 'prop-types';

export function ConnectionState({ isConnected }) {
    return <p>State: {'' + isConnected}</p>;
}

ConnectionState.propTypes = {
    isConnected: PropTypes.any
}