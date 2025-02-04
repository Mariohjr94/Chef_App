import { useState } from "react";
import { useLoginMutation, useRegisterMutation } from "./authSlice";
import { useNavigate } from "react-router-dom";
import './AuthForm.css';  

function AuthForm() {
  const [login] = useLoginMutation();
  const [register] = useRegisterMutation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); 
  const [name, setName] = useState(""); 
  const [avatarFile, setAvatarFile] = useState(null); 

  const [isLogin, setIsLogin] = useState(true);
  const authType = isLogin ? "Login" : "Register";
  const oppositeAuthCopy = isLogin
    ? "Don't have an account?"
    : "Already have an account?";
  const oppositeAuthType = isLogin ? "Register" : "Login";

  async function attemptAuth(event) {
    event.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    const authMethod = isLogin ? login : register;
    const credentials = { username, password };

try {
  setLoading(true);
  const result = await authMethod(credentials).unwrap(); 
  console.log("Login successful, redirecting to dashboard...", result);
  
  if (result.token) {
    localStorage.setItem("token", result.token);  
  }
  
  navigate("/");  
} catch (err) {
  setLoading(false);

  if (err.status === 401) {
    setError("Invalid login credentials.");
  } else if (err.status === 500) {
    setError("Server error. Please try again later.");
  } else {
    setError(err?.data?.message || "An unexpected error occurred.");
  }
}

  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4">
        <h1 className="text-center mb-4">{authType}</h1>
        <form onSubmit={attemptAuth} name={authType}>
          <div className="mb-3">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {/* 🔹 Only show name & avatar when registering */}
          {!isLogin && (
            <>
              <div className="mb-3">
                <label className="form-label" htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="avatar">
                  Profile Picture (Optional)
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="avatar"
                  accept="image/*"
                  onChange={(event) => setAvatarFile(event.target.files[0])}
                />
              </div>
            </>
          )}
          {error && <p className="text-danger text-center">{error}</p>}
          <button
            type="submit"
            className="btn btn-dark w-100"
            disabled={loading}
          >
            {loading ? "Loading..." : authType}
          </button>
        </form>
        <div className="text-center mt-3">
          <p>
            {oppositeAuthCopy}{" "}
            <span
              className="text-decoration-none"
              role="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{ cursor: 'pointer' }}  // Link cursor style
            >
              {oppositeAuthType}
            </span>
          </p>
        </div>
        {loading && <p className="text-center">Logging in...</p>}
      </div>
    </div>
  );
}

export default AuthForm;
