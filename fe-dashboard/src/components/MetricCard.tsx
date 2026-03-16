import React from 'react';

interface MetricCardProps {
    title: string;
    value: string | number;
    unit?: string;
    icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, icon }) => {
    return (
        <div className="metric-card">
            <div className="metric-title">
                {icon}
                {title}
            </div>
            <div className="metric-value">
                {value}
                {unit && (
                    <span style={{ fontSize: '1.25rem', color: '#94a3b8', fontWeight: 500, marginLeft: '0.5rem' }}>
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
};

export default MetricCard;
