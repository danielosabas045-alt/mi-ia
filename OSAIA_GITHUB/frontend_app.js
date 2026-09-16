/* ============================================================
   OSAIA v1.0 - Aplicación Principal
   Integra todos los módulos: navegación, Quetzal, archivos,
   imágenes, voz, panel admin, notificaciones y más.
   ============================================================ */

// ===== ESTADO GLOBAL =====
const appState = {
    currentSection: 'home',
    selectedStyle: 'realistic',
    selectedSize: 'square',
    selectedFileType: 'csv',
    generatedImages: [],
    voiceEnabled: false,
    isRecording: false,
    recognition: null,
    stats: {
        users: 1247,
        messages: 28543,
        images: 3892,
        codes: 5621
    }
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🦜 OSAIA IA - Inicializando...');
    
    initNavigation();
    initQuetzal();
    initHeaderScroll();
    initCharts();
    initVoice();
    initFileGenerator();
    initImageGallery();
    
    // Mostrar mensaje del Quetzal después de 3 segundos
    setTimeout(() => {
        quetzalSpeak();
    }, 3000);
    
    console.log('✅ OSAIA IA - Inicialización completada');
});

// ===== NAVEGACIÓN =====
function initNavigation() {
    // Cargar la sección por defecto
    showSection('home');
}

function showSection(sectionId) {
    appState.currentSection = sectionId;
    
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Actualizar navegación
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.section === sectionId);
    });
    
    // Cerrar menú móvil
    document.getElementById('navMenu').classList.remove('open');
    
    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Inicializar gráficos si entramos a admin
    if (sectionId === 'admin') {
        setTimeout(initCharts, 100);
    }
    
    // Cargar voces si entramos a voz
    if (sectionId === 'voice') {
        setTimeout(loadVoices, 200);
    }
}

function toggleMobileMenu() {
    document.getElementById('navMenu').classList.toggle('open');
}

// ===== HEADER SCROLL =====
function initHeaderScroll() {
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// ===== MASCOTA QUETZAL =====
function initQuetzal() {
    const quetzalMessages = [
        "¡Hola! Soy OSAIA 🦜 ¿En qué te ayudo?",
        "Prueba preguntarme cualquier cosa ✨",
        "Puedo generar código, imágenes y más 💻",
        "¿Sabías que el quetzal es símbolo de libertad? 🦅",
        "¡No olvides explorar todos mis módulos! 🚀",
        "¿Necesitas ayuda con programación? 💡",
        "Habla conmigo en el chat, soy muy conversacional 🗣️",
        "Recuerda: cada línea de código es un paso hacia el éxito 👣"
    ];
    
    // Rotar mensajes automáticamente cada 15 segundos
    setInterval(() => {
        const bubble = document.getElementById('quetzalBubble');
        if (bubble && !bubble.classList.contains('show')) {
            const mensaje = quetzalMessages[Math.floor(Math.random() * quetzalMessages.length)];
            bubble.innerHTML = mensaje;
            bubble.classList.add('show');
            
            setTimeout(() => {
                bubble.classList.remove('show');
            }, 5000);
        }
    }, 15000);
}

function quetzalSpeak() {
    const mensajes = [
        "¡Hola! Soy **OSAIA** 🦜✨ Tu IA asistente. ¿En qué puedo ayudarte hoy?",
        "¡Prueba a chatear conmigo! Haz clic en **Chat IA** arriba 💬",
        "Puedo generar código en 12+ lenguajes. Ve a **Código** 💻",
        "¿Quieres ver magia? Genero imágenes con IA en **Imágenes** 🎨",
        "¿Necesitas Excel o Word? En **Archivos** te ayudo 📊",
        "¡También puedo hablar! Activa la voz en **Voz** 🎤"
    ];
    
    const bubble = document.getElementById('quetzalBubble');
    const mensaje = mensajes[Math.floor(Math.random() * mensajes.length)];
    bubble.innerHTML = mensaje;
    bubble.classList.add('show');
    
    // Ocultar después de 6 segundos
    setTimeout(() => {
        bubble.classList.remove('show');
    }, 6000);
}

// ===== NOTIFICACIONES =====
function showNotification(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.className = `notification ${tipo}`;
    
    const iconos = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    notificacion.innerHTML = `<span>${iconos[tipo] || iconos.info}</span><span>${mensaje}</span>`;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'notifSlideOut 0.3s ease-out forwards';
        setTimeout(() => notificacion.remove(), 300);
    }, 3500);
}

// ===== MODAL =====
function openModal(titulo, contenido) {
    document.getElementById('modalTitle').textContent = titulo;
    document.getElementById('modalBody').innerHTML = contenido;
    document.getElementById('modal').classList.add('open');
}

function closeModal() {
    document.getElementById('modal').classList.remove('open');
}

function closeModalOnOverlay(event) {
    if (event.target.id === 'modal') {
        closeModal();
    }
}

// ===== ESTADÍSTICAS =====
function updateStat(statId, incremento) {
    appState.stats[statId.replace('stat', '').toLowerCase()] += incremento;
    
    const element = document.getElementById(statId);
    if (element) {
        animateNumber(element, parseInt(element.textContent.replace(/,/g, '')), incremento);
    }
}

function animateNumber(element, valorInicial, incremento) {
    const valorFinal = valorInicial + incremento;
    const duracion = 800;
    const pasos = 30;
    const incrementoPorPaso = incremento / pasos;
    let pasoActual = 0;
    
    const intervalo = setInterval(() => {
        pasoActual++;
        const valorActual = Math.round(valorInicial + (incrementoPorPaso * pasoActual));
        element.textContent = valorActual.toLocaleString();
        
        if (pasoActual >= pasos) {
            element.textContent = valorFinal.toLocaleString();
            clearInterval(intervalo);
        }
    }, duracion / pasos);
}

// ===== GRÁFICOS DEL PANEL ADMIN =====
let chartsInitialized = false;

function initCharts() {
    if (chartsInitialized) return;
    if (typeof Chart === 'undefined') return;
    
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;
    
    chartsInitialized = true;
    
    // Colores monocromáticos
    Chart.defaults.color = '#8a8a8a';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';
    
    // Gráfico 1: Actividad semanal
    new Chart(document.getElementById('activityChart'), {
        type: 'line',
        data: {
            labels: adminChartData.activity.labels,
            datasets: [
                {
                    label: 'Mensajes',
                    data: adminChartData.activity.messages,
                    borderColor: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#0a0a0a',
                    pointBorderWidth: 2,
                    pointRadius: 5
                },
                {
                    label: 'Imágenes',
                    data: adminChartData.activity.images,
                    borderColor: '#c0c0c0',
                    backgroundColor: 'rgba(192, 192, 192, 0.06)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#c0c0c0',
                    pointBorderColor: '#0a0a0a',
                    pointBorderWidth: 2,
                    pointRadius: 5
                },
                {
                    label: 'Códigos',
                    data: adminChartData.activity.codes,
                    borderColor: '#888888',
                    backgroundColor: 'rgba(136, 136, 136, 0.05)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#888888',
                    pointBorderColor: '#0a0a0a',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { usePointStyle: true, padding: 20 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.03)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
    
    // Gráfico 2: Uso por módulo (Pie)
    new Chart(document.getElementById('moduleChart'), {
        type: 'doughnut',
        data: {
            labels: adminChartData.modules.labels,
            datasets: [{
                data: adminChartData.modules.data,
                backgroundColor: adminChartData.modules.colors,
                borderColor: 'rgba(10, 10, 26, 0.8)',
                borderWidth: 3,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: { usePointStyle: true, padding: 15 }
                }
            }
        }
    });
    
    // Gráfico 3: Lenguajes (Barra horizontal)
    new Chart(document.getElementById('languagesChart'), {
        type: 'bar',
        data: {
            labels: adminChartData.languages.labels,
            datasets: [{
                label: 'Solicitudes',
                data: adminChartData.languages.data,
                backgroundColor: adminChartData.languages.colors,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.03)' }
                },
                y: {
                    grid: { display: false }
                }
            }
        }
    });
    
    // Gráfico 4: Tiempo de respuesta
    new Chart(document.getElementById('responseChart'), {
        type: 'line',
        data: {
            labels: adminChartData.responseTime.labels,
            datasets: [{
                label: 'Segundos',
                data: adminChartData.responseTime.data,
                borderColor: '#d4af37',
                backgroundColor: 'rgba(212, 175, 55, 0.08)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#d4af37',
                pointBorderColor: '#0a0a0a',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Segundos' },
                    grid: { color: 'rgba(255,255,255,0.03)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

// ===== GENERADOR DE IMÁGENES =====
function initImageGallery() {
    // Cargar algunas imágenes de ejemplo
    appState.generatedImages = [...sampleImages];
    renderImageGallery();
}

function selectStyle(element) {
    document.querySelectorAll('.style-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    appState.selectedStyle = element.dataset.style;
}

function selectSize(element, size) {
    document.querySelectorAll('.size-btn').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    appState.selectedSize = size;
}

function generateImage() {
    const prompt = document.getElementById('imagePrompt').value.trim();
    if (!prompt) {
        showNotification('⚠️ Por favor describe la imagen', 'warning');
        return;
    }
    
    showNotification('🎨 OSAIA está creando tu imagen...');
    
    setTimeout(() => {
        const sizeMap = {
            square: { w: 600, h: 600 },
            portrait: { w: 500, h: 750 },
            landscape: { w: 800, h: 500 }
        };
        
        const size = sizeMap[appState.selectedSize];
        const seed = Date.now();
        
        // Usar picsum.photos para imágenes reales
        const nuevaImagen = {
            prompt: prompt,
            style: appState.selectedStyle,
            size: appState.selectedSize,
            url: `https://picsum.photos/seed/${seed}/${size.w}/${size.h}`
        };
        
        appState.generatedImages.unshift(nuevaImagen);
        renderImageGallery();
        
        showNotification('✅ Imagen generada exitosamente', 'success');
        triggerConfetti();
        updateStat('statImages', 1);
        
    }, 1800);
}

function renderImageGallery() {
    const gallery = document.getElementById('imageGallery');
    
    if (appState.generatedImages.length === 0) {
        gallery.innerHTML = `
            <div class="gallery-empty">
                <i class="ri-image-add-line"></i>
                <p>Tus imágenes generadas aparecerán aquí</p>
                <p style="font-size: 0.85rem; margin-top: 0.5rem;">Describe tu visión y haz clic en generar</p>
            </div>
        `;
        return;
    }
    
    gallery.innerHTML = appState.generatedImages.map((img, index) => `
        <div class="image-card">
            <img src="${img.url}" alt="${img.prompt}" loading="lazy" onerror="this.src='https://picsum.photos/seed/fallback${index}/600/400'">
            <div class="image-card-info">
                <div class="image-card-prompt">${img.prompt}</div>
                <div class="image-card-actions">
                    <button onclick="downloadImage('${img.url}', 'osaia_imagen_${index}')">
                        <i class="ri-download-line"></i> Descargar
                    </button>
                    <button onclick="showNotification('🔗 Enlace copiado', 'success')">
                        <i class="ri-link"></i> Copiar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function downloadImage(url, nombre) {
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre + '.jpg';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showNotification('💾 Descargando imagen...', 'success');
}

// ===== GENERADOR DE ARCHIVOS =====
function initFileGenerator() {
    updateFilePreview();
}

function selectFileType(element, type) {
    document.querySelectorAll('.file-type-card').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    appState.selectedFileType = type;
    
    const labels = {
        csv: 'Excel / CSV',
        json: 'JSON',
        html: 'Word / HTML',
        sql: 'SQL',
        xml: 'XML',
        markdown: 'Markdown'
    };
    
    document.getElementById('fileTypeLabel').textContent = labels[type];
    updateFilePreview();
}

function updateFilePreview() {
    const type = appState.selectedFileType;
    const previewContent = document.getElementById('filePreviewContent');
    const csvData = document.getElementById('csvData').value;
    
    const configArea = document.getElementById('fileConfigArea');
    
    // Mostrar/ocultar configuración CSV
    const csvConfig = document.getElementById('csvConfig');
    if (csvConfig) {
        csvConfig.style.display = (type === 'csv' || type === 'html') ? 'block' : 'none';
    }
    
    switch(type) {
        case 'csv':
            previewContent.innerHTML = renderCSVPreview(csvData);
            break;
        case 'json':
            previewContent.innerHTML = renderJSONPreview();
            break;
        case 'html':
            previewContent.innerHTML = renderHTMLPreview(csvData);
            break;
        case 'sql':
            previewContent.innerHTML = renderSQLPreview();
            break;
        case 'xml':
            previewContent.innerHTML = renderXMLPreview();
            break;
        case 'markdown':
            previewContent.innerHTML = renderMarkdownPreview();
            break;
    }
}

function renderCSVPreview(data) {
    const filas = data.trim().split('\n').filter(f => f.trim());
    if (filas.length === 0) return '<p style="color: var(--text-muted);">Sin datos para mostrar</p>';
    
    const encabezados = filas[0].split(',');
    const cuerpo = filas.slice(1);
    
    let html = '<div class="excel-preview"><table><thead><tr>';
    encabezados.forEach(h => html += `<th>${h.trim()}</th>`);
    html += '</tr></thead><tbody>';
    
    cuerpo.slice(0, 8).forEach(fila => {
        html += '<tr>';
        fila.split(',').forEach(celda => html += `<td>${celda.trim()}</td>`);
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    if (cuerpo.length > 8) {
        html += `<p style="color: var(--text-muted); font-size: 0.82rem; margin-top: 0.8rem;">... y ${cuerpo.length - 8} filas más</p>`;
    }
    html += '</div>';
    
    return html;
}

function renderJSONPreview() {
    const ejemplo = {
        empresa: "OSAIA Corp",
        fecha: new Date().toISOString().split('T')[0],
        empleados: [
            { id: 1, nombre: "Ana García", puesto: "Desarrolladora", salario: 45000 },
            { id: 2, nombre: "Carlos Pérez", puesto: "Diseñador", salario: 42000 },
            { id: 3, nombre: "María López", puesto: "Analista", salario: 48000 }
        ],
        resumen: {
            total_empleados: 3,
            salario_promedio: 45000,
            departamento: "Tecnología"
        }
    };
    
    return `<pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: var(--radius-md); overflow-x: auto; color: #a5f3fc; font-family: Consolas, monospace; font-size: 0.85rem; line-height: 1.6;">${JSON.stringify(ejemplo, null, 2)}</pre>`;
}

function renderHTMLPreview(data) {
    const filas = data.trim().split('\n').filter(f => f.trim());
    const encabezados = filas[0].split(',');
    const cuerpo = filas.slice(1, 6);
    
    let filasHTML = '';
    cuerpo.forEach(fila => {
        filasHTML += '<tr>';
        fila.split(',').forEach(celda => filasHTML += `<td>${celda.trim()}</td>`);
        filasHTML += '</tr>';
    });
    
    return `
        <div style="background: white; color: #333; padding: 1.5rem; border-radius: var(--radius-md); font-family: 'Times New Roman', serif;">
            <h1 style="color: #1a1a2e; border-bottom: 2px solid #00d4ff; padding-bottom: 0.5rem;">📊 Reporte de Datos - OSAIA</h1>
            <p style="color: #666; font-size: 0.9rem;">Generado: ${new Date().toLocaleDateString('es-ES')}</p>
            <h2 style="color: #2d3748; margin-top: 1.5rem;">Datos de Empleados</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
                <thead>
                    <tr style="background: #00d4ff; color: white;">
                        ${encabezados.map(h => `<th style="padding: 0.6rem; border: 1px solid #ddd; text-align: left;">${h.trim()}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${filasHTML}
                </tbody>
            </table>
            <p style="margin-top: 2rem; color: #666; font-size: 0.85rem; font-style: italic;">Documento generado por OSAIA Intelligence</p>
        </div>
    `;
}

function renderSQLPreview() {
    const sql = `-- ============================================
-- Script SQL generado por OSAIA
-- Fecha: ${new Date().toLocaleDateString('es-ES')}
-- ============================================

CREATE TABLE IF NOT EXISTS empleados (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    puesto          VARCHAR(80),
    departamento    VARCHAR(60),
    salario         DECIMAL(10,2),
    fecha_ingreso   DATE DEFAULT CURRENT_DATE,
    activo          BOOLEAN DEFAULT TRUE
);

-- Datos de ejemplo
INSERT INTO empleados (nombre, puesto, departamento, salario) VALUES
('Ana García', 'Desarrolladora Senior', 'Tecnología', 55000.00),
('Carlos Pérez', 'Diseñador UX', 'Diseño', 48000.00),
('María López', 'Analista de Datos', 'BI', 52000.00),
('Juan Rodríguez', 'Project Manager', 'Gestión', 62000.00);

-- Consultas útiles
SELECT * FROM empleados WHERE activo = TRUE;
SELECT departamento, AVG(salario) as promedio 
FROM empleados GROUP BY departamento;`;
    
    return `<pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: var(--radius-md); overflow-x: auto; color: #a5f3fc; font-family: Consolas, monospace; font-size: 0.85rem; line-height: 1.6;">${sql}</pre>`;
}

function renderXMLPreview() {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<empresa nombre="OSAIA Corp" fecha="${new Date().toISOString().split('T')[0]}">
    <departamento nombre="Tecnología">
        <empleado id="1">
            <nombre>Ana García</nombre>
            <puesto>Desarrolladora Senior</puesto>
            <salario moneda="GTQ">55000</salario>
        </empleado>
        <empleado id="2">
            <nombre>Carlos Pérez</nombre>
            <puesto>Desarrollador Backend</puesto>
            <salario moneda="GTQ">48000</salario>
        </empleado>
    </departamento>
    <departamento nombre="Diseño">
        <empleado id="3">
            <nombre>María López</nombre>
            <puesto>Diseñadora UX/UI</puesto>
            <salario moneda="GTQ">45000</salario>
        </empleado>
    </departamento>
    <resumen>
        <total_empleados>3</total_empleados>
        <salario_promedio>49333</salario_promedio>
    </resumen>
</empresa>`;
    
    return `<pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: var(--radius-md); overflow-x: auto; color: #fca5a5; font-family: Consolas, monospace; font-size: 0.85rem; line-height: 1.6;">${xml}</pre>`;
}

function renderMarkdownPreview() {
    return `
        <div style="background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: var(--radius-md); font-family: Georgia, serif; line-height: 1.8;">
            <h1 style="background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem;">📘 Documento de Ejemplo - OSAIA</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;"><em>Generado por OSAIA Intelligence</em></p>
            
            <h2 style="color: var(--accent-primary); margin-top: 1.5rem;">📋 Sección Principal</h2>
            <p>Este es un documento de ejemplo en formato <strong>Markdown</strong>. Markdown es un lenguaje de marcado ligero muy popular para documentación.</p>
            
            <h3 style="color: var(--accent-secondary); margin-top: 1rem;">Características:</h3>
            <ul style="color: var(--text-secondary); padding-left: 1.5rem;">
                <li>Fácil de leer y escribir</li>
                <li>Compatible con GitHub</li>
                <li>Se convierte a HTML fácilmente</li>
                <li>Ideal para documentación técnica</li>
            </ul>
            
            <h3 style="color: var(--accent-secondary); margin-top: 1rem;">Código de ejemplo:</h3>
            <pre style="background: rgba(0,0,0,0.4); padding: 1rem; border-radius: 8px; overflow-x: auto;"><code style="color: #a5f3fc;">function saludar() {
    console.log("¡Hola desde OSAIA!");
}</code></pre>
            
            <blockquote style="border-left: 4px solid var(--accent-primary); padding-left: 1rem; color: var(--text-muted); margin: 1rem 0;">
                "La inteligencia artificial es el futuro de la humanidad."
            </blockquote>
        </div>
    `;
}

function generateFile() {
    const type = appState.selectedFileType;
    const nombre = document.getElementById('fileName').value || 'archivo_osaia';
    const csvData = document.getElementById('csvData').value;
    
    let contenido, extension, tipoMime;
    
    switch(type) {
        case 'csv':
            contenido = csvData;
            extension = 'csv';
            tipoMime = 'text/csv; charset=utf-8';
            break;
        case 'json':
            const jsonData = {
                empresa: "OSAIA Corp",
                fechaGeneracion: new Date().toISOString(),
                empleados: [
                    { id: 1, nombre: "Ana García", puesto: "Desarrolladora", salario: 55000 },
                    { id: 2, nombre: "Carlos Pérez", puesto: "Diseñador", salario: 48000 },
                    { id: 3, nombre: "María López", puesto: "Analista", salario: 52000 }
                ]
            };
            contenido = JSON.stringify(jsonData, null, 2);
            extension = 'json';
            tipoMime = 'application/json';
            break;
        case 'html':
            contenido = generateWordHTML(csvData);
            extension = 'html';
            tipoMime = 'application/msword';
            break;
        case 'sql':
            contenido = `-- Script SQL generado por OSAIA
-- Fecha: ${new Date().toLocaleDateString('es-ES')}

CREATE TABLE empleados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    puesto VARCHAR(80),
    salario DECIMAL(10,2)
);

INSERT INTO empleados (nombre, puesto, salario) VALUES
('Ana García', 'Desarrolladora', 55000.00),
('Carlos Pérez', 'Diseñador', 48000.00),
('María López', 'Analista', 52000.00);`;
            extension = 'sql';
            tipoMime = 'text/plain';
            break;
        case 'xml':
            contenido = `<?xml version="1.0" encoding="UTF-8"?>
<empresa>
    <fecha_generacion>${new Date().toISOString()}</fecha_generacion>
    <empleados>
        <empleado id="1">
            <nombre>Ana García</nombre>
            <puesto>Desarrolladora</puesto>
            <salario>55000</salario>
        </empleado>
        <empleado id="2">
            <nombre>Carlos Pérez</nombre>
            <puesto>Diseñador</puesto>
            <salario>48000</salario>
        </empleado>
    </empleados>
</empresa>`;
            extension = 'xml';
            tipoMime = 'application/xml';
            break;
        case 'markdown':
            contenido = `# Documento OSAIA\n\n**Generado:** ${new Date().toLocaleDateString('es-ES')}\n\n## Sección 1\n\nEste es un documento Markdown generado por OSAIA.\n\n### Características\n\n- Fácil de leer\n- Compatible con GitHub\n- Ideal para documentación\n\n## Código\n\n\`\`\`javascript\nfunction saludar() {\n    console.log("¡Hola OSAIA!");\n}\n\`\`\`\n\n> Cita inspiradora: "La IA es el futuro"\n\n---\n\n*Documento generado automáticamente por OSAIA Intelligence*`;
            extension = 'md';
            tipoMime = 'text/markdown';
            break;
    }
    
    const nombreArchivo = `${nombre}.${extension}`;
    downloadFile(contenido, nombreArchivo, tipoMime);
    showNotification(`💾 Archivo "${nombreArchivo}" descargado`, 'success');
    triggerConfetti();
}

function generateWordHTML(csvData) {
    const filas = csvData.trim().split('\n').filter(f => f.trim());
    const encabezados = filas[0].split(',');
    const cuerpo = filas.slice(1);
    
    let filasHTML = '';
    cuerpo.forEach(fila => {
        filasHTML += '<tr>';
        fila.split(',').forEach(celda => filasHTML += `<td>${celda.trim()}</td>`);
        filasHTML += '</tr>';
    });
    
    return `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>Documento OSAIA</title>
<style>
    body { font-family: 'Times New Roman', serif; color: #333; padding: 40px; }
    h1 { color: #1a1a2e; border-bottom: 2px solid #00d4ff; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #00d4ff; color: white; padding: 10px; text-align: left; }
    td { border: 1px solid #ddd; padding: 8px; }
    tr:nth-child(even) { background: #f8f9fa; }
</style>
</head>
<body>
    <h1>📊 Reporte de Datos - OSAIA Intelligence</h1>
    <p><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
    <p><strong>Generado por:</strong> OSAIA v1.0</p>
    
    <h2>Datos</h2>
    <table>
        <thead>
            <tr>${encabezados.map(h => `<th>${h.trim()}</th>`).join('')}</tr>
        </thead>
        <tbody>${filasHTML}</tbody>
    </table>
    
    <p style="margin-top: 40px; color: #666; font-style: italic;">
        Este documento fue generado automáticamente por OSAIA Intelligence.
    </p>
</body>
</html>`;
}

function copyFileContent() {
    const preview = document.getElementById('filePreviewContent');
    const text = preview.innerText;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('📋 Contenido copiado', 'success');
    });
}

// ===== SÍNTESIS DE VOZ =====
function initVoice() {
    // Cargar voces cuando estén disponibles
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
        setTimeout(loadVoices, 500);
    }
    
    // Inicializar reconocimiento de voz
    initSpeechRecognition();
}

function loadVoices() {
    const select = document.getElementById('voiceSelect');
    if (!select) return;
    
    const voces = window.speechSynthesis.getVoices();
    
    if (voces.length === 0) {
        select.innerHTML = '<option value="">Cargando voces...</option>';
        return;
    }
    
    select.innerHTML = '';
    
    // Voces en español primero
    const vocesEspañol = voces.filter(v => v.lang.startsWith('es'));
    const otrasVoces = voces.filter(v => !v.lang.startsWith('es'));
    
    [...vocesEspañol, ...otrasVoces].forEach((voz, index) => {
        const opcion = document.createElement('option');
        opcion.value = index;
        opcion.textContent = `${voz.name} (${voz.lang})${voz.default ? ' - Predeterminada' : ''}`;
        opcion.dataset.voiceIndex = index;
        select.appendChild(opcion);
    });
    
    if (vocesEspañol.length > 0) {
        select.value = voces.findIndex(v => v === vocesEspañol[0]);
    }
}

function speakText() {
    if (!('speechSynthesis' in window)) {
        showNotification('⚠️ Tu navegador no soporta síntesis de voz', 'warning');
        return;
    }
    
    const texto = document.getElementById('ttsText').value.trim();
    if (!texto) {
        showNotification('⚠️ Por favor ingresa texto para leer', 'warning');
        return;
    }
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(texto);
    
    const voces = window.speechSynthesis.getVoices();
    const indiceVoz = parseInt(document.getElementById('voiceSelect').value);
    if (voces[indiceVoz]) {
        utterance.voice = voces[indiceVoz];
    }
    
    utterance.rate = parseFloat(document.getElementById('voiceRate').value);
    utterance.pitch = parseFloat(document.getElementById('voicePitch').value);
    utterance.lang = 'es-ES';
    
    utterance.onstart = () => {
        document.getElementById('speakBtn').style.animation = 'pulse 1s infinite';
    };
    
    utterance.onend = () => {
        document.getElementById('speakBtn').style.animation = '';
    };
    
    window.speechSynthesis.speak(utterance);
    showNotification('🔊 Reproduciendo audio...');
}

function pauseSpeech() {
    if (window.speechSynthesis.speaking) {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            showNotification('▶️ Reanudando');
        } else {
            window.speechSynthesis.pause();
            showNotification('⏸️ Pausado');
        }
    }
}

function stopSpeech() {
    window.speechSynthesis.cancel();
    document.getElementById('speakBtn').style.animation = '';
    showNotification('⏹️ Detenido');
}

function updateRateValue() {
    document.getElementById('rateValue').textContent = document.getElementById('voiceRate').value;
}

function updatePitchValue() {
    document.getElementById('pitchValue').textContent = document.getElementById('voicePitch').value;
}

// ===== RECONOCIMIENTO DE VOZ =====
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        appState.recognition = new SpeechRecognition();
        appState.recognition.continuous = true;
        appState.recognition.interimResults = true;
        appState.recognition.lang = 'es-ES';
        
        let textoFinal = '';
        
        appState.recognition.onresult = (event) => {
            let transcripcion = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcripcion += event.results[i][0].transcript;
            }
            
            document.getElementById('transcriptText').value = textoFinal + transcripcion;
        };
        
        appState.recognition.onend = () => {
            if (appState.isRecording) {
                textoFinal = document.getElementById('transcriptText').value + ' ';
                appState.recognition.start();
            }
        };
        
        appState.recognition.onerror = (event) => {
            console.error('Error de reconocimiento:', event.error);
            if (event.error !== 'no-speech') {
                showNotification(`⚠️ Error: ${event.error}`, 'error');
            }
        };
    }
}

function toggleRecording() {
    if (!appState.recognition) {
        showNotification('⚠️ Tu navegador no soporta reconocimiento de voz. Prueba Chrome.', 'warning');
        return;
    }
    
    const btn = document.getElementById('recordBtn');
    const status = document.getElementById('recordStatus');
    
    if (!appState.isRecording) {
        // Empezar a grabar
        appState.isRecording = true;
        document.getElementById('transcriptText').value = '';
        appState.recognition.start();
        
        btn.style.animation = 'pulse 1s infinite';
        btn.style.boxShadow = '0 0 30px rgba(255, 71, 87, 0.6)';
        status.textContent = '🔴 Grabando... Habla ahora';
        status.style.color = 'var(--accent-danger)';
        
        showNotification('🎤 Grabación iniciada');
    } else {
        // Detener grabación
        appState.isRecording = false;
        appState.recognition.stop();
        
        btn.style.animation = '';
        btn.style.boxShadow = '';
        status.textContent = '✅ Grabación finalizada';
        status.style.color = 'var(--accent-success)';
        
        setTimeout(() => {
            status.textContent = 'Haz clic para comenzar a grabar';
            status.style.color = '';
        }, 3000);
        
        showNotification('🎤 Grabación finalizada', 'success');
    }
}

function copyTranscript() {
    const texto = document.getElementById('transcriptText').value;
    if (!texto) {
        showNotification('⚠️ No hay texto para copiar', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(texto).then(() => {
        showNotification('📋 Transcripción copiada', 'success');
    });
}

function sendTranscriptToChat() {
    const texto = document.getElementById('transcriptText').value;
    if (!texto) {
        showNotification('⚠️ No hay texto para enviar', 'warning');
        return;
    }
    
    showSection('chat');
    setTimeout(() => {
        document.getElementById('chatInput').value = texto;
        autoResizeTextarea(document.getElementById('chatInput'));
        sendMessage();
    }, 300);
}

// ===== ANIMACIONES CSS =====
const styleAnimations = document.createElement('style');
styleAnimations.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
    }
`;
document.head.appendChild(styleAnimations);

// ===== FUNCIONES GLOBALES ÚTILES =====
function downloadFile(contenido, nombre, tipo) {
    const BOM = '\uFEFF'; // Para compatibilidad con Excel en español
    const blob = new Blob([BOM + contenido], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

function triggerConfetti() {
    if (typeof triggerConfettiGlobal === 'function') {
        triggerConfettiGlobal();
    }
}

// Actualizar preview cuando cambian los datos CSV
document.addEventListener('input', (e) => {
    if (e.target.id === 'csvData') {
        updateFilePreview();
    }
});
