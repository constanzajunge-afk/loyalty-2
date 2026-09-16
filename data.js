const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

const DB_PATH = path.join(__dirname, 'db.json');

function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ students: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

const LEVEL_INFO = {
  bronce: {
    label: 'Bronce',
    color: '#7c4a2d',
    textColor: '#f5ded0',
    benefits: ['20% dto. indumentaria Trup']
  },
  plata: {
    label: 'Plata',
    color: '#c0c4cc',
    textColor: '#2c2e33',
    benefits: ['20% dto. indumentaria Trup', '1 polera trimestral']
  },
  oro: {
    label: 'Oro',
    color: '#d4af37',
    textColor: '#3d2e00',
    benefits: [
      '20% dto. indumentaria Trup',
      '1 polera trimestral',
      '20% dto. en todas las clases',
      '1 polerón semestral'
    ]
  }
};

// Reglas de negocio del programa de fidelizacion, evaluadas por MES:
// - Plata: 4 clases en el mes y pagos al dia
// - Oro: 7 clases, 1 torneo y 1 posteo en RR.SS. en el mes, y pagos al dia
function computeLevel(student) {
  const oro =
    student.clases >= 7 &&
    student.torneos >= 1 &&
    student.posteos >= 1 &&
    student.pagoAlDia;
  if (oro) return 'oro';

  const plata = student.clases >= 4 && student.pagoAlDia;
  if (plata) return 'plata';

  return 'bronce';
}

function targetForLevel(level) {
  return level === 'bronce' ? 4 : level === 'plata' ? 7 : 7;
}

function publicView(student) {
  const level = computeLevel(student);
  return {
    nombre: student.nombre,
    code: student.code,
    level,
    levelInfo: LEVEL_INFO[level],
    clases: student.clases,
    torneos: student.torneos,
    posteos: student.posteos,
    pagoAlDia: student.pagoAlDia,
    target: targetForLevel(level),
    torneosTarget: 1,
    posteosTarget: 1
  };
}

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function uniqueSlug(db, nombre) {
  const base = slugify(nombre) || 'alumno';
  let slug = base;
  let counter = 2;
  while (db.students.some((s) => s.code === slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

function addStudent(db, nombre) {
  const student = {
    id: nanoid(8),
    code: uniqueSlug(db, nombre),
    nombre,
    clases: 0,
    torneos: 0,
    posteos: 0,
    pagoAlDia: true,
    createdAt: new Date().toISOString()
  };
  db.students.push(student);
  saveDB(db);
  return student;
}

function updateStudent(db, id, changes) {
  const student = db.students.find((s) => s.id === id);
  if (!student) return null;
  Object.assign(student, changes);
  saveDB(db);
  return student;
}

function findStudentByName(db, nombre) {
  const target = slugify(nombre);
  return db.students.find((s) => slugify(s.nombre) === target);
}

function deleteStudent(db, id) {
  db.students = db.students.filter((s) => s.id !== id);
  saveDB(db);
}

module.exports = {
  loadDB,
  saveDB,
  computeLevel,
  publicView,
  addStudent,
  updateStudent,
  deleteStudent,
  findStudentByName,
  LEVEL_INFO
};
