import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        console.log(data)
        if (res.ok) {
          setTicket(data);
          console.log(data)
        } else {
          alert(data.message || "Failed to fetch ticket");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  if (loading) return <div className="text-center mt-20"><span className="loading loading-spinner text-primary"></span></div>;
  if (!ticket) return <div className="text-center mt-20 font-bold">Ticket not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
      <button onClick={() => navigate(-1)} className="bg-amber-300 text-sm text-black btn btn-ghost btn-sm mb-4">
        ← Back to Tickets
      </button>

      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body p-4 sm:p-6 md:p-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="w-full">
              <h2 className="card-title text-2xl sm:text-3xl font-bold break-words">{ticket.title}</h2>
              <p className="text-sm text-base-content/60 mt-1">
                Reported by <span className="font-semibold">{ticket.creatorName}</span> on {new Date(ticket.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-base-content/60 mt-1 break-all">
                Creator's email: <span className="font-semibold">{ticket.creatorEmail}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto mt-2 md:mt-0">
              {ticket.status && <div className="badge badge-primary whitespace-nowrap">{ticket.status}</div>}
              {ticket.priority && <div className="badge badge-outline whitespace-nowrap">{ticket.priority} Priority</div>}
            </div>
          </div>

          {/* Description */}
          <div className="bg-base-200 p-3 sm:p-5 rounded-xl mb-6 overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">Description</h3>
            <p className="whitespace-pre-wrap break-words text-sm sm:text-base">{ticket.description}</p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1 sm:mb-2">Helper's Name</h3>
              <p className="font-medium text-sm sm:text-base">{ticket.assignedTo?.userName || "Unassigned"}</p>
            </div>
            <div className="min-w-0"> {/* min-w-0 prevents flex blowout with long emails */}
              <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1 sm:mb-2">Assigned To</h3>
              <p className="font-medium text-sm sm:text-base break-all">{ticket.assignedTo?.email || "Unassigned"}</p>
            </div>

            {ticket.relatedSkills?.length > 0 && (
              <div className="sm:col-span-2 md:col-span-1 mt-2 sm:mt-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">Related Skills</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  { 
                    ticket.relatedSkills.map((skill, index) => (
                      <span key={index} className="badge badge-neutral text-xs sm:text-sm">{skill}</span>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* AI Notes */}
          {ticket.helpfulNotes && (
            <>
              <div className="divider my-4 sm:my-6 text-sm sm:text-base">AI Assistant</div>
              <div className="bg-primary/10 border border-primary/20 p-3 sm:p-5 rounded-xl overflow-hidden">
                <div className="prose prose-sm sm:prose-base max-w-none text-base-content break-words">
                  <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}