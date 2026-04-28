import { useState } from "react";

const CATEGORIES = ["All", "Technology", "Finance", "Marketing", "Design", "Sales", "Healthcare", "Education", "Engineering", "Data Science", "HR", "Legal"];
const EXP_LEVELS = ["All", "Fresher", "1-3 years", "3-5 years", "5-10 years", "10+ years"];
const JOB_TYPES = ["All", "Full-time", "Part-time", "Remote", "Hybrid", "Contract", "Internship"];
const DATE_POSTED = ["Any time", "Past 24 hours", "Past week", "Past month"];

const SOURCE_META = {
  "Indeed": { color: "#003A9B", light: "#E8EEFB" },
  "LinkedIn": { color: "#0A66C2", light: "#E7F0FA" },
  "Naukri": { color: "#FF6B35", light: "#FFF0EB" },
  "Glassdoor": { color: "#0CAA41", light: "#E6F7EC" },
  "Internshala": { color: "#00A689", light: "#E0F5F1" },
  "Monster": { color: "#6D28D9", light: "#EDE9FE" },
  "Web": { color: "#475569", light: "#F1F5F9" },
};
const getSrc = s => SOURCE_META[s] || SOURCE_META["Web"];
const logoColors = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444"];
const logoColor = n => logoColors[(n || "").charCodeAt(0) % logoColors.length];
const initials = n => (n || "?").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

// Robust JSON extractor — pulls valid job objects one by one
function extractJobs(raw) {
  const jobs = [];
  // Try full array parse first
  try {
    const s = raw.indexOf("["), e = raw.lastIndexOf("]");
    if (s !== -1 && e !== -1) {
      const arr = JSON.parse(raw.slice(s, e + 1));
      if (Array.isArray(arr) && arr.length) return arr;
    }
  } catch (_) { }

  // Fall back: extract individual objects via regex
  const objRe = /\{[\s\S]*?\}/g;
  let m;
  while ((m = objRe.exec(raw)) !== null) {
    try {
      const obj = JSON.parse(m[0]);
      if (obj.title && obj.company) jobs.push(obj);
    } catch (_) { }
  }
  return jobs;
}

const css = `
*{box-sizing:border-box;margin:0;padding:0}
.root{min-height:100vh;background:#0F172A;color:#E2E8F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.hero{background:linear-gradient(135deg,#0F172A 0%,#1E1B4B 50%,#0F172A 100%);padding:44px 24px 28px;text-align:center;border-bottom:1px solid #1E293B}
.hero h1{font-size:34px;font-weight:700;background:linear-gradient(135deg,#818CF8,#C084FC,#FB7185);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px}
.hero p{color:#94A3B8;font-size:14px;margin-bottom:24px}
.search-row{display:flex;gap:10px;max-width:680px;margin:0 auto 16px}
.search-row input{flex:1;background:#1E293B;border:1px solid #334155;border-radius:12px;padding:13px 16px;color:#E2E8F0;font-size:14px;outline:none;transition:border .2s}
.search-row input:focus{border-color:#818CF8;box-shadow:0 0 0 3px rgba(129,140,248,.15)}
.search-row input::placeholder{color:#475569}
.btn-s{background:linear-gradient(135deg,#6366F1,#8B5CF6);border:none;border-radius:12px;padding:13px 26px;color:#fff;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;transition:opacity .2s}
.btn-s:hover{opacity:.88}
.btn-s:disabled{opacity:.55;cursor:not-allowed}
.pills{display:flex;gap:8px;flex-wrap:wrap;max-width:680px;margin:0 auto;justify-content:center}
.pill{background:#1E293B;border:1px solid #334155;border-radius:20px;padding:5px 13px;color:#94A3B8;font-size:12px;cursor:pointer;transition:all .2s}
.pill:hover{border-color:#818CF8;color:#818CF8}
.pill.on{background:rgba(99,102,241,.15);border-color:#6366F1;color:#818CF8}
.main{max-width:1080px;margin:0 auto;padding:22px 14px;display:grid;grid-template-columns:240px 1fr;gap:22px}
@media(max-width:700px){.main{grid-template-columns:1fr}.sidebar{display:none}}
.sidebar{display:flex;flex-direction:column;gap:14px}
.fbox{background:#1E293B;border-radius:14px;padding:16px}
.fbox h3{font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px}
.fopt{display:flex;align-items:center;gap:8px;padding:5px 0;cursor:pointer;color:#94A3B8;font-size:13px;border-radius:6px;transition:color .15s}
.fopt:hover{color:#E2E8F0}
.fopt.on{color:#818CF8;font-weight:500}
.fdot{width:7px;height:7px;border-radius:50%;background:#334155;flex-shrink:0;transition:background .15s}
.fopt.on .fdot{background:#6366F1}
.content{display:flex;flex-direction:column;gap:14px}
.toolbar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
.rcount{font-size:13px;color:#64748B}
.rcount b{color:#818CF8}
.sort-sel{background:#1E293B;border:1px solid #334155;border-radius:8px;padding:5px 10px;color:#94A3B8;font-size:12px;cursor:pointer}
.card{background:#1E293B;border:1px solid #1E293B;border-radius:16px;padding:18px;transition:all .2s}
.card:hover{border-color:#334155;background:#243044;transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,.35)}
.ctop{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px}
.clogo{width:44px;height:44px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;flex-shrink:0}
.cmeta{flex:1}
.jtitle{font-size:15px;font-weight:600;color:#E2E8F0;margin-bottom:2px}
.jcomp{font-size:13px;color:#94A3B8}
.sbadge{font-size:11px;font-weight:600;padding:3px 9px;border-radius:6px;white-space:nowrap;flex-shrink:0}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
.tag{font-size:11px;padding:3px 9px;border-radius:5px;background:#0F172A;color:#64748B;border:1px solid #1E293B}
.tag.hi{background:rgba(99,102,241,.1);color:#818CF8;border-color:rgba(99,102,241,.2)}
.desc{font-size:12px;color:#64748B;line-height:1.6;margin-bottom:12px}
.cfoot{display:flex;justify-content:space-between;align-items:center}
.ptime{font-size:11px;color:#475569}
.abtn{background:linear-gradient(135deg,#6366F1,#8B5CF6);border:none;border-radius:7px;padding:7px 16px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;text-decoration:none;transition:opacity .2s}
.abtn:hover{opacity:.85}
.skel{background:#1E293B;border-radius:16px;padding:18px;animation:pulse 1.4s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
.sl{background:#334155;border-radius:4px;height:12px;margin-bottom:8px}
.empty{text-align:center;padding:50px 20px;color:#475569}
.empty-icon{font-size:44px;margin-bottom:14px}
.empty h3{font-size:17px;color:#64748B;margin-bottom:6px}
.srcs{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:10px}
.sdot{font-size:11px;padding:3px 10px;border-radius:20px;font-weight:500}
.err{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);border-radius:12px;padding:14px;color:#FCA5A5;font-size:13px}
.prog{height:3px;background:#1E293B;border-radius:3px;margin-bottom:4px;overflow:hidden}
.prog-bar{height:100%;background:linear-gradient(90deg,#6366F1,#8B5CF6);border-radius:3px;transition:width .4s ease}
.status{font-size:12px;color:#64748B;margin-bottom:12px}
`;

function Skel() {
  return (
    <div className="skel">
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 11, background: "#334155", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="sl" style={{ width: "55%" }} />
          <div className="sl" style={{ width: "38%", height: 10 }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[75, 55, 85, 65].map((w, i) => <div key={i} className="sl" style={{ width: w, height: 22, borderRadius: 5, margin: 0 }} />)}
      </div>
      <div className="sl" style={{ width: "100%" }} /><div className="sl" style={{ width: "80%" }} />
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [category, setCategory] = useState("All");
  const [expLevel, setExpLevel] = useState("All");
  const [jobType, setJobType] = useState("All");
  const [datePosted, setDatePosted] = useState("Any time");
  const [sortBy, setSortBy] = useState("Relevance");

  const fetchJobs = async (pageNumber = 1) => {
    if (loading) return;

    setLoading(true);
    setError("");
    setJobs([]);
    setSearched(true);
    setProgress(20);
    setStatusMsg("Searching jobs in India...");

    try {
      const searchText = query
        ? `${query} jobs in India`
        : "software developer jobs in India";

      const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
        searchText
      )}&page=${pageNumber}&num_pages=1`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": "017f474678mshc13a2ce3c84047cp1042acjsnb3bb809e51e3",
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch jobs");

      setProgress(60);
      setStatusMsg("Processing results...");

      const data = await res.json();

      console.log(data);
      
      const parsed = (data.data || [])
        .filter((job) => {
          const country = (job.job_country || "").toLowerCase();
          const city = (job.job_city || "").toLowerCase();
          const title = (job.job_title || "").toLowerCase();
          const desc = (job.job_description || "").toLowerCase();

          return (
            country.includes("india") ||
            country === "in" ||
            city.includes("bangalore") ||
            city.includes("hyderabad") ||
            city.includes("mumbai") ||
            city.includes("delhi") ||
            city.includes("chennai") ||
            city.includes("pune") ||
            title.includes("india") ||
            desc.includes("india")
          );
        })
        .map((job) => ({
          title: job.job_title,
          company: job.employer_name,
          location: job.job_city || "India",
          salary:
            job.job_min_salary && job.job_max_salary
              ? `${job.job_min_salary} - ${job.job_max_salary}`
              : null,
          type: job.job_employment_type || "Full-time",
          experience: "Not specified",
          category: "Technology",
          description: job.job_description?.slice(0, 160) + "...",
          source: "Web",
          url: job.job_apply_link,
          posted: "Recently",
          skills: [],
        }));

      if (!parsed.length) throw new Error("No jobs found");

      setJobs(parsed);
      setPage(pageNumber);

      setProgress(100);
      setStatusMsg("");
    } catch (e) {
      setError(e.message || "Failed to fetch jobs");
    }

    setLoading(false);
    setProgress(0);
  };
  const filtered = jobs.filter(j => {
    if (category !== "All" && j.category !== category) return false;
    if (jobType !== "All" && j.type !== jobType) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy !== "Newest") return 0;
    const p = s => { if (!s) return 999; const n = parseInt(s); return isNaN(n) ? 999 : s.includes("hour") ? n / 24 : s.includes("week") ? n * 7 : s.includes("month") ? n * 30 : n; };
    return p(a.posted) - p(b.posted);
  });

  return (
    <>
      <style>{css}</style>
      <div className="root">
        <div className="hero">
          <h1>JobSearch AI</h1>
          <p>Live jobs from Indeed · LinkedIn · Naukri · Glassdoor & more</p>
          <div className="search-row">
            <input
              type="text" placeholder="Job title, skill, company... e.g. React Developer, Data Analyst"
              value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchJobs(1)}
            />
            <button className="btn-s" onClick={() => fetchJobs(1)} disabled={loading}>
              {loading ? "Searching…" : "Search Jobs"}
            </button>
          </div>
          <div className="pills">
            {JOB_TYPES.filter(t => t !== "All").map(t => (
              <div key={t} className={`pill${jobType === t ? " on" : ""}`} onClick={() => setJobType(jobType === t ? "All" : t)}>{t}</div>
            ))}
          </div>
        </div>

        <div className="main">
          <div className="sidebar">
            {[["Category", CATEGORIES, category, setCategory], ["Experience", EXP_LEVELS, expLevel, setExpLevel], ["Date Posted", DATE_POSTED, datePosted, setDatePosted]].map(([label, opts, val, set]) => (
              <div className="fbox" key={label}>
                <h3>{label}</h3>
                {opts.map(o => (
                  <div key={o} className={`fopt${val === o ? " on" : ""}`} onClick={() => set(o)}>
                    <div className="fdot" />{o}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="content">
            {loading && (
              <div>
                <div className="prog"><div className="prog-bar" style={{ width: `${progress}%` }} /></div>
                <div className="status">{statusMsg}</div>
              </div>
            )}

            {(jobs.length > 0 || loading) && (
              <div className="toolbar">
                <div className="rcount">
                  {loading ? "Fetching listings…" : <><b>{filtered.length}</b> jobs{query ? ` for "${query}"` : ""}</>}
                </div>
                <select className="sort-sel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option>Relevance</option><option>Newest</option>
                </select>
              </div>
            )}

            {error && <div className="err">⚠️ {error}</div>}

            {loading && [1, 2, 3, 4].map(i => <Skel key={i} />)}

            {!loading && !searched && (
              <div className="empty">
                <div className="empty-icon">🔍</div>
                <h3>Search for your next opportunity</h3>
                <p style={{ fontSize: 13, marginBottom: 14 }}>Type a job title, skill, or company above</p>
                <div className="srcs">
                  {Object.entries(SOURCE_META).filter(([k]) => k !== "Web").map(([name, m]) => (
                    <span key={name} className="sdot" style={{ background: m.light, color: m.color }}>{name}</span>
                  ))}
                </div>
              </div>
            )}

            {!loading && searched && !error && filtered.length === 0 && (
              <div className="empty">
                <div className="empty-icon">😕</div>
                <h3>No jobs found</h3>
                <p style={{ fontSize: 13 }}>Try adjusting filters or search terms</p>
              </div>
            )}

            {!loading && filtered.map((job, i) => {
              const src = getSrc(job.source);
              const lc = logoColor(job.company);
              return (
                <div className="card" key={i}>
                  <div className="ctop">
                    <div className="clogo" style={{ background: lc + "22", color: lc }}>{initials(job.company)}</div>
                    <div className="cmeta">
                      <div className="jtitle">{job.title}</div>
                      <div className="jcomp">{job.company}</div>
                    </div>
                    <span className="sbadge" style={{ background: src.light, color: src.color }}>{job.source}</span>
                  </div>
                  <div className="tags">
                    {job.location && <span className="tag">📍 {job.location}</span>}
                    {job.type && <span className="tag hi">💼 {job.type}</span>}
                    {job.salary && <span className="tag hi">💰 {job.salary}</span>}
                    {job.experience && <span className="tag">⏱ {job.experience}</span>}
                    {(job.skills || []).slice(0, 3).map((s, si) => <span key={si} className="tag">{s}</span>)}
                  </div>
                  {job.description && <div className="desc">{job.description}</div>}
                  <div className="cfoot">
                    <span className="ptime">{job.posted || "Recently posted"}</span>
                    <a className="abtn" href={job.url} target="_blank" rel="noopener noreferrer">Apply Now →</a>
                  </div>
                </div>
              );
            })}

            {!loading && jobs.length > 0 && (
              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                marginTop: "20px"
              }}>
                <button
                  className="btn-s"
                  onClick={() => fetchJobs(page - 1)}
                  disabled={page === 1}
                >
                  ← Prev
                </button>

                <span style={{ alignSelf: "center", fontSize: "13px" }}>
                  Page {page}
                </span>

                <button
                  className="btn-s"
                  onClick={() => fetchJobs(page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
