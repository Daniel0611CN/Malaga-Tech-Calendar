# Málaga Tech Calendar

> El punto de encuentro para descubrir los eventos tecnológicos más interesantes de Málaga y la Costa del Sol.

[![Ver la aplicación](https://img.shields.io/badge/Ver%20la%20web-malaga--tech--calendar-8068dc?style=for-the-badge)](https://daniel0611cn.github.io/malaga-tech-calendar/)

## Sobre el proyecto

**Málaga Tech Calendar** es un calendario virtual para que la comunidad pueda encontrar en un mismo lugar los eventos tecnológicos que se celebran en Málaga: meetups, conferencias, talleres, actividades de inteligencia artificial, desarrollo web, startups, gaming y ciberseguridad.

El proyecto se está realizando como parte del **curso GitHub Devs de la Universidad de Málaga (UMA)**. Su objetivo es aplicar buenas prácticas de desarrollo y colaboración utilizando GitHub, mientras se crea una herramienta útil para el ecosistema tecnológico local.

## Demo

La aplicación está publicada con GitHub Pages:

**[https://daniel0611cn.github.io/malaga-tech-calendar/](https://daniel0611cn.github.io/malaga-tech-calendar/)**

## Funcionalidades

- Agenda visual con eventos tecnológicos de Málaga y la Costa del Sol.
- Eventos destacados con fecha, horario, ubicación y categoría.
- Búsqueda por nombre del evento, lugar o temática.
- Filtros por IA, desarrollo, startups, gaming y ciberseguridad.
- Modal con información ampliada de cada evento.
- Modo oscuro y modo claro.
- Diseño responsive para escritorio, tablet y móvil.
- Sección para proponer nuevos eventos a la comunidad.
- Despliegue automático con GitHub Actions y GitHub Pages.

## Tecnología

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- CSS responsive sin framework visual
- [Lucide React](https://lucide.dev/) para los iconos
- GitHub Actions para integración y despliegue
- GitHub Pages para publicación

## Ejecutar el proyecto en local

Necesitas tener instalado Node.js 20 o una versión compatible.

```bash
git clone https://github.com/Daniel0611CN/malaga-tech-calendar.git
cd malaga-tech-calendar
npm install
npm run dev
```

Después, abre la URL que muestre Vite en el terminal, normalmente `http://localhost:5173`.

## Scripts disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run lint     # Comprueba el código con ESLint
npm run build    # Genera la build de producción
npm run preview  # Sirve localmente la build generada
```

## Despliegue

Cada cambio que llega a la rama `main` ejecuta automáticamente el workflow
`.github/workflows/deploy.yml`. El workflow instala las dependencias, ejecuta la
build y publica la carpeta `dist` en GitHub Pages.

## Estado del proyecto

Actualmente se trata de un MVP con datos de ejemplo. Las próximas mejoras pueden
incluir persistencia de eventos, integración con fuentes externas, formulario
real de propuestas, calendario mensual y un mapa de ubicaciones.

## Licencia

Este proyecto se desarrolla con fines educativos dentro del curso GitHub Devs de
la UMA.
