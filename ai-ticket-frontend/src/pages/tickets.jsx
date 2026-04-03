import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Tickets() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingList, setFetchingList] = useState(true);

  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    user = null;
  }

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      });
      const data = await res.json();

      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setFetchingList(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleLogout = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) console.warn("Backend logout had an issue, but cleaning up local data anyway.");
    } catch (error) {
      console.log("Internal server error while logging out.", error);
    } finally {
      localStorage.clear("token");
      localStorage.clear("user");
      navigate("/login");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({ title: "", description: "" });
        fetchTickets();
      } else {
        alert(data.message || "Ticket creation failed");
      }
    } catch (err) {
      alert("Error creating ticket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine badge color based on status
  const getStatusBadgeColor = (status) => {
    if (!status) return "badge-outline";
    const upperStatus = status.toUpperCase();
    if (upperStatus === "UNDER_MODERATION") return "badge-warning"; // Yellow/Orange
    if (upperStatus === "TODO") return "badge-info"; // Blue
    if (upperStatus === "IN_PROGRESS") return "badge-primary"; // Purple/Primary
    if (upperStatus === "DONE" || upperStatus === "COMPLETED") return "badge-success"; // Green
    return "badge-outline"; // Default fallback
  };

  return (
    <div className="relative w-full h-auto bg-white/40">
      <div className="fixed top-0 left-0 w-full h-16 py-2 px-4 sm:px-6 flex flex-row items-center justify-between bg-base-100/80 backdrop-blur-md z-[99] border-b border-base-200">
        <div>
          <Link
            to={"/"}
            className="text-lg sm:text-xl font-bold text-green-400 tracking-wide"
          >
            Assistant.Ai
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 text-sm sm:text-base">
          {!token ? (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm font-semibold px-2 sm:px-4">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm font-semibold px-2 sm:px-4">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <span className="text-base font-medium hidden sm:inline-block">
                Welcome <span className="text-cyan-500">{user?.userName || "User"}</span>
              </span>
              {user?.role === "admin" ? (
                <Link to="/admin" className="text-sm sm:text-base btn btn-ghost btn-sm font-semibold px-2 sm:px-3">
                  Admin Panel
                </Link>
              ) : (
                <></>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-sm sm:text-base btn btn-error text-white border-none btn-sm px-2 sm:px-4 transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-24 max-w-4xl mx-auto px-4 pb-4 md:pb-6 mb-12 animate-fade-in">
        
        {/* --- Header & Form Section --- */}
        <div className="card bg-base-200 shadow-sm border border-base-300 mb-8 sm:mb-10 rounded-2xl">
          <div className="card-body p-5 sm:p-8">
            <h2 className="card-title text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Create a New Ticket</h2>
            <p className="text-base-content/60 text-sm mb-2">
              Need help? Fill out the form below and the AI assistant will categorize it.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-semibold text-sm sm:text-base">Issue Title</span>
                </div>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Cannot connect to database"
                  className="input input-bordered focus:input-primary w-full bg-base-100 text-sm sm:text-base mb-4"
                  required
                />
              </label>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-semibold text-sm sm:text-base">Detailed Description</span>
                </div>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Please describe the issue in detail..."
                  className="textarea textarea-bordered focus:textarea-primary w-full h-24 sm:h-32 bg-base-100 text-sm sm:text-base"
                  required
                ></textarea>
              </label>

              <div className="card-actions justify-end mt-6">
                <button
                  className="btn btn-primary w-full sm:w-auto px-8 rounded-lg"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Submit Ticket"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* --- Ticket List Section --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold">Your Tickets</h2>
          <div className="badge badge-neutral px-3 py-3 font-semibold w-fit rounded-lg">
            {tickets.length} Total
          </div>
        </div>

        {fetchingList ? (
          <div className="flex justify-center p-10">
            <span className="loading loading-dots loading-lg text-primary"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tickets.map((ticket) => (
              <Link
                key={ticket._id}
                to={`/tickets/${ticket._id}`}
                className="card bg-base-200 hover:bg-base-300 border border-base-300/50 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 group rounded-xl overflow-hidden"
              >
                <div className="card-body p-5">
                  <h3 className="card-title text-base sm:text-lg group-hover:text-primary transition-colors break-words">
                    {ticket.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-base-content/70 line-clamp-2 mt-1 break-words">
                    {ticket.description}
                  </p>

                  <div className="divider my-3 opacity-50"></div>

                  <div className="flex flex-wrap justify-between items-center text-[11px] sm:text-xs text-base-content/60 gap-2">
                    <span className="flex items-center gap-1.5 font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>

                    {ticket.status ? (
                      <span className={`badge badge-xs sm:badge-sm font-semibold px-2 py-2.5 rounded-md ${getStatusBadgeColor(ticket.status)}`}>
                        {ticket.status.replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <span className="font-semibold text-primary group-hover:underline whitespace-nowrap">View Details →</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {tickets.length === 0 && (
              <div className="col-span-full text-center py-12 bg-base-200/50 rounded-2xl border-2 border-base-300 border-dashed mx-2 sm:mx-0">
                <p className="text-sm sm:text-base text-base-content/60 font-medium">No tickets submitted yet.</p>
                <p className="text-xs sm:text-sm text-base-content/40 mt-2">Submit a ticket above to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}