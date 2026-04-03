import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Signup() {
    const [form, setForm] = useState({ userName: "", email: "", password: "", skills: [] })
    const [skillInput, setSkillInput] = useState(""); // Local state for the current skill being typed
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    // --- NEW SKILL HANDLERS ---
    // --- UPDATED SKILL HANDLERS ---
const addSkill = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;

    const newSkillsArray = skillInput
        .split(",")
        .map(s => s.trim())
        .filter(s => s !== "");

    setForm((prev) => {
        const combinedSkills = [...prev.skills, ...newSkillsArray];
        const uniqueSkills = [...new Set(combinedSkills)];
        
        return {
            ...prev,
            skills: uniqueSkills
        };
    });

    setSkillInput(""); // Clear the input box
};

const removeSkill = (skillToRemove) => {
    // Use functional update here too!
    setForm((prev) => ({
        ...prev,
        skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
};

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            const data = await res.json()
            if (res.ok) {
                localStorage.setItem("token", data.token)
                localStorage.setItem("user", JSON.stringify(data.createdUser));
                navigate("/");
            } else {
                alert(data.message || "Signup failed")
            }
        } catch (error) {
            console.log(error)
            alert("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="card w-full max-w-md shadow-2xl bg-base-100 border border-base-300">
                <div className="card-body">

                    <div className="text-center mb-4">
                        <h2 className="text-3xl font-bold text-base-content">Create an Account</h2>
                        <p className="text-base-content/60 mt-2 text-sm">Join us to get started</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-3">
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text font-semibold">Username</span></div>
                            <input type="text" name="userName" placeholder="johndoe123" className="input input-bordered w-full focus:input-primary" value={form.userName} onChange={handleChange} required />
                        </label>

                        <label className="form-control w-full">
                            <div className="label"><span className="label-text font-semibold">Email</span></div>
                            <input type="email" name="email" placeholder="john@example.com" className="input input-bordered w-full focus:input-primary" value={form.email} onChange={handleChange} required />
                        </label>

                        <label className="form-control w-full">
                            <div className="label"><span className="label-text font-semibold">Password</span></div>
                            <input type="password" name="password" placeholder="••••••••" className="input input-bordered w-full focus:input-primary" value={form.password} onChange={handleChange} required />
                        </label>

                        {/* --- NEW SKILLS SECTION --- */}
                        <label className="form-control w-full">
                            <div className="label">
                                <span className="label-text font-semibold">Skills</span>
                                <span className="label-text-alt text-base-content/50">Press Add to tag</span>
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="e.g. React, Node.js" 
                                    className="input input-bordered w-full focus:input-primary"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => { if(e.key === 'Enter') addSkill(e) }}
                                />
                                <button type="button" onClick={addSkill} className="btn btn-neutral">Add</button>
                            </div>
                            
                            {/* Display area for skills */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {form.skills.map((skill, index) => (
                                    <div key={index} className="badge badge-primary gap-2 p-3 font-medium">
                                        {skill}
                                        <button 
                                            type="button" 
                                            onClick={() => removeSkill(skill)}
                                            className="hover:text-error transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </label>
                        {/* ------------------------- */}

                        <div className="form-control mt-6">
                            <button type="submit" className="btn btn-primary w-full text-base font-bold shadow-md" disabled={loading}>
                                {loading ? <><span className="loading loading-spinner"></span> Signing up...</> : "Sign Up"}
                            </button>
                        </div>
                    </form>

                    <div className="divider my-4 text-base-content/40 text-xs">OR</div>
                    <p className="text-center text-sm text-base-content/80">
                        Already have an account?{" "}
                        <Link to="/login" className="link link-primary font-bold hover:no-underline transition-all">Log in</Link>
                    </p>

                </div>
            </div>
        </div>
    );
}

export default Signup