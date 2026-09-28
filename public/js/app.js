const state = {
    companies: [],
    applications: [],
    interviews: [],
    skills: [],
    profile: null
};

const $ = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    setupButtons();
    loadAll();
});

async function api(url, options = {}) {

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json"
        },
        ...options
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Request failed");
    }

    return data;
}

async function loadAll() {

    try {

        const [
            companies,
            applications,
            interviews,
            skills,
            profile
        ] = await Promise.all([
            api("/api/companies"),
            api("/api/applications"),
            api("/api/interviews"),
            api("/api/skills"),
            api("/api/profile")
        ]);

        state.companies = companies;
        state.applications = applications;
        state.interviews = interviews;
        state.skills = skills;
        state.profile = profile;

        renderAll();

    } catch (error) {

        console.error(error);

        alert("Unable to load application data.");
    }
}

function renderAll() {

    renderDashboard();
    renderCompanies();
    renderApplications();
    renderInterviews();
    renderSkills();
    renderProfile();
}

/* NAVIGATION */

function setupNavigation() {

    document.querySelectorAll(".nav-item").forEach(button => {

        button.addEventListener("click", () => {
            showSection(button.dataset.section);
        });

    });

    document.querySelectorAll("[data-go]").forEach(button => {

        button.addEventListener("click", () => {
            showSection(button.dataset.go);
        });

    });
}

function showSection(section) {

    document.querySelectorAll(".section").forEach(s => {
        s.classList.remove("active-section");
    });

    document.querySelectorAll(".nav-item").forEach(n => {
        n.classList.remove("active");
    });

    $(section).classList.add("active-section");

    const nav = document.querySelector(
        `.nav-item[data-section="${section}"]`
    );

    if (nav) {
        nav.classList.add("active");
    }

    const titles = {

        dashboard: [
            "Dashboard",
            "Track your placement journey in one place."
        ],

        companies: [
            "Companies",
            "Manage companies and job opportunities."
        ],

        applications: [
            "Applications",
            "Track every placement application."
        ],

        interviews: [
            "Interviews",
            "Manage tests and interview schedules."
        ],

        skills: [
            "Skills",
            "Track your placement preparation."
        ],

        profile: [
            "Profile",
            "Manage your student information."
        ]
    };

    $("pageTitle").textContent = titles[section][0];
    $("pageSubtitle").textContent = titles[section][1];
}

/* BUTTONS */

function setupButtons() {

    $("addCompanyBtn").onclick = () => openCompanyModal();

    $("addApplicationBtn").onclick =
        () => openApplicationModal();

    $("addInterviewBtn").onclick =
        () => openInterviewModal();

    $("addSkillBtn").onclick =
        () => openSkillModal();

    $("quickAdd").onclick =
        () => openApplicationModal();

    $("editProfileBtn").onclick =
        () => openProfileModal();

    $("closeModal").onclick =
        closeModal;

    $("modal").addEventListener("click", event => {

        if (event.target.id === "modal") {
            closeModal();
        }

    });

    $("companySearch").addEventListener(
        "input",
        renderCompanies
    );

    $("applicationSearch").addEventListener(
        "input",
        renderApplications
    );

    $("statusFilter").addEventListener(
        "change",
        renderApplications
    );
}

/* DASHBOARD */

function renderDashboard() {

    $("totalCompanies").textContent =
        state.companies.length;

    $("totalApplications").textContent =
        state.applications.length;

    const active = state.applications.filter(a =>
        !["selected", "offer", "rejected"]
            .includes((a.status || "").toLowerCase())
    );

    const offers = state.applications.filter(a =>
        ["selected", "offer"]
            .includes((a.status || "").toLowerCase())
    );

    $("activeApplications").textContent =
        active.length;

    $("offers").textContent =
        offers.length;

    const recent =
        [...state.applications]
            .reverse()
            .slice(0, 5);

    $("recentApplications").innerHTML =
        recent.length
            ? recent.map(a => `
                <div class="list-item">
                    <strong>${escapeHTML(a.company)}</strong>
                    <span>
                        ${escapeHTML(a.role)}
                        ·
                        ${escapeHTML(a.status)}
                    </span>
                </div>
            `).join("")
            : `<div class="empty">
                No applications yet.
               </div>`;

    const upcoming =
        [...state.interviews]
            .filter(i => i.status !== "Completed")
            .sort((a, b) =>
                a.date.localeCompare(b.date)
            )
            .slice(0, 5);

    $("upcomingInterviews").innerHTML =
        upcoming.length
            ? upcoming.map(i => `
                <div class="list-item">
                    <strong>${escapeHTML(i.company)}</strong>
                    <span>
                        ${escapeHTML(i.type)}
                        ·
                        ${escapeHTML(i.date)}
                    </span>
                </div>
            `).join("")
            : `<div class="empty">
                No upcoming interviews.
               </div>`;
}

/* COMPANIES */

function renderCompanies() {

    const search =
        $("companySearch").value.toLowerCase();

    const companies =
        state.companies.filter(c =>
            `${c.name} ${c.role} ${c.location}`
                .toLowerCase()
                .includes(search)
        );

    $("companiesList").innerHTML =
        companies.length
            ? companies.map(c => `
                <div class="item-card">

                    <div>

                        <h3>
                            ${escapeHTML(c.name)}
                        </h3>

                        <p>
                            ${escapeHTML(c.role)}
                        </p>

                        <p>
                            ${escapeHTML(c.location)}
                            ·
                            ${escapeHTML(c.package)}
                        </p>

                        <p>
                            Deadline:
                            ${escapeHTML(
                c.deadline || "Not specified"
            )}
                        </p>

                    </div>

                    <div class="card-actions">

                        <button
                            class="small-btn"
                            onclick="editCompany('${c.id}')">
                            Edit
                        </button>

                        <button
                            class="small-btn delete-btn"
                            onclick="deleteCompany('${c.id}')">
                            Delete
                        </button>

                    </div>

                </div>
            `).join("")
            : `<div class="empty">
                No companies found.
               </div>`;
}

/* APPLICATIONS */

function renderApplications() {

    const search =
        $("applicationSearch").value.toLowerCase();

    const status =
        $("statusFilter").value;

    const applications =
        state.applications.filter(a => {

            const matchesSearch =
                `${a.company} ${a.role}`
                    .toLowerCase()
                    .includes(search);

            const matchesStatus =
                !status || a.status === status;

            return matchesSearch && matchesStatus;
        });

    $("applicationsList").innerHTML =
        applications.length
            ? applications.map(a => `
                <div class="item-card">

                    <div>

                        <h3>
                            ${escapeHTML(a.company)}
                        </h3>

                        <p>
                            ${escapeHTML(a.role)}
                        </p>

                        <p>
                            Applied:
                            ${escapeHTML(
                a.appliedDate || "Not specified"
            )}
                        </p>

                        <p>
                            Deadline:
                            ${escapeHTML(
                a.deadline || "Not specified"
            )}
                        </p>

                        <span class="badge ${getBadgeClass(a.status)}">
                            ${escapeHTML(a.status)}
                        </span>

                    </div>

                    <div class="card-actions">

                        <button
                            class="small-btn"
                            onclick="editApplication('${a.id}')">
                            Edit
                        </button>

                        <button
                            class="small-btn delete-btn"
                            onclick="deleteApplication('${a.id}')">
                            Delete
                        </button>

                    </div>

                </div>
            `).join("")
            : `<div class="empty">
                No applications found.
               </div>`;
}

/* INTERVIEWS */

function renderInterviews() {

    const interviews =
        [...state.interviews]
            .sort((a, b) =>
                a.date.localeCompare(b.date)
            );

    $("interviewsList").innerHTML =
        interviews.length
            ? interviews.map(i => `
                <div class="item-card">

                    <div>

                        <h3>
                            ${escapeHTML(i.company)}
                        </h3>

                        <p>
                            ${escapeHTML(i.role)}
                        </p>

                        <p>
                            ${escapeHTML(i.type)}
                            ·
                            ${escapeHTML(i.date)}
                            ${escapeHTML(i.time)}
                        </p>

                        <span class="badge">
                            ${escapeHTML(i.status)}
                        </span>

                    </div>

                    <div class="card-actions">

                        <button
                            class="small-btn"
                            onclick="editInterview('${i.id}')">
                            Edit
                        </button>

                        <button
                            class="small-btn delete-btn"
                            onclick="deleteInterview('${i.id}')">
                            Delete
                        </button>

                    </div>

                </div>
            `).join("")
            : `<div class="empty">
                No interviews added.
               </div>`;
}

/* SKILLS */

function renderSkills() {

    $("skillsList").innerHTML =
        state.skills.length
            ? state.skills.map(s => `

                <div class="skill-card">

                    <h3>
                        ${escapeHTML(s.name)}
                    </h3>

                    <p>
                        ${escapeHTML(s.category)}
                    </p>

                    <div class="progress">

                        <div
                            class="progress-bar"
                            style="width:${Math.min(
                100,
                Math.max(0, Number(s.progress))
            )}%">
                        </div>

                    </div>

                    <strong>
                        ${s.progress}%
                    </strong>

                    <div
                        class="card-actions"
                        style="margin-top:12px">

                        <button
                            class="small-btn"
                            onclick="editSkill('${s.id}')">
                            Edit
                        </button>

                        <button
                            class="small-btn delete-btn"
                            onclick="deleteSkill('${s.id}')">
                            Delete
                        </button>

                    </div>

                </div>

            `).join("")
            : `<div class="empty">
                No skills added.
               </div>`;
}

/* PROFILE */

function renderProfile() {

    if (!state.profile) return;

    $("profileName").textContent =
        state.profile.name;

    $("profileBranch").textContent =
        state.profile.branch;

    $("profileCollege").textContent =
        state.profile.college;

    $("profileYear").textContent =
        state.profile.year;

    $("profileCgpa").textContent =
        state.profile.cgpa || "-";

    $("profileEmail").textContent =
        state.profile.email;
}

/* MODAL */

function openModal(title, html, submitHandler) {

    $("modalTitle").textContent = title;

    $("modalForm").innerHTML = html;

    $("modalForm").onsubmit = submitHandler;

    $("modal").classList.remove("hidden");
}

function closeModal() {

    $("modal").classList.add("hidden");

    $("modalForm").innerHTML = "";
}

function field(
    label,
    name,
    type = "text",
    value = "",
    required = false
) {

    return `
        <div class="form-group">

            <label>${label}</label>

            <input
                type="${type}"
                name="${name}"
                value="${escapeHTML(value)}"
                ${required ? "required" : ""}
            >

        </div>
    `;
}

/* COMPANY MODAL */

function openCompanyModal(company = null) {

    openModal(

        company
            ? "Edit Company"
            : "Add Company",

        field(
            "Company Name",
            "name",
            "text",
            company?.name || "",
            true
        ) +

        field(
            "Job Role",
            "role",
            "text",
            company?.role || "",
            true
        ) +

        field(
            "Package",
            "package",
            "text",
            company?.package || ""
        ) +

        field(
            "Location",
            "location",
            "text",
            company?.location || ""
        ) +

        field(
            "Application Deadline",
            "deadline",
            "date",
            company?.deadline || ""
        ) +

        `<button class="primary-btn form-submit">
            Save Company
        </button>`,

        async event => {

            event.preventDefault();

            const data =
                Object.fromEntries(
                    new FormData(event.target)
                );

            try {

                if (company) {

                    await api(
                        `/api/companies/${company.id}`,
                        {
                            method: "PUT",
                            body: JSON.stringify(data)
                        }
                    );

                } else {

                    await api(
                        "/api/companies",
                        {
                            method: "POST",
                            body: JSON.stringify(data)
                        }
                    );

                }

                closeModal();
                await loadAll();

            } catch (error) {

                alert(error.message);

            }
        }
    );
}

/* APPLICATION MODAL */

function openApplicationModal(application = null) {

    openModal(

        application
            ? "Edit Application"
            : "Add Application",

        field(
            "Company",
            "company",
            "text",
            application?.company || "",
            true
        ) +

        field(
            "Role",
            "role",
            "text",
            application?.role || "",
            true
        ) +

        `
        <div class="form-group">

            <label>Status</label>

            <select name="status">

                ${[
            "Interested",
            "Applied",
            "Assessment",
            "Technical Interview",
            "HR Interview",
            "Selected",
            "Rejected"
        ]
            .map(s => `
                        <option
                            ${application?.status === s
                    ? "selected"
                    : ""}>
                            ${s}
                        </option>
                    `)
            .join("")
        }

            </select>

        </div>
        ` +

        field(
            "Applied Date",
            "appliedDate",
            "date",
            application?.appliedDate || ""
        ) +

        field(
            "Deadline",
            "deadline",
            "date",
            application?.deadline || ""
        ) +

        field(
            "Notes",
            "notes",
            "text",
            application?.notes || ""
        ) +

        `<button class="primary-btn form-submit">
            Save Application
        </button>`,

        async event => {

            event.preventDefault();

            const data =
                Object.fromEntries(
                    new FormData(event.target)
                );

            try {

                if (application) {

                    await api(
                        `/api/applications/${application.id}`,
                        {
                            method: "PUT",
                            body: JSON.stringify(data)
                        }
                    );

                } else {

                    await api(
                        "/api/applications",
                        {
                            method: "POST",
                            body: JSON.stringify(data)
                        }
                    );

                }

                closeModal();
                await loadAll();

            } catch (error) {

                alert(error.message);

            }
        }
    );
}

/* INTERVIEW MODAL */

function openInterviewModal(interview = null) {

    openModal(

        interview
            ? "Edit Interview"
            : "Add Interview",

        field(
            "Company",
            "company",
            "text",
            interview?.company || "",
            true
        ) +

        field(
            "Role",
            "role",
            "text",
            interview?.role || ""
        ) +

        `
        <div class="form-group">

            <label>Type</label>

            <select name="type">

                ${[
            "Online Assessment",
            "Technical Interview",
            "HR Interview",
            "Interview"
        ].map(type => `
                    <option
                        ${interview?.type === type
                ? "selected"
                : ""}>
                        ${type}
                    </option>
                `).join("")}

            </select>

        </div>
        ` +

        field(
            "Date",
            "date",
            "date",
            interview?.date || "",
            true
        ) +

        field(
            "Time",
            "time",
            "time",
            interview?.time || ""
        ) +

        `
        <div class="form-group">

            <label>Status</label>

            <select name="status">

                ${[
            "Upcoming",
            "Completed",
            "Cancelled"
        ].map(status => `
                    <option
                        ${interview?.status === status
                ? "selected"
                : ""}>
                        ${status}
                    </option>
                `).join("")}

            </select>

        </div>
        ` +

        field(
            "Notes",
            "notes",
            "text",
            interview?.notes || ""
        ) +

        `<button class="primary-btn form-submit">
            Save Interview
        </button>`,

        async event => {

            event.preventDefault();

            const data =
                Object.fromEntries(
                    new FormData(event.target)
                );

            try {

                if (interview) {

                    await api(
                        `/api/interviews/${interview.id}`,
                        {
                            method: "PUT",
                            body: JSON.stringify(data)
                        }
                    );

                } else {

                    await api(
                        "/api/interviews",
                        {
                            method: "POST",
                            body: JSON.stringify(data)
                        }
                    );

                }

                closeModal();
                await loadAll();

            } catch (error) {

                alert(error.message);

            }
        }
    );
}

/* SKILL MODAL */

function openSkillModal(skill = null) {

    openModal(

        skill
            ? "Edit Skill"
            : "Add Skill",

        field(
            "Skill Name",
            "name",
            "text",
            skill?.name || "",
            true
        ) +

        `
        <div class="form-group">

            <label>Category</label>

            <select name="category">

                ${[
            "Technical",
            "Programming",
            "Soft Skill",
            "Aptitude"
        ].map(category => `
                    <option
                        ${skill?.category === category
                ? "selected"
                : ""}>
                        ${category}
                    </option>
                `).join("")}

            </select>

        </div>
        ` +

        field(
            "Progress (%)",
            "progress",
            "number",
            skill?.progress || 0,
            true
        ) +

        `<button class="primary-btn form-submit">
            Save Skill
        </button>`,

        async event => {

            event.preventDefault();

            const data =
                Object.fromEntries(
                    new FormData(event.target)
                );

            try {

                if (skill) {

                    await api(
                        `/api/skills/${skill.id}`,
                        {
                            method: "PUT",
                            body: JSON.stringify(data)
                        }
                    );

                } else {

                    await api(
                        "/api/skills",
                        {
                            method: "POST",
                            body: JSON.stringify(data)
                        }
                    );

                }

                closeModal();
                await loadAll();

            } catch (error) {

                alert(error.message);

            }
        }
    );
}

/* PROFILE MODAL */

function openProfileModal() {

    const p = state.profile || {};

    openModal(

        "Edit Profile",

        field(
            "Name",
            "name",
            "text",
            p.name || "",
            true
        ) +

        field(
            "Branch",
            "branch",
            "text",
            p.branch || ""
        ) +

        field(
            "Year",
            "year",
            "text",
            p.year || ""
        ) +

        field(
            "College",
            "college",
            "text",
            p.college || ""
        ) +

        field(
            "Email",
            "email",
            "email",
            p.email || ""
        ) +

        field(
            "CGPA",
            "cgpa",
            "text",
            p.cgpa || ""
        ) +

        `<button class="primary-btn form-submit">
            Save Profile
        </button>`,

        async event => {

            event.preventDefault();

            const data =
                Object.fromEntries(
                    new FormData(event.target)
                );

            try {

                await api(
                    "/api/profile",
                    {
                        method: "PUT",
                        body: JSON.stringify(data)
                    }
                );

                closeModal();
                await loadAll();

            } catch (error) {

                alert(error.message);

            }
        }
    );
}

/* EDIT */

function editCompany(id) {

    const item =
        state.companies.find(c => c.id === id);

    if (item) {
        openCompanyModal(item);
    }
}

function editApplication(id) {

    const item =
        state.applications.find(a => a.id === id);

    if (item) {
        openApplicationModal(item);
    }
}

function editInterview(id) {

    const item =
        state.interviews.find(i => i.id === id);

    if (item) {
        openInterviewModal(item);
    }
}

function editSkill(id) {

    const item =
        state.skills.find(s => s.id === id);

    if (item) {
        openSkillModal(item);
    }
}

/* DELETE */

async function deleteCompany(id) {

    if (!confirm("Delete this company?")) return;

    try {

        await api(
            `/api/companies/${id}`,
            { method: "DELETE" }
        );

        await loadAll();

    } catch (error) {

        alert(error.message);
    }
}

async function deleteApplication(id) {

    if (!confirm("Delete this application?")) return;

    try {

        await api(
            `/api/applications/${id}`,
            { method: "DELETE" }
        );

        await loadAll();

    } catch (error) {

        alert(error.message);
    }
}

async function deleteInterview(id) {

    if (!confirm("Delete this interview?")) return;

    try {

        await api(
            `/api/interviews/${id}`,
            { method: "DELETE" }
        );

        await loadAll();

    } catch (error) {

        alert(error.message);
    }
}

async function deleteSkill(id) {

    if (!confirm("Delete this skill?")) return;

    try {

        await api(
            `/api/skills/${id}`,
            { method: "DELETE" }
        );

        await loadAll();

    } catch (error) {

        alert(error.message);
    }
}

/* HELPERS */

function getBadgeClass(status) {

    if (!status) return "";

    const value = status.toLowerCase();

    if (value === "selected" || value === "offer") {
        return "selected";
    }

    if (value === "rejected") {
        return "rejected";
    }

    return "";
}

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}