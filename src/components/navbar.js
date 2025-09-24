import React, { useState } from 'react';
import { Icon, Menu, Modal } from 'semantic-ui-react';
import { currentUser, logout } from '../constants';

export default function NavigationMenu() {
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const handleFeaturesClick = () => {
    setShowFeaturesModal(true);
  };

  const handleAboutClick = () => {
    setShowAboutModal(true);
  };

  const handleContactClick = () => {
    setShowContactModal(true);
  };

  return (
    <Menu className="custom-navbar">
      <Menu.Item
        header
        name="EmailOrganizer"
        onClick={() => (window.location.pathname = '/')}
      >
        Email Organizer
      </Menu.Item>
      <Menu.Item
        name="dashboard"
        onClick={() => (window.location.pathname = '/dashboard')}
      >
        Dashboard
      </Menu.Item>
      <Menu.Menu position="right">
        {!currentUser() && (
          <Menu.Item
            name="signin"
            onClick={() => (window.location.pathname = '/signin')}
          >
            Sign In
          </Menu.Item>
        )}

          <Menu.Item
            name="Blog"
            onClick={() => window.open('https://sxk0594.uta.cloud/', '_blank')}
          >
            Blog
          </Menu.Item>
       

        <Menu.Item name="features" onClick={handleFeaturesClick}>
          Features
        </Menu.Item>

        <Menu.Item name="about" onClick={handleAboutClick}>
          About
        </Menu.Item>

        <Menu.Item name="contact" onClick={handleContactClick}>
          Contact
        </Menu.Item>

        {currentUser() && (
          <Menu.Item name="logout" onClick={() => logout()}>
            <Icon name="power off" />
            Log Out
          </Menu.Item>
        )}
      </Menu.Menu>

      {/* Features Modal */}
      <Modal
        open={showFeaturesModal}
        onClose={() => setShowFeaturesModal(false)}
        size="tiny"
      >
        <Modal.Header>Features</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <h3>Smart Sorting</h3>
            <p>Automatically organize your emails into relevant categories for effortless management.</p>

            <h3>AI-Powered Writing</h3>
            <p>Leverage AI suggestions to craft emails efficiently.</p>

            <h3>Security</h3>
            <p>We prioritize your privacy and ensure top-notch security for your emails.</p>
            
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <button className="ui button" onClick={() => setShowFeaturesModal(false)}>
            Close
          </button>
        </Modal.Actions>
      </Modal>

      {/* About Modal */}
      <Modal
        open={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        size="tiny"
      >
        <Modal.Header>About</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <p>Email Organizer is your ultimate tool for managing Gmail more effectively. 
              It seamlessly integrates with your Gmail account, enabling you to categorize and tag your emails for better organization. 
              Plus, with the power of AI, Email Organizer offers smart suggestions to help you compose emails efficiently. 
              Transform your email management experience with advanced features and intelligent assistance.</p>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <button className="ui button" onClick={() => setShowAboutModal(false)}>
            Close
          </button>
        </Modal.Actions>
      </Modal>

      {/* Contact Modal */}
      <Modal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        size="tiny"
      >
        <Modal.Header>Contact</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <p>Have any questions? Reach out to us!</p>
            <ul className="contact-list">
              <li>Aayush Khare (<a href="mailto:axk6939@mavs.uta.edu">axk6939@mavs.uta.edu</a>)</li>
              <li>Sai Prajeeth Koppula (<a href="mailto:sxk0594@mavs.uta.edu">sxk0594@mavs.uta.edu</a>)</li>
              <li>Cloe Kouadjo (<a href="mailto:clk3529@mavs.uta.edu">clk3529@mavs.uta.edu</a>)</li>
              <li>Yen Duyen Le (<a href="mailto:yenduyen.le@mavs.uta.edu">yenduyen.le@mavs.uta.edu</a>)</li>
              <li>Nachiket Ramesh Gawali (<a href="mailto:nrg7240@mavs.uta.edu">nrg7240@mavs.uta.edu</a>)</li>
            </ul>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <button className="ui button" onClick={() => setShowContactModal(false)}>
            Close
          </button>
        </Modal.Actions>
      </Modal>
    </Menu>
  );
}
