import React, { useState } from "react";

const API = "http://localhost:3000";

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
    <div className="auth-card">

      <h2>Login</h2>

      <form onSubmit={handleLogin}>

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

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

        <button className="auth-btn">
          Login
        </button>

      </form>

      <br />

      <button
        className="pill"
        onClick={() => setPage("signup")}
      >
        Create account
      </button>

    </div>
  );
}