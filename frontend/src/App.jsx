import { useEffect, useMemo, useState } from "react";

const apiBase = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
const resumeUrl = `${apiBase}/api/resume`;
const healthUrl = `${apiBase}/health`;

const buildTime = import.meta.env.VITE_BUILD_TIME || "unknown";
const gitCommit = import.meta.env.VITE_GIT_COMMIT || "unknown";
const repoSlug = import.meta.env.VITE_GITHUB_REPO || "";
const resumeFileCandidates = [
  import.meta.env.VITE_RESUME_FILENAME,
  "Akshay_Hudke_Platform_SRE_Engineer.pdf",
  "resume.pdf",
].filter(Boolean);

const formatRange = (start, end) => {
  if (!start && !end) return "";
  if (start && !end) return `${start} - Present`;
  if (!start && end) return end;
  return `${start} - ${end}`;
};

const safeArray = (value) => (Array.isArray(value) ? value : []);

export default function App() {
  const [resume, setResume] = useState(null);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [resumeDownloadUrl, setResumeDownloadUrl] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    const isDark = stored ? stored === "dark" : false;
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const base = import.meta.env.BASE_URL || "/";

    async function resolveResumeUrl() {
      for (const filename of resumeFileCandidates) {
        const url = `${base}${filename}`;
        try {
          const response = await fetch(url, { method: "HEAD" });
          if (response.ok) {
            if (isMounted) setResumeDownloadUrl(url);
            return;
          }
          if (response.status === 405) {
            const getResponse = await fetch(url);
            if (getResponse.ok && isMounted) {
              setResumeDownloadUrl(url);
              return;
            }
          }
        } catch (_) {
          // Ignore and try next candidate.
        }
      }
    }

    resolveResumeUrl();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    window.localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [resumeResponse, healthResponse] = await Promise.all([
          fetch(resumeUrl),
          fetch(healthUrl),
        ]);

        if (!resumeResponse.ok) {
          throw new Error("Unable to load resume data.");
        }

        const resumeData = await resumeResponse.json();
        const healthData = healthResponse.ok ? await healthResponse.json() : null;

        if (isMounted) {
          setResume(resumeData);
          setHealth(healthData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const badgeUrl = useMemo(() => {
    if (!repoSlug) return "";
    const workflow = resume?.meta?.build_badge_workflow || "ci.yml";
    return `https://github.com/${repoSlug}/actions/workflows/${workflow}/badge.svg`;
  }, [repoSlug, resume]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted text-sm">Loading resume data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card px-6 py-4 text-sm text-muted">{error}</div>
      </div>
    );
  }

  if (!resume) {
    return null;
  }

  const basics = resume.basics || {};
  const meta = resume.meta || {};
  const apiStatus =
    health?.status === "ok" ? "Healthy" : health ? "Degraded" : "Unknown";
  const apiTone =
    health?.status === "ok"
      ? "text-emerald-500"
      : health
        ? "text-amber-500"
        : "text-muted";
  const repoUrl = repoSlug ? `https://github.com/${repoSlug}` : "";
  const resumeReady = Boolean(resumeDownloadUrl);

  const contactItems = [
    { label: "Email", value: basics.email, href: basics.email ? `mailto:${basics.email}` : "" },
    { label: "Phone", value: basics.phone },
    { label: "Website", value: basics.website, href: basics.website },
    { label: "GitHub", value: basics.github, href: basics.github },
    { label: "LinkedIn", value: basics.linkedin, href: basics.linkedin },
  ].filter((item) => item.value);

  const locationParts = [
    basics.location?.city,
    basics.location?.region,
    basics.location?.country,
  ].filter(Boolean);

  return (
    <div className="min-h-screen pb-16">
      <header className="container-edge pt-10">
        <div className="card p-8 md:p-12">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="kicker">Profile</p>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={resumeReady ? resumeDownloadUrl : "#"}
                  onClick={(event) => {
                    if (!resumeReady) event.preventDefault();
                  }}
                  download={resumeReady}
                  aria-disabled={!resumeReady}
                  className={resumeReady ? "btn-primary" : "btn-primary opacity-60"}
                >
                  {resumeReady ? "Download CV" : "CV unavailable"}
                </a>
                {repoUrl && (
                  <a
                    href={repoUrl}
                    className="btn-secondary"
                  >
                    GitHub Repo
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setDarkMode((prev) => !prev)}
                  className="btn-contrast"
                >
                  <span>Theme</span>
                  <span className="font-mono text-[11px]">
                    {darkMode ? "Dark" : "Light"}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-semibold mt-4">
                {basics.name}
              </h1>
              <p className="text-lg text-muted mt-2">{basics.role}</p>
            </div>
            <p className="text-sm md:text-base leading-relaxed text-muted">
              {basics.summary}
            </p>
            <div className="flex flex-wrap gap-2">
              {meta.availability && <span className="tag">{meta.availability}</span>}
              {meta.location && <span className="tag">{meta.location}</span>}
              {meta.tagline && <span className="tag">{meta.tagline}</span>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {contactItems.map((item) => (
                <div
                  key={item.label}
                  className="card-quiet px-4 py-3 text-sm text-muted"
                >
                  <div className="text-xs uppercase tracking-[0.25em] text-muted">
                    {item.label}
                  </div>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="mt-2 block break-all text-text hover:text-accent"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <div className="mt-2 break-all text-text">{item.value}</div>
                  )}
                </div>
              ))}
              {locationParts.length > 0 && (
                <div className="card-quiet px-4 py-3 text-sm text-muted">
                  <div className="text-xs uppercase tracking-[0.25em] text-muted">
                    Location
                  </div>
                  <div className="mt-2 break-words text-text">
                    {locationParts.join(", ")}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container-edge mt-12 space-y-12">
        {safeArray(resume.highlights).length > 0 && (
          <section>
            <p className="section-title">Highlights</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {resume.highlights.map((item) => (
                <div key={item} className="card-quiet p-5 text-sm text-muted">
                  {item}
                </div>
              ))}
            </div>
          </section>
        )}

        {safeArray(resume.impact).length > 0 && (
          <section>
            <p className="section-title">Impact</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {resume.impact.map((item) => (
                <div key={item.label} className="card-quiet p-5">
                  <div className="spec-label">{item.label}</div>
                  <div className="text-2xl font-semibold mt-3">{item.value}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <p className="section-title">Experience</p>
          <div className="mt-4 space-y-4">
            {safeArray(resume.experience).map((role) => {
              const roleMeta = [role.company, role.location, role.type]
                .filter(Boolean)
                .join(" • ");

              return (
                <div key={`${role.company}-${role.start}`} className="card-quiet p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{role.role}</h3>
                      <p className="text-muted text-sm mt-1">{roleMeta}</p>
                    </div>
                    <div className="text-xs text-muted font-mono">
                      {formatRange(role.start, role.end)}
                    </div>
                  </div>
                  <ul className="mt-4 list-disc list-outside pl-5 text-sm text-muted space-y-2">
                    {safeArray(role.bullets).map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {safeArray(resume.projects).length > 0 && (
          <section>
            <p className="section-title">Projects</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {safeArray(resume.projects).map((project) => (
                <div key={project.name} className="card-quiet p-6">
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <p className="text-sm text-muted mt-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {safeArray(project.stack).map((item) => (
                      <span key={item} className="tag">
                        {item}
                      </span>
                    ))}
                  </div>
                  {project.links?.repo && (
                    <a
                      className="text-sm text-accent hover:text-accent2 mt-4 inline-flex"
                      href={project.links.repo}
                    >
                      View repo
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <p className="section-title">Skills</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {safeArray(resume.skills).map((group) => (
              <div key={group.category} className="card-quiet p-6">
                <h3 className="text-base font-semibold">{group.category}</h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  {safeArray(group.items).map((skill) => (
                    <span key={skill} className="tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-quiet p-6">
            <p className="section-title">Education</p>
            <div className="mt-4 space-y-4">
              {safeArray(resume.education).map((item) => (
                <div key={item.institution}>
                  <h3 className="text-base font-semibold">{item.degree}</h3>
                  <p className="text-sm text-muted mt-1">
                    {item.institution} • {formatRange(item.start, item.end)}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="card-quiet p-6">
            <p className="section-title">Certifications</p>
            <div className="mt-4 space-y-4">
              {safeArray(resume.certifications).map((item) => (
                <div key={item.name}>
                  <h3 className="text-base font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted mt-1">
                    {item.issuer} • {item.year}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="container-edge mt-12">
        <div className="card-quiet px-6 py-5 text-xs text-muted">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span>Deployment: {buildTime}</span>
              <span>Commit: {gitCommit.slice(0, 7)}</span>
              {meta.updated && <span>Resume updated: {meta.updated}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`font-medium ${apiTone}`}>API: {apiStatus}</span>
              {health?.timestamp && (
                <span className="font-mono">{health.timestamp}</span>
              )}
            </div>
            {badgeUrl && (
              <img
                src={badgeUrl}
                alt="GitHub Actions build status"
                className="h-5"
              />
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
