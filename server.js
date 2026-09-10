require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const {
  loadDB,
  computeLevel,
  publicView,
  addStudent,
  updateStudent,
  deleteStudent
} = require('./data');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'cambia-esta-clave';
const SESSION_SECRET = process.env.SESSION_SECRET || 'cambia-este-secreto';

app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 }
  })
);
app.use(express.static(path.join(__dirname, 'public')));

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'No autorizado' });
}

// --- Auth ---
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  return res.status(401).json({ error: 'Clave incorrecta' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/session', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// --- Admin: gestion de alumnos ---
app.get('/api/students', requireAdmin, (req, res) => {
  const db = loadDB();
  const students = db.students.map((s) => ({
    ...s,
    level: computeLevel(s)
  }));
  res.json(students);
});

app.post('/api/students', requireAdmin, (req, res) => {
  const { nombre } = req.body;
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: 'Nombre requerido' });
  }
  const db = loadDB();
  const student = addStudent(db, nombre.trim());
  res.json(student);
});

app.put('/api/students/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const changes = {};
  ['clases', 'torneos', 'posteos'].forEach((field) => {
    if (typeof req.body[field] === 'number') {
      const current = db.students.find((s) => s.id === req.params.id);
      if (current) changes[field] = Math.max(0, current[field] + req.body[field]);
    }
  });
  if (typeof req.body.pagoAlDia === 'boolean') {
    changes.pagoAlDia = req.body.pagoAlDia;
  }
  const updated = updateStudent(db, req.params.id, changes);
  if (!updated) return res.status(404).json({ error: 'Alumno no encontrado' });
  res.json(updated);
});

app.delete('/api/students/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  deleteStudent(db, req.params.id);
  res.json({ ok: true });
});

// --- Publico: tarjeta del alumno via su codigo unico ---
app.get('/api/alumno/:code', (req, res) => {
  const db = loadDB();
  const student = db.students.find((s) => s.code === req.params.code);
  if (!student) return res.status(404).json({ error: 'Tarjeta no encontrada' });
  res.json(publicView(student));
});

app.listen(PORT, () => {
  console.log(`M3 Padel Academy - fidelizacion corriendo en puerto ${PORT}`);
});
