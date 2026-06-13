import React, { useState } from "react";

const API = "https://hisab-project.onrender.com";

export default function Login({ setPage }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    try {

      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (data.token) {

        localStorage.setItem("token", data.token);
        if (data.user && data.user.name) {
          localStorage.setItem("userName", data.user.name);
        }

        setPage("dashboard");

      } else {
        alert(data.msg || "Login failed");
      }

    } catch (err) {

      console.log(err);

      alert("Backend server not running");

    }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">

        <h2>Login</h2>
        <p className="auth-subtitle font-bold text-xs" style={{ textTransform: "uppercase", letterSpacing: "1.5px" }}>
          Welcome back to Hisab Finance
        </p>

        <form onSubmit={handleLogin}>
          <div>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
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
            Login
          </button>

        </form>

        <button
          className="pill"
          onClick={() => setPage("signup")}
        >
          Create new account
        </button>

      </div>
    </div>
  );
}