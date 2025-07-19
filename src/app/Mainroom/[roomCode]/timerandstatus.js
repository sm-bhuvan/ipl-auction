import React from 'react';

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const TimerandStatus = ({ timer }) => {
    return (
        <div className="text-center mb-6">
            <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full border-2 ${timer <= 10 ? 'border-red-500 bg-red-600/20' : 'border-orange-500 bg-orange-600/20'}`}>
                <span className="text-2xl">⏱</span>
                <span className={`text-3xl font-bold ${timer <= 10 ? 'text-red-400' : 'text-orange-400'}`}>
                    {formatTime(timer)}s
                </span>
            </div>
        </div>
    );
};

export default TimerandStatus;
