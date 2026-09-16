# 🦜 OSAIA v1.0 - Inteligencia Artificial

> Plataforma de Inteligencia Artificial completa, versátil y profesional

![OSAIA](https://img.shields.io/badge/OSAIA-v1.0-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?logo=chart.js&logoColor=white)
![License](https://img.shields.io/badge/licencia-MIT-green.svg)

---

## ✨ Características Principales

### 🦜 Mascota Quetzal
- Personaje animado SVG del Quetzal (ave símbolo de Guatemala y Centroamérica)
- Animaciones flotantes, aura brillante y burbujas de diálogo
- Interactivo: haz clic para que hable

### 💬 Chat IA Conversacional
- **6 modos especializados**:
  - 💬 Conversación General
  - 💻 Programador Experto
  - 🌐 Traductor Multilenguaje
  - ✍️ Redactor Profesional
  - 🔢 Matemáticas y Análisis
  - 📊 Analista de Datos
- Respuestas inteligentes por patrones
- Indicador de "escribiendo" animado
- Acciones por mensaje: copiar, escuchar, regenerar, me gusta
- Historial de conversaciones
- Exportar chat a Markdown
- Síntesis de voz integrada

### 💻 Generador de Código Multi-Lenguaje
- **12+ lenguajes soportados**:
  - 🐍 Python
  - ⚡ JavaScript / TypeScript
  - ☕ Java
  - 🎮 C++
  - 🟣 C#
  - 🐘 PHP
  - 🔵 Go
  - 🗄️ SQL
- Plantillas profesionales y bien comentadas
- Niveles de complejidad: Básica, Estándar, Avanzada, Producción
- Opciones de comentarios
- Copiar al portapapeles
- Descargar con extensión correcta

### 🎨 Generador de Imágenes
- Descripción por texto
- **6 estilos artísticos**: Realista, Anime, Digital Art, 3D, Óleo, Cyberpunk
- **3 tamaños**: Cuadrado, Vertical, Horizontal
- Galería de imágenes generadas
- Descargar imágenes
- Integración con Picsum Photos

### 📊 Generador de Archivos
- **📊 Excel / CSV** - Datos tabulares
- **📋 JSON** - Datos estructurados
- **📝 Word / HTML** - Documentos compatibles con Word
- **🗄️ SQL** - Scripts de base de datos
- **📄 XML** - Datos etiquetados
- **📑 Markdown** - Documentación
- Vista previa en tiempo real
- Descarga directa

### 🎤 Síntesis y Reconocimiento de Voz
- **Texto a Voz (TTS)**: Web Speech API
  - Múltiples voces y idiomas
  - Control de velocidad y tono
  - Visualizador de audio animado
- **Voz a Texto (STT)**: Speech Recognition API
  - Grabar audio
  - Transcripción en tiempo real
  - Copiar transcripción
  - Enviar al chat directamente

### 📊 Panel Administrativo
- **4 tarjetas estadísticas**: Usuarios, Mensajes, Imágenes, Códigos
- **4 gráficos interactivos** con Chart.js:
  - Actividad de 7 días (líneas)
  - Uso por módulo (dona)
  - Lenguajes solicitados (barras horizontales)
  - Tiempo de respuesta (área)
- Tabla de actividad reciente
- Animaciones y efectos visuales

### 🎨 Diseño Premium
- **Glassmorphism** (efecto vidrio esmerilado)
- **Gradientes neón** (Cian → Morado → Rosa)
- **Animaciones suaves** y micro-interacciones
- **Fondo animado** con gradientes y cuadrícula
- **Totalmente responsive**: Móvil, Tablet, Desktop
- **Scrollbar personalizado**
- **Sistema de notificaciones** elegante
- **Efecto confeti** al generar contenido

---

## 🚀 Cómo Usar

### Opción 1: Abrir directamente (Recomendado)
1. Extrae el archivo ZIP
2. Abre la carpeta `osaia`
3. Doble clic en `index.html`
4. ¡Listo! Funciona en cualquier navegador moderno

### Opción 2: Servidor local (mejor experiencia)
```bash
# Opción A: Python
cd osaia
python3 -m http.server 8000
# Abre: http://localhost:8000

# Opción B: Node.js
npx serve osaia

# Opción C: PHP
cd osaia && php -S localhost:8000
```

### Navegadores soportados
- ✅ Chrome / Edge 90+ (Recomendado para voz)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

---

## 📁 Estructura del Proyecto

```
osaia/
├── 📄 index.html              # Página principal
├── 📁 css/
│   └── 🎨 styles.css          # Estilos completos
├── 📁 js/
│   ├── 📊 data.js             # Base de conocimientos
│   ├── 💻 code-generator.js   # Generador de código
│   ├── 💬 chat.js             # Lógica del chat
│   └── ⚙️ app.js              # Aplicación principal
├── 📁 assets/                 # Recursos adicionales
├── 📁 admin/                  # Panel administrativo
└── 📄 README.md               # Este archivo
```

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Propósito |
|------------|-----------|
| **HTML5** | Estructura semántica |
| **CSS3** | Estilos, animaciones, glassmorphism |
| **JavaScript ES6+** | Lógica de la aplicación |
| **Chart.js 4.4.1** | Gráficos interactivos |
| **RemixIcon 4.2.0** | Biblioteca de iconos |
| **Google Fonts (Inter)** | Tipografía moderna |
| **Web Speech API** | Síntesis y reconocimiento de voz |
| **Blob API** | Generación y descarga de archivos |
| **Picsum Photos** | Imágenes de demostración |

---

## 🎯 Guía Rápida de Uso

### 💬 Chatear con OSAIA
1. Ve a la sección **Chat IA**
2. Escribe tu mensaje en el campo de texto
3. Presiona **Enter** para enviar
4. O usa los **chips de sugerencia** rápidos
5. Cambia de **modo** en el panel izquierdo para respuestas especializadas

### 💻 Generar Código
1. Ve a **Código**
2. Selecciona el **lenguaje**
3. Describe lo que necesitas
4. Elige **complejidad** y opciones de **comentarios**
5. Clic en **✨ Generar Código**
6. **Copia** o **Descarga** el resultado

### 🎨 Crear Imágenes
1. Ve a **Imágenes**
2. Describe tu imagen detalladamente
3. Elige **estilo artístico** y **tamaño**
4. Clic en **✨ Generar Imagen**
5. Descarga desde la galería

### 📊 Generar Archivos
1. Ve a **Archivos**
2. Selecciona el **tipo de archivo**
3. Para CSV/Word: edita los datos si deseas
4. Pon un **nombre** al archivo
5. Clic en **📥 Generar y Descargar**

### 🎤 Usar la Voz
1. Ve a **Voz**
2. **Texto a Voz**: Escribe texto → Selecciona voz → ▶️ Reproducir
3. **Voz a Texto**: Clic en 🎤 Grabar → Habla → Clic para detener

### 📊 Ver Estadísticas
1. Ve a **Admin**
2. Explora las tarjetas y gráficos
3. Mira la tabla de actividad reciente

---

## 🌟 Características Técnicas Destacadas

### Arquitectura
- **Sin dependencias de backend**: 100% frontend
- **Sin compilación**: Funciona directamente en navegador
- **Modular**: Código organizado por archivos
- **Sin frameworks**: JavaScript vanilla para máxima compatibilidad

### Rendimiento
- **Lazy loading**: Recursos cargados bajo demanda
- **Animaciones optimizadas**: CSS transforms y opacity
- **Responsive**: Diseño fluido en todos los dispositivos
- **Accesible**: Semántica HTML5 adecuada

### Seguridad
- **Sin dependencias externas críticas**: Solo CDNs confiables
- **No recopila datos**: Todo se procesa localmente
- **Sin tracking**: Privacidad total del usuario

---

## 🔧 Personalización

### Cambiar colores
Edita las variables CSS en `css/styles.css` al inicio del archivo:
```css
:root {
    --accent-primary: #00d4ff;    /* Cian */
    --accent-secondary: #a855f7;  /* Morado */
    --accent-tertiary: #ff6b9d;   /* Rosa */
    /* ... */
}
```

### Agregar más respuestas al chat
Edita `js/data.js` en el objeto `patternResponses`:
```javascript
const patternResponses = {
    'tu_patron': [
        'Respuesta 1',
        'Respuesta 2',
        // ...
    ]
};
```

### Agregar plantillas de código
Edita `js/code-generator.js` en el objeto `codeTemplates`:
```javascript
const codeTemplates = {
    python: {
        templates: {
            tu_nueva_plantilla: `...código...`,
            default: generateDefaultPython
        }
    }
};
```

---

## 🚀 Próximas Mejoras (Roadmap)

- [ ] Integración con APIs reales de IA (OpenAI, etc.)
- [ ] Base de datos local (IndexedDB)
- [ ] Autenticación de usuarios
- [ ] Guardado en la nube
- [ ] Más lenguajes de programación
- [ ] Editor de código con resaltado (Monaco/CodeMirror)
- [ ] Modo colaborativo
- [ ] API REST para desarrolladores
- [ ] Aplicación móvil (PWA)

---

## 📜 Licencia

MIT License - Ver archivo de licencia para detalles.

**OSAIA** - Hecho con ❤️ y mucho código para la comunidad.

---

## 🦜 Sobre el Nombre y la Mascota

**OSAIA** es una inteligencia artificial inspirada en la belleza y libertad del **Quetzal** 🦜, ave majestuosa nativa de Centroamérica, símbolo de libertad, belleza y sabiduría en las culturas mayas.

Al igual que el quetzal vuela libre por los bosques nubosos, OSAIA vuela por el mundo del conocimiento para asistirte en tu camino digital.

---

## 🆘 Soporte

Si encuentras algún error o tienes sugerencias:
1. Revisa esta documentación
2. Prueba en un navegador moderno (Chrome recomendado)
3. Abre la consola de desarrollador (F12) para ver errores
4. Verifica que todas las dependencias CDN estén accesibles

---

## 🙏 Créditos

- **Diseño y desarrollo**: Equipo OSAIA Labs
- **Iconos**: RemixIcon (remixicon.com)
- **Gráficos**: Chart.js (chartjs.org)
- **Tipografía**: Google Fonts - Inter
- **Imágenes**: Picsum Photos (picsum.photos)

---

<div align="center">

**¡Gracias por usar OSAIA!** 🦜✨

*"La inteligencia artificial no reemplazará a los humanos, pero los humanos que usen IA reemplazarán a los que no la usen."*

</div>
