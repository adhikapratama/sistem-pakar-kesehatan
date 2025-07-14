const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware
app.use(cors());
app.use(express.json());

// Database files
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SYMPTOMS_FILE = path.join(DATA_DIR, "symptoms.json");
const DISEASES_FILE = path.join(DATA_DIR, "diseases.json");
const RULES_FILE = path.join(DATA_DIR, "rules.json");
const DIAGNOSES_FILE = path.join(DATA_DIR, "diagnoses.json");
const ARTICLES_FILE = path.join(DATA_DIR, "articles.json");

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize database files
const initializeDatabase = () => {
  const defaultData = {
    users: [
      {
        id: "admin-1",
        username: "admin",
        email: "admin@example.com",
        password:
          "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4BbvMmyj/a", // admin123
        role: "admin",
        createdAt: new Date().toISOString(),
      },
    ],
    symptoms: [
      {
        id: "G01",
        name: "Demam tinggi",
        description: "Suhu tubuh di atas 38°C",
      },
      {
        id: "G02",
        name: "Sakit tenggorokan",
        description: "Nyeri saat menelan",
      },
      { id: "G03", name: "Batuk kering", description: "Batuk tanpa dahak" },
      { id: "G04", name: "Pilek", description: "Hidung tersumbat atau berair" },
      { id: "G05", name: "Sakit kepala", description: "Nyeri di area kepala" },
      {
        id: "G06",
        name: "Nyeri otot",
        description: "Pegal-pegal di seluruh tubuh",
      },
      { id: "G07", name: "Mual", description: "Rasa ingin muntah" },
      { id: "G08", name: "Muntah", description: "Mengeluarkan isi perut" },
      { id: "G09", name: "Diare", description: "Buang air besar encer" },
      { id: "G10", name: "Sesak napas", description: "Kesulitan bernapas" },
    ],
    diseases: [
      {
        id: "D001",
        name: "Flu",
        description: "Infeksi virus yang menyerang sistem pernapasan",
        recommendation: "Istirahat cukup, minum air hangat, konsumsi vitamin C",
      },
      {
        id: "D002",
        name: "Demam Berdarah",
        description: "Penyakit yang disebabkan oleh virus dengue",
        recommendation:
          "Segera konsultasi ke dokter, perbanyak minum air putih",
      },
      {
        id: "D003",
        name: "Gastroenteritis",
        description: "Peradangan pada saluran pencernaan",
        recommendation: "Konsumsi makanan lunak, hindari makanan pedas",
      },
      {
        id: "D004",
        name: "Pneumonia",
        description: "Infeksi yang menyebabkan peradangan pada paru-paru",
        recommendation: "Segera ke rumah sakit untuk penanganan medis",
      },
    ],
    rules: [
      {
        id: "R001",
        if: ["G01", "G02", "G03"],
        then: "D001",
        confidence: 0.85,
        description: "Demam tinggi + sakit tenggorokan + batuk kering = Flu",
      },
      {
        id: "R002",
        if: ["G01", "G05", "G06"],
        then: "D002",
        confidence: 0.8,
        description:
          "Demam tinggi + sakit kepala + nyeri otot = Demam Berdarah",
      },
      {
        id: "R003",
        if: ["G07", "G08", "G09"],
        then: "D003",
        confidence: 0.9,
        description: "Mual + muntah + diare = Gastroenteritis",
      },
      {
        id: "R004",
        if: ["G01", "G03", "G10"],
        then: "D004",
        confidence: 0.85,
        description: "Demam tinggi + batuk kering + sesak napas = Pneumonia",
      },
      {
        id: "R005",
        if: ["G02", "G04", "G05"],
        then: "D001",
        confidence: 0.7,
        description: "Sakit tenggorokan + pilek + sakit kepala = Flu",
      },
    ],
    diagnoses: [],
    articles: [
      {
        id: "A001",
        title: "Cara Mencegah Penyakit Flu",
        content:
          "Flu adalah penyakit yang dapat dicegah dengan menjaga kebersihan...",
        tags: ["flu", "pencegahan", "kesehatan"],
        createdAt: new Date().toISOString(),
      },
      {
        id: "A002",
        title: "Mengenal Gejala Demam Berdarah",
        content:
          "Demam berdarah adalah penyakit yang disebabkan oleh virus dengue...",
        tags: ["demam berdarah", "gejala", "virus"],
        createdAt: new Date().toISOString(),
      },
    ],
  };

  // Create files if they don't exist
  Object.entries(defaultData).forEach(([key, data]) => {
    const filePath = path.join(DATA_DIR, `${key}.json`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
  });
};

// Helper functions
const readData = (filename) => {
  try {
    const data = fs.readFileSync(filename, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeData = (filename, data) => {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token akses diperlukan" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token tidak valid" });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Akses admin diperlukan" });
  }
  next();
};

// Forward Chaining Engine
const forwardChaining = (inputSymptoms) => {
  const rules = readData(RULES_FILE);
  const diseases = readData(DISEASES_FILE);
  const results = [];

  rules.forEach((rule) => {
    const matchedSymptoms = rule.if.filter((symptom) =>
      inputSymptoms.includes(symptom)
    );
    const matchPercentage = matchedSymptoms.length / rule.if.length;

    if (matchPercentage > 0) {
      const disease = diseases.find((d) => d.id === rule.then);
      if (disease) {
        const confidence = matchPercentage * rule.confidence;
        results.push({
          disease: disease,
          confidence: confidence,
          matchPercentage: matchPercentage,
          matchedSymptoms: matchedSymptoms,
          ruleId: rule.id,
        });
      }
    }
  });

  // Sort by confidence (descending)
  results.sort((a, b) => b.confidence - a.confidence);

  return results;
};

// Initialize database
initializeDatabase();

// Routes
// Auth routes
// Gantikan fungsi app.post('/api/auth/login', ...) di index.js dengan ini:
// Symptoms routes
app.get("/", (req, res) => {
  res.json("halo wkwk");
});
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("--- PERMINTAAN LOGIN BARU DITERIMA ---");
    const { username, password } = req.body;

    // Log #1: Menampilkan input dari client
    console.log(
      `[LOG 1] Input dari client: username='${username}', password='${password}'`
    );

    const users = readData(USERS_FILE);
    // Log #2: Menampilkan data user yang berhasil dibaca dari file
    console.log(
      "[LOG 2] Data dari users.json:",
      JSON.stringify(users, null, 2)
    );

    const user = users.find((u) => u.username === username);

    if (!user) {
      // Log #3: Kondisi jika user tidak ditemukan
      console.log(
        `[LOG 3] HASIL: User dengan username '${username}' tidak ditemukan di users.json.`
      );
      return res.status(400).json({ error: "Username atau password salah" });
    }

    // Log #4: Menampilkan user yang cocok
    console.log(`[LOG 4] User ditemukan:`, JSON.stringify(user, null, 2));

    const isValidPassword = await bcrypt.compare(password, user.password);

    // Log #5: Menampilkan hasil perbandingan password
    console.log(
      `[LOG 5] Hasil perbandingan password (bcrypt.compare): ${isValidPassword}`
    );

    if (!isValidPassword) {
      console.log("[LOG 6] HASIL: Password tidak cocok.");
      return res.status(400).json({ error: "Username atau password salah" });
    }

    console.log("[LOG 7] HASIL: Login berhasil! Membuat token...");
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[ERROR] Terjadi kesalahan di proses login:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const users = readData(USERS_FILE);

    // Check if user already exists
    const existingUser = users.find(
      (u) => u.username === username || u.email === email
    );
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username atau email sudah digunakan" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeData(USERS_FILE, users);

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Symptoms routes
app.get("/api/symptoms", (req, res) => {
  const symptoms = readData(SYMPTOMS_FILE);
  res.json(symptoms);
});

app.post("/api/symptoms", authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, description } = req.body;
    const symptoms = readData(SYMPTOMS_FILE);

    const newSymptom = {
      id: `G${String(symptoms.length + 1).padStart(2, "0")}`,
      name,
      description,
    };

    symptoms.push(newSymptom);
    writeData(SYMPTOMS_FILE, symptoms);

    res.status(201).json(newSymptom);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/symptoms/:id", authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const symptoms = readData(SYMPTOMS_FILE);

    const index = symptoms.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Gejala tidak ditemukan" });
    }

    symptoms[index] = { ...symptoms[index], name, description };
    writeData(SYMPTOMS_FILE, symptoms);

    res.json(symptoms[index]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/symptoms/:id", authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const symptoms = readData(SYMPTOMS_FILE);

    const index = symptoms.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Gejala tidak ditemukan" });
    }

    symptoms.splice(index, 1);
    writeData(SYMPTOMS_FILE, symptoms);

    res.json({ message: "Gejala berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Diseases routes
app.get("/api/diseases", (req, res) => {
  const diseases = readData(DISEASES_FILE);
  res.json(diseases);
});

app.post("/api/diseases", authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, description, recommendation } = req.body;
    const diseases = readData(DISEASES_FILE);

    const newDisease = {
      id: `D${String(diseases.length + 1).padStart(3, "0")}`,
      name,
      description,
      recommendation,
    };

    diseases.push(newDisease);
    writeData(DISEASES_FILE, diseases);

    res.status(201).json(newDisease);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/diseases/:id", authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, recommendation } = req.body;
    const diseases = readData(DISEASES_FILE);

    const index = diseases.findIndex((d) => d.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Penyakit tidak ditemukan" });
    }

    diseases[index] = { ...diseases[index], name, description, recommendation };
    writeData(DISEASES_FILE, diseases);

    res.json(diseases[index]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/diseases/:id", authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const diseases = readData(DISEASES_FILE);

    const index = diseases.findIndex((d) => d.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Penyakit tidak ditemukan" });
    }

    diseases.splice(index, 1);
    writeData(DISEASES_FILE, diseases);

    res.json({ message: "Penyakit berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Rules routes
app.get("/api/rules", authenticateToken, requireAdmin, (req, res) => {
  const rules = readData(RULES_FILE);
  res.json(rules);
});

app.post("/api/rules", authenticateToken, requireAdmin, (req, res) => {
  try {
    const {
      if: conditions,
      then: conclusion,
      confidence,
      description,
    } = req.body;
    const rules = readData(RULES_FILE);

    const newRule = {
      id: `R${String(rules.length + 1).padStart(3, "0")}`,
      if: conditions,
      then: conclusion,
      confidence: parseFloat(confidence),
      description,
    };

    rules.push(newRule);
    writeData(RULES_FILE, rules);

    res.status(201).json(newRule);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/rules/:id", authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const {
      if: conditions,
      then: conclusion,
      confidence,
      description,
    } = req.body;
    const rules = readData(RULES_FILE);

    const index = rules.findIndex((r) => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Aturan tidak ditemukan" });
    }

    rules[index] = {
      ...rules[index],
      if: conditions,
      then: conclusion,
      confidence: parseFloat(confidence),
      description,
    };
    writeData(RULES_FILE, rules);

    res.json(rules[index]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/rules/:id", authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const rules = readData(RULES_FILE);

    const index = rules.findIndex((r) => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Aturan tidak ditemukan" });
    }

    rules.splice(index, 1);
    writeData(RULES_FILE, rules);

    res.json({ message: "Aturan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Diagnosis routes
app.post("/api/diagnose", authenticateToken, (req, res) => {
  try {
    const { symptoms: inputSymptoms } = req.body;
    const symptoms = readData(SYMPTOMS_FILE);

    // Get symptom details
    const selectedSymptoms = symptoms.filter((s) =>
      inputSymptoms.includes(s.id)
    );

    // Run forward chaining
    const results = forwardChaining(inputSymptoms);

    // Save diagnosis
    const diagnoses = readData(DIAGNOSES_FILE);
    const newDiagnosis = {
      id: uuidv4(),
      userId: req.user.id,
      symptoms: selectedSymptoms,
      results: results,
      createdAt: new Date().toISOString(),
    };

    diagnoses.push(newDiagnosis);
    writeData(DIAGNOSES_FILE, diagnoses);

    res.json({
      diagnosis: newDiagnosis,
      results: results,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/diagnoses", authenticateToken, (req, res) => {
  try {
    const diagnoses = readData(DIAGNOSES_FILE);
    let userDiagnoses;

    if (req.user.role === "admin") {
      userDiagnoses = diagnoses;
    } else {
      userDiagnoses = diagnoses.filter((d) => d.userId === req.user.id);
    }

    res.json(userDiagnoses);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Articles routes
app.get("/api/articles", (req, res) => {
  const articles = readData(ARTICLES_FILE);
  res.json(articles);
});

app.post("/api/articles", authenticateToken, requireAdmin, (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const articles = readData(ARTICLES_FILE);

    const newArticle = {
      id: `A${String(articles.length + 1).padStart(3, "0")}`,
      title,
      content,
      tags: tags || [],
      createdAt: new Date().toISOString(),
    };

    articles.push(newArticle);
    writeData(ARTICLES_FILE, articles);

    res.status(201).json(newArticle);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Dashboard stats
app.get("/api/stats", authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = readData(USERS_FILE);
    const symptoms = readData(SYMPTOMS_FILE);
    const diseases = readData(DISEASES_FILE);
    const rules = readData(RULES_FILE);
    const diagnoses = readData(DIAGNOSES_FILE);
    const articles = readData(ARTICLES_FILE);

    const stats = {
      totalUsers: users.length,
      totalSymptoms: symptoms.length,
      totalDiseases: diseases.length,
      totalRules: rules.length,
      totalDiagnoses: diagnoses.length,
      totalArticles: articles.length,
      recentDiagnoses: diagnoses.slice(-5).reverse(),
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
