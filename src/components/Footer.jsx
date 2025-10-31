export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-curve" aria-hidden="true" />
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-col">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/student-login">Student Login</a></li>
              <li><a href="/teacher-login">Teacher Login</a></li>
              
              <li><a href="/contact">Contact Us</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Policies</h4>
            <ul className="footer-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms & Conditions</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Contact</h4>
            <ul className="footer-links">
              <li>Email: <a href="mailto:support@assignmentportal.com">ateekjutt189@gmail.com</a></li>
              <li>Phone: <a href="tel:+923001234567">03320763189</a></li>
              <li>Address: Lahore, Pakistan</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Follow Us</h4>
            <ul className="footer-socials">
              <li>
                <a href="#" aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H8.08v-2.9h2.36V9.41c0-2.33 1.39-3.61 3.52-3.61.99 0 2.02.18 2.02.18v2.22h-1.14c-1.12 0-1.47.7-1.47 1.42v1.71h2.5l-.4 2.9h-2.1V22c4.78-.79 8.44-4.93 8.44-9.94z"/></svg>
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a href="#" aria-label="LinkedIn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.94 6.5a2.44 2.44 0 1 1 0-4.88 2.44 2.44 0 0 1 0 4.88zM3.99 8.37h5.9V22H3.99zM13.1 8.37h5.65v1.86s1.54-2.17 4.21-2.17c4.01 0 6.04 2.62 6.04 7.27V22h-5.9v-5.69c0-2.2-.79-3.7-2.75-3.7-1.5 0-2.39 1.01-2.79 1.99-.14.34-.18.82-.18 1.3V22h-5.9V8.37z" transform="scale(.5) translate(12 8)"/></svg>
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a href="#" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm5 5.8A4.2 4.2 0 1 1 7.8 12 4.21 4.21 0 0 1 12 7.8zm6.2-.9a1.1 1.1 0 1 1-1.1-1.1 1.1 1.1 0 0 1 1.1 1.1zM12 9a3 3 0 1 0 3 3 3 3 0 0 0-3-3z"/></svg>
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a href="#" aria-label="Twitter (X)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 5.8c-.7.3-1.5.6-2.3.7.8-.5 1.4-1.2 1.7-2.2-.8.5-1.7.9-2.6 1.1A4.1 4.1 0 0 0 12 8.7c0 .3 0 .6.1.8-3.4-.2-6.5-1.8-8.6-4.3-.4.7-.5 1.5-.5 2.3 0 1.6.8 3.1 2.1 4-.6 0-1.2-.2-1.7-.5v.1c0 2.2 1.6 4 3.7 4.4-.4.1-.8.1-1.2.1-.3 0-.6 0-.9-.1.6 1.8 2.3 3.1 4.3 3.1A8.3 8.3 0 0 1 2 19.7a11.7 11.7 0 0 0 6.3 1.8c7.6 0 11.7-6.3 11.7-11.7v-.5c.8-.5 1.5-1.2 2-2z"/></svg>
                  <span>Twitter (X)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <small>© 2025 Assignment Portal System. All Rights Reserved.</small>
          <small>Developed by Ateek Rehman</small>
        </div>
      </div>
    </footer>
  )
}
