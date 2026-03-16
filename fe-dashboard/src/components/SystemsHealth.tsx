import React from 'react';
import type { Deployment, Incident } from '../types/metrics';

interface SystemsHealthProps {
    deployments: Deployment[];
    incidents: Incident[];
}

const SystemsHealth: React.FC<SystemsHealthProps> = ({ deployments, incidents }) => {
    return (
        <div className="health-section">
            <div className="section-divider">
                <span>System Health & Stability</span>
            </div>
            <div className="health-grid">
                <div className="health-card">
                    <h3>Recent Deployments</h3>
                    <div className="data-list">
                        {deployments.length > 0 ? (
                            deployments.map((d, i) => (
                                <div key={i} className="list-item">
                                    <span>{d.date}</span>
                                    <span className={`status-badge ${d.successRate > 0.9 ? 'success' : 'warning'}`}>
                                        {(d.successRate * 100).toFixed(0)}% Success
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No recent deployments</div>
                        )}
                    </div>
                </div>
                <div className="health-card">
                    <h3>Critical Incidents</h3>
                    <div className="data-list">
                        {incidents.length > 0 ? (
                            incidents.map((inc, i) => (
                                <div key={i} className="list-item">
                                    <span>{inc.date}</span>
                                    <span className="status-badge error">{inc.count} Active</span>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">System stable - No incidents</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemsHealth;
