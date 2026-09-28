const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs").promises;

const app = express();
const PORT = 3000;

const DATA_DIR = path.join(__dirname, "data");

const FILES = {
    companies: path.join(DATA_DIR, "companies.json"),
    applications: path.join(DATA_DIR, "applications.json"),
    interviews: path.join(DATA_DIR, "interviews.json"),
    skills: path.join(DATA_DIR, "skills.json"),
    profile: path.join(DATA_DIR, "profile.json")
};

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

async function ensureDataFiles() {
    await fs.mkdir(DATA_DIR, { recursive: true });

    const defaults = {
        companies: [],
        applications: [],
        interviews: [],
        skills: [],
        profile: {
            name: "Student",
            branch: "CSE - Artificial Intelligence & Machine Learning",
            year: "3rd Year",
            college: "ANITS",
            email: "student@example.com",
            cgpa: ""
        }
    };

    for (const [key, file] of Object.entries(FILES)) {
        try {
            await fs.access(file);
        } catch {
            await fs.writeFile(
                file,
                JSON.stringify(defaults[key], null, 2)
            );
        }
    }
}

async function readData(file) {
    const data = await fs.readFile(file, "utf8");
    return JSON.parse(data || "[]");
}

async function writeData(file, data) {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
}

function createId() {
    return Date.now().toString() + Math.random().toString(36).slice(2, 7);
}

/* HEALTH */

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Student Placement Tracker API is running"
    });
});

/* PROFILE */

app.get("/api/profile", async (req, res) => {
    try {
        res.json(await readData(FILES.profile));
    } catch {
        res.status(500).json({ error: "Failed to load profile" });
    }
});

app.put("/api/profile", async (req, res) => {
    try {
        const current = await readData(FILES.profile);

        const updated = {
            ...current,
            ...req.body
        };

        await writeData(FILES.profile, updated);
        res.json(updated);
    } catch {
        res.status(500).json({ error: "Failed to update profile" });
    }
});

/* COMPANIES */

app.get("/api/companies", async (req, res) => {
    try {
        res.json(await readData(FILES.companies));
    } catch {
        res.status(500).json({ error: "Failed to load companies" });
    }
});

app.post("/api/companies", async (req, res) => {
    try {
        const { name, role } = req.body;

        if (!name || !role) {
            return res.status(400).json({
                error: "Company name and role are required"
            });
        }

        const companies = await readData(FILES.companies);

        const company = {
            id: createId(),
            name,
            role,
            package: req.body.package || "",
            location: req.body.location || "",
            deadline: req.body.deadline || "",
            createdAt: new Date().toISOString()
        };

        companies.push(company);
        await writeData(FILES.companies, companies);

        res.status(201).json(company);
    } catch {
        res.status(500).json({ error: "Failed to add company" });
    }
});

app.put("/api/companies/:id", async (req, res) => {
    try {
        const companies = await readData(FILES.companies);
        const index = companies.findIndex(c => c.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: "Company not found" });
        }

        companies[index] = {
            ...companies[index],
            ...req.body,
            id: companies[index].id,
            updatedAt: new Date().toISOString()
        };

        await writeData(FILES.companies, companies);
        res.json(companies[index]);
    } catch {
        res.status(500).json({ error: "Failed to update company" });
    }
});

app.delete("/api/companies/:id", async (req, res) => {
    try {
        const companies = await readData(FILES.companies);
        const filtered = companies.filter(c => c.id !== req.params.id);

        if (filtered.length === companies.length) {
            return res.status(404).json({ error: "Company not found" });
        }

        await writeData(FILES.companies, filtered);
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: "Failed to delete company" });
    }
});

/* APPLICATIONS */

app.get("/api/applications", async (req, res) => {
    try {
        res.json(await readData(FILES.applications));
    } catch {
        res.status(500).json({ error: "Failed to load applications" });
    }
});

app.post("/api/applications", async (req, res) => {
    try {
        const { company, role } = req.body;

        if (!company || !role) {
            return res.status(400).json({
                error: "Company and role are required"
            });
        }

        const applications = await readData(FILES.applications);

        const application = {
            id: createId(),
            company,
            role,
            status: req.body.status || "Applied",
            appliedDate: req.body.appliedDate || "",
            deadline: req.body.deadline || "",
            notes: req.body.notes || "",
            createdAt: new Date().toISOString()
        };

        applications.push(application);
        await writeData(FILES.applications, applications);

        res.status(201).json(application);
    } catch {
        res.status(500).json({ error: "Failed to add application" });
    }
});

app.put("/api/applications/:id", async (req, res) => {
    try {
        const applications = await readData(FILES.applications);
        const index = applications.findIndex(a => a.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: "Application not found" });
        }

        applications[index] = {
            ...applications[index],
            ...req.body,
            id: applications[index].id,
            updatedAt: new Date().toISOString()
        };

        await writeData(FILES.applications, applications);
        res.json(applications[index]);
    } catch {
        res.status(500).json({ error: "Failed to update application" });
    }
});

app.delete("/api/applications/:id", async (req, res) => {
    try {
        const applications = await readData(FILES.applications);
        const filtered = applications.filter(a => a.id !== req.params.id);

        if (filtered.length === applications.length) {
            return res.status(404).json({ error: "Application not found" });
        }

        await writeData(FILES.applications, filtered);
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: "Failed to delete application" });
    }
});

/* INTERVIEWS */

app.get("/api/interviews", async (req, res) => {
    try {
        res.json(await readData(FILES.interviews));
    } catch {
        res.status(500).json({ error: "Failed to load interviews" });
    }
});

app.post("/api/interviews", async (req, res) => {
    try {
        if (!req.body.company || !req.body.date) {
            return res.status(400).json({
                error: "Company and date are required"
            });
        }

        const interviews = await readData(FILES.interviews);

        const interview = {
            id: createId(),
            company: req.body.company,
            role: req.body.role || "",
            type: req.body.type || "Interview",
            date: req.body.date,
            time: req.body.time || "",
            status: req.body.status || "Upcoming",
            notes: req.body.notes || "",
            createdAt: new Date().toISOString()
        };

        interviews.push(interview);
        await writeData(FILES.interviews, interviews);

        res.status(201).json(interview);
    } catch {
        res.status(500).json({ error: "Failed to add interview" });
    }
});

app.put("/api/interviews/:id", async (req, res) => {
    try {
        const interviews = await readData(FILES.interviews);
        const index = interviews.findIndex(i => i.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: "Interview not found" });
        }

        interviews[index] = {
            ...interviews[index],
            ...req.body,
            id: interviews[index].id,
            updatedAt: new Date().toISOString()
        };

        await writeData(FILES.interviews, interviews);
        res.json(interviews[index]);
    } catch {
        res.status(500).json({ error: "Failed to update interview" });
    }
});

app.delete("/api/interviews/:id", async (req, res) => {
    try {
        const interviews = await readData(FILES.interviews);
        const filtered = interviews.filter(i => i.id !== req.params.id);

        if (filtered.length === interviews.length) {
            return res.status(404).json({ error: "Interview not found" });
        }

        await writeData(FILES.interviews, filtered);
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: "Failed to delete interview" });
    }
});

/* SKILLS */

app.get("/api/skills", async (req, res) => {
    try {
        res.json(await readData(FILES.skills));
    } catch {
        res.status(500).json({ error: "Failed to load skills" });
    }
});

app.post("/api/skills", async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({
                error: "Skill name is required"
            });
        }

        const skills = await readData(FILES.skills);

        const skill = {
            id: createId(),
            name: req.body.name,
            category: req.body.category || "Technical",
            progress: Math.min(100, Math.max(0, Number(req.body.progress) || 0)),
            createdAt: new Date().toISOString()
        };

        skills.push(skill);
        await writeData(FILES.skills, skills);

        res.status(201).json(skill);
    } catch {
        res.status(500).json({ error: "Failed to add skill" });
    }
});

app.put("/api/skills/:id", async (req, res) => {
    try {
        const skills = await readData(FILES.skills);
        const index = skills.findIndex(s => s.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: "Skill not found" });
        }

        skills[index] = {
            ...skills[index],
            ...req.body,
            id: skills[index].id,
            progress: Math.min(
                100,
                Math.max(0, Number(req.body.progress ?? skills[index].progress))
            )
        };

        await writeData(FILES.skills, skills);
        res.json(skills[index]);
    } catch {
        res.status(500).json({ error: "Failed to update skill" });
    }
});

app.delete("/api/skills/:id", async (req, res) => {
    try {
        const skills = await readData(FILES.skills);
        const filtered = skills.filter(s => s.id !== req.params.id);

        if (filtered.length === skills.length) {
            return res.status(404).json({ error: "Skill not found" });
        }

        await writeData(FILES.skills, filtered);
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: "Failed to delete skill" });
    }
});

/* DASHBOARD */

app.get("/api/dashboard", async (req, res) => {
    try {
        const [companies, applications, interviews, skills] =
            await Promise.all([
                readData(FILES.companies),
                readData(FILES.applications),
                readData(FILES.interviews),
                readData(FILES.skills)
            ]);

        const offers = applications.filter(a =>
            ["selected", "offer"].includes((a.status || "").toLowerCase())
        ).length;

        const rejected = applications.filter(a =>
            (a.status || "").toLowerCase() === "rejected"
        ).length;

        const active = applications.filter(a =>
            !["selected", "offer", "rejected"].includes(
                (a.status || "").toLowerCase()
            )
        ).length;

        res.json({
            totalCompanies: companies.length,
            totalApplications: applications.length,
            activeApplications: active,
            interviews: interviews.length,
            offers,
            rejected,
            skills: skills.length
        });
    } catch {
        res.status(500).json({ error: "Failed to load dashboard" });
    }
});

/* START */

async function startServer() {
    try {
        await ensureDataFiles();

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
    }
}

startServer();