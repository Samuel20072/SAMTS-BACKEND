<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# SAMTS - Ecosistema Backend (NestJS + DDD)

Este es el proyecto backend del ecosistema **SAMTS**, diseñado bajo los principios de **Clean Architecture** (Arquitectura Limpia) y **Domain-Driven Design (DDD)** utilizando **NestJS (v11)** con **TypeScript strict mode**.

---

## 🛠️ Stack Tecnológico
- **Core Framework**: NestJS (v11) con TypeScript.
- **Base de Datos & ORM**: PostgreSQL + TypeORM.
- **Autenticación**: JWT con Passport (Passport-JWT, Bcrypt).
- **Validación**: class-validator & class-transformer.
- **Imágenes y Archivos**: Multer, Cloudinary y Sharp.
- **Emails**: Nodemailer.
- **Documentación**: Swagger (disponible en `/docs`).
- **Utilidades**: uuid.

---

## 📂 Arquitectura del Proyecto (DDD)
Todo el código del negocio reside en `src/`, organizado modularmente en funcionalidades (`features/`) y utilidades globales compartidas (`shared/`):

```text
src/
├── main.ts                          # Entrada de la aplicación (CORS, Pipes, Swagger)
├── app.module.ts                    # Módulo raíz de la aplicación (Configuración de Base de Datos)
├── app.controller.ts
├── app.service.ts
├── shared/                          # Capa global compartida
│   ├── entities/                    # Entidades base (e.g. BaseEntity con ID UUID, createdAt, updatedAt)
│   ├── enums/                       # Enumeraciones globales (e.g. UserRole)
│   ├── mail/                        # Servicio global de emails
│   ├── cloudinary/                  # Módulo para subida y procesamiento de imágenes
│   └── utils/                       # Utilidades generales
└── features/                        # Módulos del Dominio / Funcionalidades
    └── users/                       # Módulo de ejemplo (Usuarios)
        ├── users.module.ts          # Definición y acoplamiento del módulo NestJS
        ├── domain/                  # Capa de Dominio (Pureza del negocio)
        │   ├── entities/            # Entidades TypeORM del dominio
        │   └── repositories/        # Interfaces/Contratos de repositorios
        ├── application/             # Capa de Aplicación (Casos de uso)
        │   ├── dtos/                # Data Transfer Objects de entrada y salida (con validación y Swagger)
        │   └── use-cases/           # Clases con la lógica de negocio individual (Servicios)
        └── infrastructure/          # Capa de Infraestructura (Lógica técnica y de terceros)
            ├── controllers/         # Controladores REST
            └── persistence/         # Implementación concreta de repositorios (TypeORM)
```

---

## 🚀 Inicio Rápido

### 1. Variables de Entorno
Copia el archivo de ejemplo y ajusta los valores:
```bash
cp .env.example .env
```
```env
PORT=3000
NODE_ENV=development

# Conexión a PostgreSQL (TypeORM usa esta URL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/samts_db

# true solo si tu proveedor de base de datos exige SSL
DB_SSL=false

# Clave para firmar los JWT — cambiar en producción
JWT_SECRET=super-secret-key-change-in-production
```

### 2. Instalación de Dependencias
```bash
npm install
```

### 3. Ejecutar el Servidor
```bash
# Modo desarrollo con auto-reload
npm run start:dev

# Compilar para producción
npm run build

# Ejecutar el build de producción
npm run start:prod
```

### 4. Documentación de la API (Swagger)
Una vez iniciado el servidor, puedes interactuar con los endpoints y ver la documentación interactiva en:
👉 `http://localhost:3000/docs`
