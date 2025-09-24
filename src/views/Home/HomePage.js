import React from 'react';
import { Link } from 'react-router-dom';
import { currentUser } from '../../constants';
import './HomePage.css';

const Homepage = () => {
  return (
    <div className="Homepage">
   
      <section className="hero-section">
        <div className="hero-content">
          <h2>Welcome to the Future of Email Organization</h2>
          <p>Effortlessly manage your emails with our intuitive and powerful tools.</p>
          <Link to={!currentUser() ? "/signin": "/dashboard"}><button className="btn-primary">Get Started</button></Link>
        </div>
      </section>
      <div className="content-container">
        <main className="main-content">
          <section id="features">
            <h2>Features</h2>
            <p>Discover the amazing features that make email management a breeze.</p>
            <div className="features-list">
              <div className="feature-item">
              <h3>Smart Sorting</h3>
              <p>Automatically organize your emails into relevant categories for effortless management.</p>
              </div>
              <div className="feature-item">
              <h3>AI-Powered Writing</h3>
              <p>Leverage AI suggestions to craft emails efficiently.</p>
              </div>
              <div className="feature-item">
              <h3>Security</h3>
              <p>We prioritize your privacy and ensure top-notch security for your emails.</p>
              </div>
            </div>
          </section>
          <section id="about">
            <h2>About Us</h2>
            <p>Learn more about our mission and the team behind the Email Organizer App.</p>
            <div className="about-item"><p>Email Organizer is your ultimate tool for managing Gmail more effectively. 
              It seamlessly integrates with your Gmail account, enabling you to categorize and tag your emails for better organization. 
              Plus, with the power of AI, Email Organizer offers smart suggestions to help you compose emails efficiently.
              Transform your email management experience with advanced features and intelligent assistance.</p></div>
            
          </section>
          <section id="contact">
            <h2>Contact Us</h2>
            <p>Have any questions? Reach out to us!</p>
            <ul className="about-item">
              <li>Aayush Khare (<a href="mailto:axk6939@mavs.uta.edu">axk6939@mavs.uta.edu</a>)</li>
              <li>Sai Prajeeth Koppula (<a href="mailto:sxk0594@mavs.uta.edu">sxk0594@mavs.uta.edu</a>)</li>
              <li>Cloe Kouadjo (<a href="mailto:clk3529@mavs.uta.edu">clk3529@mavs.uta.edu</a>)</li>
              <li>Yen Duyen Le (<a href="mailto:yenduyen.le@mavs.uta.edu">yenduyen.le@mavs.uta.edu</a>)</li>
              <li>Nachiket Ramesh Gawali (<a href="mailto:nrg7240@mavs.uta.edu">nrg7240@mavs.uta.edu</a>)</li>
            </ul>
          </section>
        </main>
      </div>
      <footer>
        <p>&copy; 2024 Email Organizer App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Homepage;
