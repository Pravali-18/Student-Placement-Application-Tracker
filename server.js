
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB, client } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Generate a unique ID for each record
function createId() {
    return Date.now().toString() +
        Math.random().toString(36).slice(2, 7);
}

// Remove MongoDB's internal _id from API responses
function cleanDocument(document) {
    if (!document) return document;

    const { _id, ...rest } = document;
    return rest;
}

function cleanDocuments(documents) {
    return documents.map(cleanDocument);
}

// Keep skill progress between 0 and 100
function clampProgress(value) {
    return Math.min(100, Math.max(0, Number(value) || 0));
}

let db;
let companies;
let applications;
let interviews;
let skills;
let profiles;

/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", async (req, res) => {
    try {
        await db.command({ ping: 1 });

        res.json({
            success: true,
            message: "Student Placement Tracker API is running",
            database: "connected"
        });
    } catch (error) {
        console.error("Health check failed:", error);

        res.status(500).json({
            success: false,
            error: "Database connection failed"
        });
    }
});

/* =========================
   PROFILE
========================= */

// Get student profile
app.get("/api/profile", async (req, res) => {
    try {
        const profile = await profiles.findOne({ _id: "main" });

        if (!profile) {
            return res.json({
                name: "Student",
                branch: "CSE - Artificial Intelligence & Machine Learning",
                year: "3rd Year",
                college: "ANITS",
                email: "student@example.com",
                cgpa: ""
            });
        }

        res.json(cleanDocument(profile));
    } catch (error) {
        console.error("Failed to load profile:", error);

        res.status(500).json({
            error: "Failed to load profile"
        });
    }
});

// Update student profile
app.put("/api/profile", async (req, res) => {
    try {
        const current = await profiles.findOne({ _id: "main" }) || {
            name: "Student",
            branch: "CSE - Artificial Intelligence & Machine Learning",
            year: "3rd Year",
            college: "ANITS",
            email: "student@example.com",
            cgpa: ""
        };

        const updated = {
            ...current,
            ...req.body
        };

        delete updated._id;

        await profiles.updateOne(
            { _id: "main" },
            { $set: updated },
            { upsert: true }
        );

        res.json(updated);
    } catch (error) {
        console.error("Failed to update profile:", error);

        res.status(500).json({
            error: "Failed to update profile"
        });
    }
});

/* =========================
   COMPANIES
========================= */

// Get all companies
app.get("/api/companies", async (req, res) => {
    try {
        const rows = await companies
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.json(cleanDocuments(rows));
    } catch (error) {
        console.error("Failed to load companies:", error);

        res.status(500).json({
            error: "Failed to load companies"
        });
    }
});

// Add a company
app.post("/api/companies", async (req, res) => {
    try {
        const { name, role } = req.body;

        if (!name || !role) {
            return res.status(400).json({
                error: "Company name and role are required"
            });
        }

        const company = {
            id: createId(),
            name,
            role,
            package: req.body.package || "",
            location: req.body.location || "",
            deadline: req.body.deadline || "",
            createdAt: new Date().toISOString()
        };

        await companies.insertOne(company);

        res.status(201).json(company);
    } catch (error) {
        console.error("Failed to add company:", error);

        res.status(500).json({
            error: "Failed to add company"
        });
    }
});

// Update a company
app.put("/api/companies/:id", async (req, res) => {
    try {
        const current = await companies.findOne({
            id: req.params.id
        });

        if (!current) {
            return res.status(404).json({
                error: "Company not found"
            });
        }

        const updated = {
            ...cleanDocument(current),
            ...req.body,
            id: current.id,
            updatedAt: new Date().toISOString()
        };

        await companies.updateOne(
            { id: req.params.id },
            { $set: updated }
        );

        res.json(updated);
    } catch (error) {
        console.error("Failed to update company:", error);

        res.status(500).json({
            error: "Failed to update company"
        });
    }
});

// Delete a company
app.delete("/api/companies/:id", async (req, res) => {
    try {
        const result = await companies.deleteOne({
            id: req.params.id
        });

        if (!result.deletedCount) {
            return res.status(404).json({
                error: "Company not found"
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Failed to delete company:", error);

        res.status(500).json({
            error: "Failed to delete company"
        });
    }
});

/* =========================
   APPLICATIONS
========================= */

// Get all applications
app.get("/api/applications", async (req, res) => {
    try {
        const rows = await applications
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.json(cleanDocuments(rows));
    } catch (error) {
        console.error("Failed to load applications:", error);

        res.status(500).json({
            error: "Failed to load applications"
        });
    }
});

// Add an application
app.post("/api/applications", async (req, res) => {
    try {
        const { company, role } = req.body;

        if (!company || !role) {
            return res.status(400).json({
                error: "Company and role are required"
            });
        }

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

        await applications.insertOne(application);

        res.status(201).json(application);
    } catch (error) {
        console.error("Failed to add application:", error);

        res.status(500).json({
            error: "Failed to add application"
        });
    }
});

// Update an application
app.put("/api/applications/:id", async (req, res) => {
    try {
        const current = await applications.findOne({
            id: req.params.id
        });

        if (!current) {
            return res.status(404).json({
                error: "Application not found"
            });
        }

        const updated = {
            ...cleanDocument(current),
            ...req.body,
            id: current.id,
            updatedAt: new Date().toISOString()
        };

        await applications.updateOne(
            { id: req.params.id },
            { $set: updated }
        );

        res.json(updated);
    } catch (error) {
        console.error("Failed to update application:", error);

        res.status(500).json({
            error: "Failed to update application"
        });
    }
});

// Delete an application
app.delete("/api/applications/:id", async (req, res) => {
    try {
        const result = await applications.deleteOne({
            id: req.params.id
        });

        if (!result.deletedCount) {
            return res.status(404).json({
                error: "Application not found"
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Failed to delete application:", error);

        res.status(500).json({
            error: "Failed to delete application"
        });
    }
});

/* =========================
   INTERVIEWS
========================= */

// Get all interviews
app.get("/api/interviews", async (req, res) => {
    try {
        const rows = await interviews
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.json(cleanDocuments(rows));
    } catch (error) {
        console.error("Failed to load interviews:", error);

        res.status(500).json({
            error: "Failed to load interviews"
        });
    }
});

// Add an interview
app.post("/api/interviews", async (req, res) => {
    try {
        if (!req.body.company || !req.body.date) {
            return res.status(400).json({
                error: "Company and date are required"
            });
        }

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

        await interviews.insertOne(interview);

        res.status(201).json(interview);
    } catch (error) {
        console.error("Failed to add interview:", error);

        res.status(500).json({
            error: "Failed to add interview"
        });
    }
});

// Update an interview
app.put("/api/interviews/:id", async (req, res) => {
    try {
        const current = await interviews.findOne({
            id: req.params.id
        });

        if (!current) {
            return res.status(404).json({
                error: "Interview not found"
            });
        }

        const updated = {
            ...cleanDocument(current),
            ...req.body,
            id: current.id,
            updatedAt: new Date().toISOString()
        };

        await interviews.updateOne(
            { id: req.params.id },
            { $set: updated }
        );

        res.json(updated);
    } catch (error) {
        console.error("Failed to update interview:", error);

        res.status(500).json({
            error: "Failed to update interview"
        });
    }
});

// Delete an interview
app.delete("/api/interviews/:id", async (req, res) => {
    try {
        const result = await interviews.deleteOne({
            id: req.params.id
        });

        if (!result.deletedCount) {
            return res.status(404).json({
                error: "Interview not found"
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Failed to delete interview:", error);

        res.status(500).json({
            error: "Failed to delete interview"
        });
    }
});

/* =========================
   SKILLS
========================= */

// Get all skills
app.get("/api/skills", async (req, res) => {
    try {
        const rows = await skills
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.json(cleanDocuments(rows));
    } catch (error) {
        console.error("Failed to load skills:", error);

        res.status(500).json({
            error: "Failed to load skills"
        });
    }
});

// Add a skill
app.post("/api/skills", async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({
                error: "Skill name is required"
            });
        }

        const skill = {
            id: createId(),
            name: req.body.name,
            category: req.body.category || "Technical",
            progress: clampProgress(req.body.progress),
            createdAt: new Date().toISOString()
        };

        await skills.insertOne(skill);

        res.status(201).json(skill);
    } catch (error) {
        console.error("Failed to add skill:", error);

        res.status(500).json({
            error: "Failed to add skill"
        });
    }
});

// Update a skill
app.put("/api/skills/:id", async (req, res) => {
    try {
        const current = await skills.findOne({
            id: req.params.id
        });

        if (!current) {
            return res.status(404).json({
                error: "Skill not found"
            });
        }

        const updated = {
            ...cleanDocument(current),
            ...req.body,
            id: current.id,
            progress: clampProgress(
                req.body.progress ?? current.progress
            )
        };

        await skills.updateOne(
            { id: req.params.id },
            { $set: updated }
        );

        res.json(updated);
    } catch (error) {
        console.error("Failed to update skill:", error);

        res.status(500).json({
            error: "Failed to update skill"
        });
    }
});

// Delete a skill
app.delete("/api/skills/:id", async (req, res) => {
    try {
        const result = await skills.deleteOne({
            id: req.params.id
        });

        if (!result.deletedCount) {
            return res.status(404).json({
                error: "Skill not found"
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Failed to delete skill:", error);

        res.status(500).json({
            error: "Failed to delete skill"
        });
    }
});

/* =========================
   DASHBOARD
========================= */

app.get("/api/dashboard", async (req, res) => {
    try {
        const [
            totalCompanies,
            totalApplications,
            totalInterviews,
            totalSkills,
            allApplications
        ] = await Promise.all([
            companies.countDocuments(),
            applications.countDocuments(),
            interviews.countDocuments(),
            skills.countDocuments(),
            applications.find(
                {},
                { projection: { status: 1, _id: 0 } }
            ).toArray()
        ]);

        const offers = allApplications.filter(application =>
            ["selected", "offer"].includes(
                (application.status || "").toLowerCase()
            )
        ).length;

        const rejected = allApplications.filter(application =>
            (application.status || "").toLowerCase() === "rejected"
        ).length;

        const active = allApplications.filter(application =>
            !["selected", "offer", "rejected"].includes(
                (application.status || "").toLowerCase()
            )
        ).length;

        res.json({
            totalCompanies,
            totalApplications,
            activeApplications: active,
            interviews: totalInterviews,
            offers,
            rejected,
            skills: totalSkills
        });
    } catch (error) {
        console.error("Failed to load dashboard:", error);

        res.status(500).json({
            error: "Failed to load dashboard"
        });
    }
});

/* =========================
   START SERVER
========================= */

async function startServer() {
    try {
        // Connect to MongoDB Atlas
        db = await connectDB();

        // Select MongoDB collections
        companies = db.collection("companies");
        applications = db.collection("applications");
        interviews = db.collection("interviews");
        skills = db.collection("skills");
        profiles = db.collection("profiles");

        // Create a default profile if it does not exist
        await profiles.updateOne(
            { _id: "main" },
            {
                $setOnInsert: {
                    name: "Student",
                    branch: "CSE - Artificial Intelligence & Machine Learning",
                    year: "3rd Year",
                    college: "ANITS",
                    email: "student@example.com",
                    cgpa: ""
                }
            },
            { upsert: true }
        );

        app.listen(PORT, () => {
            console.log(
                `Server running at http://localhost:${PORT}`
            );
            console.log(
                "MongoDB Atlas connected and ready."
            );
        });
    } catch (error) {
        console.error(
            "Server startup failed:",
            error.message
        );

        await client.close().catch(() => {});
        process.exit(1);
    }
}

startServer();
