import { useState } from "react";
import { Link } from "react-router-dom";
import { FaCalculator, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import "./Login.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();

    console.log("Email:", email);
    console.log("Password:", password);

    // Backend login API will be connected here later.
  };

  return (
    <div className="login-page">

      <div className="login-container">

        {/* Left Section */}
        <section className="login-info">

          <div className="logo">
            <FaCalculator />
          </div>

          <h1>AI Calculator</h1>

          <p>
            Calculate smarter with the power of artificial intelligence.
            Solve mathematical problems quickly and easily.
          </p>

          <div className="features">
            <p>✓ Smart mathematical calculations</p>
            <p>✓ Scientific calculator</p>
            <p>✓ Unit and currency conversion</p>
            <p>✓ Graph plotting</p>
            <p>✓ Calculation history</p>
          </div>

        </section>

        {/* Right Section */}
        <section className="login-form-section">

          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to continue to AI Calculator</p>
          </div>

          <form onSubmit={handleLogin}>

            {/* Email */}
            <div className="input-group">
              <label>Email Address</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="input-group">
              <label>Password</label>

              <div className="password-box">

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />

                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>

              </div>
            </div>

            {/* Options */}
            <div className="login-options">

              <label>
                <input type="checkbox" />
                Remember me
              </label>

              <a href="#">Forgot password?</a>

            </div>

            {/* Login Button */}
            <button type="submit" className="login-button">
              Sign In
            </button>

          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          {/* Google */}
          <button type="button" className="google-button">
            <FaGoogle />
            Continue with Google
          </button>

          <p className="signup">
            Don't have an account?
            <Link to="/register"> Create an account</Link>
          </p>

        </section>

      </div>

    </div>
  );
}

export default Login;