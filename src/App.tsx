import HealthSummary from './components/HealthSummary';
import ComponentHealthCard from './components/ComponentHealthCard';
import MileageIntelligence from './components/MileageIntelligence';
import ServiceTransparency from './components/ServiceTransparency';
import AlertsSection from './components/AlertsSection';
import { vehicleAnalysis } from './data/vehicleAnalysis';

function App() {
  const { vehicleHealth, vehicleAlerts } = vehicleAnalysis.outputs;

  return (
    <div className="app-shell">
      <header className="top-bar">
        <a className="brand" href="/" aria-label="DriveIQ home">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span>DriveIQ</span>
        </a>
        <span className="prototype-label">MVP prototype</span>
      </header>

      <main className="workspace" aria-labelledby="page-title">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Vehicle health</p>
            <h1 id="page-title">Your vehicle, at a glance</h1>
            <p className="page-subtitle">A clear view of current component condition.</p>
          </div>
          <span className="demo-label" title={vehicleAnalysis.input.metadata.notice}>
            <span aria-hidden="true" />{vehicleAnalysis.input.metadata.label}
          </span>
        </div>

        <HealthSummary summary={vehicleHealth.summary} />

        <section className="components-section" aria-labelledby="components-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Component health</p>
              <h2 id="components-title">Condition by component</h2>
            </div>
            <p className="section-count">{vehicleHealth.components.length} components</p>
          </div>
          <div className="component-grid">
            {vehicleHealth.components.map((component) => (
              <ComponentHealthCard
                key={component.name}
                component={component}
                recommendedAction={vehicleAlerts.find((alert) => alert.component === component.name)?.recommendedAction}
              />
            ))}
          </div>
        </section>

        <MileageIntelligence />
        <ServiceTransparency />
        <AlertsSection />
      </main>

      <footer className="shell-footer">
        <span>DriveIQ MVP prototype</span>
        <span>Demo values are illustrative, not real predictions</span>
      </footer>
    </div>
  );
}

export default App;
