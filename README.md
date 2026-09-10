# M3 Padel Academy — Sitio de fidelización

Sitio web con panel de administración y tarjeta pública por alumno para el
programa de fidelización de M3 Padel Academy (niveles Bronce / Plata / Oro,
evaluados por trimestre).

## Qué incluye

- `server.js` — servidor Express (login de admin, API de alumnos, tarjeta pública)
- `data.js` — lógica de negocio: reglas de nivel y persistencia
- `public/admin.html` — panel de administración (agregar alumnos, sumar clases,
  torneos, posteos, marcar pagos al día)
- `public/alumno.html` — tarjeta pública del alumno, accesible vía
  `/alumno.html?code=XXXXX` (cada alumno tiene su propio link, sin necesidad
  de crear cuenta)
- `public/index.html` — landing simple

Los datos se guardan en `db.json` (se crea automáticamente al arrancar el
servidor la primera vez).

## Reglas de nivel ya configuradas

- **Bronce**: nivel base, todos parten aquí.
- **Plata**: 12 clases en el trimestre + pagos al día.
- **Oro**: 21 clases + 3 torneos + 3 posteos en RR.SS. en el trimestre + pagos al día.

Si cambias los números de las reglas, edita la función `computeLevel` en `data.js`.

## Cómo correrlo en tu computador (para probar)

1. Instala Node.js si no lo tienes (versión 18 o superior) desde nodejs.org
2. Abre una terminal en esta carpeta y ejecuta:
   ```
   npm install
   cp .env.example .env
   ```
3. Abre el archivo `.env` y cambia `ADMIN_PASSWORD` por la clave que quieras
   usar para entrar al panel de administración.
4. Ejecuta:
   ```
   npm start
   ```
5. Abre `http://localhost:3000/admin.html` en tu navegador para entrar al
   panel admin con la clave que definiste.

## Cómo ponerlo en internet de verdad (producción)

La forma más simple y gratuita para partir es **Railway** (railway.app):

1. Crea una cuenta en railway.app con tu correo (no pide tarjeta para el plan
   gratis inicial).
2. Sube esta carpeta a un repositorio de GitHub (puedes arrastrar los archivos
   directo en github.com/new si no usas Git normalmente).
3. En Railway, elige "New Project" → "Deploy from GitHub repo" y selecciona
   el repositorio.
4. En la pestaña "Variables" del proyecto en Railway, agrega:
   - `ADMIN_PASSWORD` con tu clave
   - `SESSION_SECRET` con cualquier texto largo y aleatorio
5. Railway detecta que es un proyecto Node y lo despliega solo. Te da un link
   público tipo `tuproyecto.up.railway.app` — ese es tu sitio en producción.
6. Comparte `tuproyecto.up.railway.app/admin.html` contigo mismo, y a cada
   alumno le compartes su link individual (lo copias con el botón
   "Copiar link" en el panel admin, una vez que lo agregues).

Nota: en el plan gratis de Railway los datos en `db.json` pueden perderse si
el proyecto se reinicia, porque el disco no es permanente por defecto. Para
que los datos queden guardados de forma segura a largo plazo (con 100
alumnos reales), el siguiente paso es migrar `data.js` de un archivo JSON a
una base de datos real como PostgreSQL (Railway ofrece esto también, como un
servicio aparte dentro del mismo proyecto).

## Opcional: dominio propio

Una vez desplegado en Railway, puedes conectar un dominio propio (ej.
`fidelizacion.m3padelacademy.cl`) desde la misma pestaña de configuración del
proyecto en Railway, si compras un dominio en algún proveedor como NIC Chile
o Namecheap.
