# CTO Dashboard: Premium Components Walkthrough

I have successfully created the raw, premium dashboard components based on your design mockup. The implementation features a high-fidelity glassmorphism aesthetic and is designed for future extensibility (theming, drag-and-drop).

## development Journey

### 1. High-Fidelity Design & Mockup
The journey started with creating the raw, premium dashboard components based on your design mockup.
- **Glassmorphism Aesthetic**: Implemented semi-transparent cards with `backdrop-blur` and vibrant Indigo gradients.
- **Parameterized Architecture**: Components are fully driven by a `WidgetConfig` array for future flexibility.

![Mockup UI](./media/cto_dashboard_v4_final_1773679771899.png)

### 2. Live Backend Integration
Next, we moved from static data to a live, production-grade environment.
- **GraphQL Connectivity**: Connected the frontend to the `api-gateway-java` service.
- **Backend Optimization**: Resolved ClickHouse JDBC protocol issues by disabling compression and ensuring correct port mapping.
- **Live Metrics**: Dashboard now heartbeats every 30 seconds to fetch PRs, Commits, and Cycle Time from real event data.

![Live Data](./media/cto_dashboard_live_ok_1773680874832.png)

### 3. Interactive Activity Stream
Finally, we made the dashboard alive and actionable.
- **Navigable Events**: Every event in the timeline is now a clickable link.
- **Smart Deep-linking**: The backend constructs real GitHub URLs for commits and pull requests by parsing event metadata.
- **UX Polish**: Added hover transitions and pointer indicators to guide interaction.

![Interactive Timeline](./media/actual_data_dashboard_1773682395239.png)

## Visual Demonstrations

#### Video: Actual GitHub Data Demo & Redirection
![Interactivity Demo](./media/actual_github_data_demo_1773682339468.webp)

## Technical Stack
- **Frontend**: React 19 + TypeScript + Vite.
- **Styling**: Tailwind CSS v4 + Framer Motion.
- **Backend**: Java API Gateway + ClickHouse + PostgreSQL.
- **Media**: Tracked via Git LFS for repository performance.

## How to Run
1. Navigate to `fe-dashboard`.
2. Run `npm install`.
3. Run `npm run dev:local` to view the live integrated dashboard.
