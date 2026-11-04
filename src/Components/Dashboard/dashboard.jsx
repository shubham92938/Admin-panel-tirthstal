import { Link } from "react-router-dom";
import "./dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard-home">
      <section className="dashboard-welcome">
        <span>Tirthstal administration</span>
        <h1>Welcome back</h1>
        <p>Maintain sacred places, cultural content, and your admin account from one workspace.</p>
      </section>
      <div className="dashboard-links">
        <Link to="/temple" className="dashboard-link dashboard-link-featured">
          <span>Temple content</span><h2>Manage temples</h2>
          <p>Create and edit records, find incomplete data, and deactivate or restore listings.</p>
          <strong>Open temple manager →</strong>
        </Link>
        <Link to="/profile" className="dashboard-link">
          <span>Your account</span><h2>Profile & security</h2>
          <p>Update your details or change your password.</p><strong>Open settings →</strong>
        </Link>
        <Link to="/backlog" className="dashboard-link">
          <span>Planning</span><h2>Backend backlog</h2>
          <p>See excluded features waiting for protected admin APIs.</p><strong>View backlog →</strong>
        </Link>
      </div>
      <section className="dashboard-note"><h2>Content operations</h2><p>Existing Goseva, blog, festival, district, and review workflows continue to use their established backend routes. Contact messages and newsletter subscribers are not fetched by this panel.</p></section>
    </div>
  );
}
