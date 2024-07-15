import React from 'react';
import PropTypes from 'prop-types';
import styles from './ConnectionState.module.css';

export function ConnectionState({ isConnected }) {
    return <div className={styles.ConnectionState}>
        Live Socket Connection: {'' + isConnected}
    </div>
}

ConnectionState.propTypes = {
    isConnected: PropTypes.any
}