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
    color: '#9a9a9a',
    textColor: '#1a1a1a',
    benefits: ['20% dto. indumentaria Trup', '1 polera trimestral']
  },
  oro: {
    label: 'Oro',
    color: '#a8e02e',
    textColor: '#1a2e05',
    benefits: [
      '20% dto. indumentaria Trup',
      '1 polera trimestral',
      '20% dto. en todas las clases',
      '1 polerón semestral'
    ]
  }
};

// Reglas de negocio del programa de fidelizacion, evaluadas por trimestre:
// - Plata: 12 clases en el trimestre y pagos al dia
// - Oro: 21 clases, 3 torneos y 3 posteos en RR.SS. en el trimestre, y pagos al dia
function computeLevel(student) {
  const oro =
    student.clases >= 21 &&
    student.torneos >= 3 &&
    student.posteos >= 3 &&
    student.pagoAlDia;
  if (oro) return 'oro';

  const plata = student.clases >= 12 && student.pagoAlDia;
  if (plata) return 'plata';

  return 'bronce';
}

function targetForLevel(level) {
  return level === 'bronce' ? 12 : level === 'plata' ? 21 : 21;
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
    target: targetForLevel(level)
  };
}

function addStudent(db, nombre) {
  const student = {
    id: nanoid(8),
    code: nanoid(6),
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
  LEVEL_INFO
};
