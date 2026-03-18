import type { FC } from 'react';
import type { Deployment, Incident } from '../types/metrics';

interface SystemsHealthProps {
    deployments: Deployment[];
    incidents: Incident[];
    isLoading?: boolean;
}

const SystemsHealth: FC<SystemsHealthProps> = ({ deployments, incidents, isLoading }) => {
    return (
        <div className="health-section">
            <div className="section-divider">
                <span>System Health & Stability</span>
            </div>
            <div className="health-grid">
                <div className="health-card">
                    <h3>Recent Deployments</h3>
                    <div className="data-list">
                        {isLoading ? (
                            <div className="list-item"><span>Loading...</span></div>
                        ) : deployments.length > 0 ? (
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
                        {isLoading ? (
                            <div className="list-item"><span>Loading...</span></div>
                        ) : incidents.length > 0 ? (
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
