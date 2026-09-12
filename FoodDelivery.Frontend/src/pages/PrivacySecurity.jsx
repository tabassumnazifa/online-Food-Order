
import { useNavigate } from "react-router-dom";

function PrivacySecurity() {
  const navigate = useNavigate();

  return (
    <div className="privacy-security-page">
      <div className="privacy-security-container">

        {/* Header */}
        <div className="privacy-security-header">
          <span className="privacy-security-eyebrow">
            ACCOUNT SETTINGS
          </span>

          <h1>Privacy & Security</h1>

          <p>
            Manage your account security and control your privacy
            settings.
          </p>
        </div>

        {/* Security Section */}
        <section className="privacy-security-section">
          <div className="privacy-section-title">
            <div className="privacy-section-icon">
              🔐
            </div>

            <div>
              <h2>Security</h2>
              <p>Keep your account safe and secure.</p>
            </div>
          </div>

          <div className="privacy-option-list">

            {/* Email Verification */}
            <div className="privacy-option">
              <div className="privacy-option-icon">
                📧
              </div>

              <div className="privacy-option-content">
                <h3>Email Verification</h3>

                <p>
                  Make sure your email address is verified and
                  connected to your account.
                </p>
              </div>

              <span className="privacy-status-badge">
                Account Email
              </span>
            </div>

            {/* Account Security */}
            <div className="privacy-option">
              <div className="privacy-option-icon">
                🛡️
              </div>

              <div className="privacy-option-content">
                <h3>Account Security</h3>

                <p>
                  Your account is protected using secure
                  authentication.
                </p>
              </div>

              <span className="privacy-secure-badge">
                Secure
              </span>
            </div>

          </div>
        </section>

        {/* Privacy Section */}
        <section className="privacy-security-section">
          <div className="privacy-section-title">
            <div className="privacy-section-icon privacy-green">
              🛡️
            </div>

            <div>
              <h2>Privacy</h2>

              <p>
                Learn how your account information is handled.
              </p>
            </div>
          </div>

          <div className="privacy-option-list">

            {/* Privacy Policy */}
            <div className="privacy-option">
              <div className="privacy-option-icon">
                📋
              </div>

              <div className="privacy-option-content">
                <h3>Privacy Policy</h3>

                <p>
                  Read about how we collect, use and protect
                  your information.
                </p>
              </div>

              <button
                type="button"
                className="privacy-option-btn"
                onClick={() => navigate("/privacy-policy")}
              >
                View
                <span>→</span>
              </button>
            </div>

            {/* Personal Information */}
            <div className="privacy-option">
              <div className="privacy-option-icon">
                👤
              </div>

              <div className="privacy-option-content">
                <h3>Personal Information</h3>

                <p>
                  Your account information is used to provide
                  your food delivery services.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Account Management */}
        <section className="privacy-security-section danger-section">
          <div className="privacy-section-title">
            <div className="privacy-section-icon danger-icon">
              ⚠️
            </div>

            <div>
              <h2>Account Management</h2>

              <p>
                Manage important account actions.
              </p>
            </div>
          </div>

          <div className="privacy-option">
            <div className="privacy-option-icon danger-option-icon">
              🗑️
            </div>

            <div className="privacy-option-content">
              <h3>Delete Account</h3>

              <p>
                Permanently remove your account and associated
                information.
              </p>
            </div>

            <button
              type="button"
              className="privacy-danger-btn"
              onClick={() =>
                alert(
                  "Account deletion will be available soon."
                )
              }
            >
              Delete Account
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

export default PrivacySecurity;
