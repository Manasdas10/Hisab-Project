import React, { useState } from "react";

const API = "http://localhost:3000";

export default function Signup({ setPage }) {

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  async function handleSignup(e) {

    e.preventDefault();

    try {

      const res = await fetch(`${API}/api/auth/register`, {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (data.token || data.msg) {

        alert("Account created");

        setPage("login");

      } else {

        alert(data.msg || "Signup failed");

      }

    } catch (err) {

      console.log(err);

      alert("Backend server not running");

    }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">

        <h2>Create Account</h2>
        <p className="auth-subtitle font-bold text-xs" style={{ textTransform: "uppercase", letterSpacing: "1.5px" }}>
          Start Tracking with Hisab
        </p>

        <form onSubmit={handleSignup}>
          <div>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />
          </div>

          <div>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div>
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button className="auth-btn">
            Create Account
          </button>

        </form>

        <button
          className="pill"
          onClick={() => setPage("login")}
        >
          Back to login
        </button>

      </div>
    </div>
  );
}