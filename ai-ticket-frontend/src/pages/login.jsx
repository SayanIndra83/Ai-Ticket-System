import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
      const [form, setForm] = useState({email:"", password:""})
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value})
    }

    const handleLogin = async(e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/login`,{
          method:"POST",
          headers: {"Content-Type" : "application/json"},
          body: JSON.stringify(form)
        });

        const data = await res.json()
        if(res.ok){
          localStorage.setItem("token", data.token)
          localStorage.setItem("user", JSON.stringify(data.loggedInUser));
          navigate("/");
        }
        else{
          alert(data.message|| "Login failed")
        }
      } catch (error) {
        alert("Something went wrong")
      }
      finally {setLoading(false)}
    }

  return (
     <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md shadow-2xl bg-base-100 border border-base-300">
        <div className="card-body">
          
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-base-content">Login</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">


            {/* Email Input */}
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-semibold">Email</span>
              </div>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                className="input input-bordered w-full focus:input-primary transition-colors"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            {/* Password Input */}
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-semibold">Password</span>
              </div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="input input-bordered w-full focus:input-primary transition-colors"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            {/* Submit Button */}
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full text-base font-bold shadow-md"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Logging...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>

          <div className="divider my-4 text-base-content/40 text-xs">OR</div>
          <p className="text-center text-sm text-base-content/80">
            Don't have an account?{" "}
            <Link to="/signup" className="link link-primary font-bold hover:no-underline transition-all">
              Register User
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login
