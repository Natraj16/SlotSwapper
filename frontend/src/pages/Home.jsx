import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Swap Time Slots <span className="gradient-text">Effortlessly</span>
            </h1>
            <p className="hero-subtitle">
              SlotSwapper is a peer-to-peer scheduling platform that lets you exchange
              busy time slots with others. Turn scheduling conflicts into opportunities!
            </p>
            <div className="hero-buttons">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="btn btn-primary btn-lg">
                    Go to Dashboard
                  </Link>
                  <Link to="/marketplace" className="btn btn-outline btn-lg">
                    Browse Slots
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary btn-lg">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-lg">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hero-illustration">
            <div className="floating-card">
              <span className="card-emoji">📅</span>
              <p>Team Meeting</p>
              <small>Tuesday 10AM</small>
            </div>
            <div className="floating-card delay-1">
              <span className="card-emoji">🎯</span>
              <p>Focus Block</p>
              <small>Wednesday 2PM</small>
            </div>
            <div className="swap-icon">🔄</div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="grid grid-3">
            <div className="feature-card card">
              <div className="feature-icon">📝</div>
              <h3>Create Your Calendar</h3>
              <p>Add your events and mark which time slots you're willing to swap</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">🔍</div>
              <h3>Browse Marketplace</h3>
              <p>Discover swappable slots from other users and find the perfect match</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">🤝</div>
              <h3>Swap Instantly</h3>
              <p>Send swap requests and get real-time notifications when accepted</p>
            </div>
          </div>
        </div>
      </section>

      <section className="benefits">
        <div className="container">
          <h2 className="section-title">Why SlotSwapper?</h2>
          <div className="grid grid-2">
            <div className="benefit-item">
              <span className="benefit-icon">⚡</span>
              <div>
                <h3>Real-time Updates</h3>
                <p>Get instant notifications via WebSocket when your swap is accepted</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🔒</span>
              <div>
                <h3>Secure & Private</h3>
                <p>JWT authentication keeps your calendar data safe and private</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🎨</span>
              <div>
                <h3>Beautiful Design</h3>
                <p>Modern UI with Quicksand font for a delightful user experience</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🌐</span>
              <div>
                <h3>Peer-to-Peer</h3>
                <p>Direct swaps between users without intermediaries</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to Start Swapping?</h2>
          <p>Join SlotSwapper today and take control of your schedule</p>
          {!isAuthenticated && (
            <Link to="/signup" className="btn btn-accent btn-lg">
              Sign Up Now
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
