/* ============================================================
   OSAIA - Módulo de Chat Inteligente
   ============================================================ */

// Estado del chat
let chatState = {
    currentMode: 'chat',
    messages: [],
    history: [],
    voiceEnabled: false,
    isTyping: false
};

// Configuración de modos de IA
const chatModes = {
    chat: {
        name: 'Conversación General',
        icon: 'ri-chat-3-line',
        desc: 'OSAIA responderá de manera natural y versátil',
        systemPrompt: 'Eres OSAIA, una asistente de IA amigable, servicial y conocedora. Responde de manera clara, concisa y útil.'
    },
    code: {
        name: 'Programador Experto',
        icon: 'ri-code-s-slash-line',
        desc: 'Especializado en código y desarrollo de software',
        systemPrompt: 'Eres OSAIA, un ingeniero de software senior con 15 años de experiencia. Explica conceptos técnicos claramente, genera código limpio y sigue las mejores prácticas.'
    },
    translate: {
        name: 'Traductor Multilenguaje',
        icon: 'ri-translate',
        desc: 'Traduce textos entre múltiples idiomas',
        systemPrompt: 'Eres OSAIA, un traductor profesional. Traduce con precisión manteniendo el tono y contexto. Detecta automáticamente el idioma de origen.'
    },
    writer: {
        name: 'Redactor Profesional',
        icon: 'ri-quill-pen-line',
        desc: 'Crea textos, correos, ensayos y contenido',
        systemPrompt: 'Eres OSAIA, un redactor profesional creativo y versátil. Escribe textos claros, persuasivos y bien estructurados en español.'
    },
    math: {
        name: 'Matemáticas y Análisis',
        icon: 'ri-calculator-line',
        desc: 'Resuelve problemas matemáticos paso a paso',
        systemPrompt: 'Eres OSAIA, un tutor de matemáticas. Resuelve problemas explicando cada paso de manera clara y didáctica. Usa lenguaje sencillo.'
    },
    analyst: {
        name: 'Analista de Datos',
        icon: 'ri-line-chart-line',
        desc: 'Analiza información y extrae insights',
        systemPrompt: 'Eres OSAIA, un analista de datos. Procesa información, identifica patrones y presenta conclusiones de manera estructurada.'
    },
    architect: {
        name: 'Arquitecto IA',
        icon: 'ri-function-line',
        desc: 'Especialista en arquitectura técnica de IA generativa',
        systemPrompt: 'Eres OSAIA, un arquitecto de IA especializado en el pipeline completo: Python, C++, CUDA, GLSL, PyTorch, TensorFlow, FFmpeg. Explica conceptos técnicos con profundidad y precisión.'
    }
};

// ===== CAMBIAR MODO DE CHAT =====
function setChatMode(mode) {
    chatState.currentMode = mode;
    
    // Actualizar UI
    document.querySelectorAll('.chat-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    const modeConfig = chatModes[mode];
    document.getElementById('chatModeIcon').innerHTML = `<i class="${modeConfig.icon}"></i>`;
    document.getElementById('chatModeName').textContent = modeConfig.name;
    document.getElementById('chatModeDesc').textContent = modeConfig.desc;
    
    // Agregar mensaje de sistema
    addSystemMessage(`🔄 Modo cambiado a: **${modeConfig.name}** - ${modeConfig.desc}`);
    
    showNotification(`🎯 Modo: ${modeConfig.name}`);
}

// ===== ENVIAR MENSAJE =====
function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    // Agregar mensaje del usuario
    addUserMessage(text);
    input.value = '';
    autoResizeTextarea(input);
    
    // Mostrar typing indicator
    showTypingIndicator();
    
    // Generar respuesta después de un delay
    setTimeout(() => {
        hideTypingIndicator();
        const response = generateResponse(text);
        addAIMessage(response);
        
        // Hablar si está habilitado
        if (chatState.voiceEnabled) {
            speakTextFromChat(response);
        }
        
        // Actualizar estadísticas
        updateStat('statMessages', 1);
        
    }, 800 + Math.random() * 1200);
}

// ===== AGREGAR MENSAJES AL CHAT =====
function addUserMessage(text) {
    const container = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-wrapper user';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="ri-user-3-line"></i>
        </div>
        <div class="message-content-wrapper">
            <div class="message-sender">Tú</div>
            <div class="message-bubble">${formatMessage(text)}</div>
            <div class="message-actions">
                <button class="message-action" title="Copiar" onclick="copyMessageContent(this)"><i class="ri-file-copy-line"></i></button>
                <button class="message-action" title="Eliminar" onclick="deleteMessage(this)"><i class="ri-delete-bin-line"></i></button>
            </div>
        </div>
    `;
    container.appendChild(messageDiv);
    scrollToBottom();
    
    chatState.messages.push({ role: 'user', content: text });
}

function addAIMessage(text) {
    const container = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-wrapper assistant';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <svg viewBox="0 0 64 64" width="24" height="24" fill="none">
                <path d="M32 8C20 8 12 16 12 28c0 8 4 14 10 18v4c0 2 1.5 3 3.5 3h13c2 0 3.5-1 3.5-3v-4c6-4 10-10 10-18 0-12-8-20-20-20z" fill="#ffffff"/>
                <circle cx="26" cy="24" r="3" fill="#0a0a0a"/>
                <circle cx="26" cy="24" r="1.5" fill="#ffffff"/>
            </svg>
        </div>
        <div class="message-content-wrapper">
            <div class="message-sender">OSAIA 🦜</div>
            <div class="message-bubble">${formatMessage(text)}</div>
            <div class="message-actions">
                <button class="message-action" title="Copiar" onclick="copyMessageContent(this)"><i class="ri-file-copy-line"></i></button>
                <button class="message-action" title="Escuchar" onclick="speakMessage(this)"><i class="ri-volume-up-line"></i></button>
                <button class="message-action" title="Regenerar" onclick="regenerateMessage()"><i class="ri-refresh-line"></i></button>
                <button class="message-action" title="Me gusta" onclick="likeMessage(this)"><i class="ri-thumb-up-line"></i></button>
            </div>
        </div>
    `;
    container.appendChild(messageDiv);
    scrollToBottom();
    
    chatState.messages.push({ role: 'assistant', content: text });
}

function addSystemMessage(text) {
    const container = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = 'text-align: center; margin: 1rem 0;';
    messageDiv.innerHTML = `<span style="background: rgba(255,255,255,0.06); border: 1px solid var(--border-medium); color: var(--text-secondary); padding: 0.4rem 1rem; border-radius: 50px; font-size: 0.82rem;">${text}</span>`;
    container.appendChild(messageDiv);
    scrollToBottom();
}

// ===== TYPING INDICATOR =====
function showTypingIndicator() {
    chatState.isTyping = true;
    const container = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message-wrapper assistant';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <svg viewBox="0 0 64 64" width="24" height="24" fill="none">
                <path d="M32 8C20 8 12 16 12 28c0 8 4 14 10 18v4c0 2 1.5 3 3.5 3h13c2 0 3.5-1 3.5-3v-4c6-4 10-10 10-18 0-12-8-20-20-20z" fill="#ffffff"/>
                <circle cx="26" cy="24" r="3" fill="#0a0a0a"/>
                <circle cx="26" cy="24" r="1.5" fill="#ffffff"/>
            </svg>
        </div>
        <div class="message-content-wrapper">
            <div class="message-sender">OSAIA 🦜</div>
            <div class="ai-typing">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    container.appendChild(typingDiv);
    scrollToBottom();
}

function hideTypingIndicator() {
    chatState.isTyping = false;
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

// ===== GENERAR RESPUESTA INTELIGENTE =====
function generateResponse(userMessage) {
    const msg = userMessage.toLowerCase().trim();
    
    // Según el modo actual
    switch (chatState.currentMode) {
        case 'code':
            return generateCodeResponse(msg);
        case 'translate':
            return generateTranslateResponse(msg);
        case 'writer':
            return generateWriterResponse(msg);
        case 'math':
            return generateMathResponse(msg);
        case 'analyst':
            return generateAnalystResponse(msg);
        case 'architect':
            return generateArchitectResponse(msg);
        default:
            return generateGeneralResponse(msg);
    }
}

function generateGeneralResponse(msg) {
    // Buscar patrones conocidos
    for (const [patron, respuestas] of Object.entries(patternResponses)) {
        if (msg.includes(patron)) {
            return respuestas[Math.floor(Math.random() * respuestas.length)];
        }
    }
    
    // Buscar en base de conocimientos
    if (msg.includes('qué es') || msg.includes('que es')) {
        if (msg.includes('inteligencia artificial') || msg.includes('ia')) {
            return knowledgeBase.queEsIa;
        }
        if (msg.includes('osaia')) {
            return knowledgeBase.queEsOsaia;
        }
        if (msg.includes('python')) {
            return knowledgeBase.python;
        }
        if (msg.includes('javascript')) {
            return knowledgeBase.javascript;
        }
    }
    
    if (msg.includes('cómo aprender') || msg.includes('como aprender') || msg.includes('aprender a programar')) {
        return knowledgeBase.comoAprenderProgramacion;
    }
    
    if (msg.includes('lenguaje') && (msg.includes('popular') || msg.includes('mejor'))) {
        return knowledgeBase.lenguajesPopulares;
    }
    
    if (msg.includes('consejo') || msg.includes('productividad') || msg.includes('productivo')) {
        return knowledgeBase.consejosProductividad;
    }
    
    // Saludos
    if (/^(hola|buen(os|as) (días|tardes|noches)|qué tal|que tal|saludos|hey|hi|hello)/.test(msg)) {
        return knowledgeBase.saludos[Math.floor(Math.random() * knowledgeBase.saludos.length)];
    }
    
    // Despedidas
    if (/(adiós|adios|hasta luego|nos vemos|bye|chau)/.test(msg)) {
        return knowledgeBase.despedidas[Math.floor(Math.random() * knowledgeBase.despedidas.length)];
    }
    
    // Agradecimientos
    if (/(gracias|muchas gracias|te agradezco|thank you|thanks)/.test(msg)) {
        return knowledgeBase.agradecimientos[Math.floor(Math.random() * knowledgeBase.agradecimientos.length)];
    }
    
    // Preguntas sobre OSAIA
    if (msg.includes('tu nombre') || msg.includes('quién eres') || msg.includes('quien eres') || msg.includes('qué eres') || msg.includes('que eres')) {
        return knowledgeBase.queEsOsaia;
    }
    
    if (msg.includes('qué puedes hacer') || msg.includes('que puedes hacer') || msg.includes('funciones') || msg.includes('capacidades')) {
        return patternResponses['que puedes hacer'][0];
    }
    
    // Matemáticas simples
    const mathResult = tryMathCalculation(msg);
    if (mathResult) {
        return mathResult;
    }
    
    // Respuesta por defecto inteligente
    return generateDefaultResponse(userMessage);
}

function generateDefaultResponse(userMessage) {
    const responses = [
        `¡Interesante pregunta sobre "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"! 🤔\n\nComo IA, puedo decirte que este tema tiene múltiples aspectos interesantes. ¿Podrías especificar qué aspecto te gustaría explorar más a fondo?\n\nPor ejemplo:\n• ¿Quieres una explicación detallada?\n• ¿Buscas ejemplos prácticos?\n• ¿Necesitas código relacionado?\n• ¿Te gustaría que lo resuma en puntos clave?\n\nCuéntame y profundizamos juntos. 🦜✨`,
        
        `Excelente tema a explorar. 📚\n\nPara poder ayudarte mejor, ¿te importaría darme un poco más de contexto? Me gustaría entender:\n\n1️⃣ ¿Cuál es tu nivel de conocimiento actual sobre el tema?\n2️⃣ ¿Qué es lo que específicamente necesitas lograr?\n3️⃣ ¿Prefieres una explicación teórica o ejemplos prácticos?\n\nMientras tanto, te recomiendo explorar los módulos especializados de OSAIA:\n• 💻 **Generador de Código** para implementaciones\n• 📊 **Analista** para procesar información\n• 🎨 **Imágenes** para crear visuales\n\n¡Cuéntame más! 🚀`,
        
        `¡Buena pregunta! 🌟\n\nAunque puedo darte información general, mis módulos especializados podrían servirte mejor:\n\n💬 **Modo Programador**: Si necesitas código o explicaciones técnicas\n🌐 **Modo Traductor**: Si el tema involucra idiomas\n📝 **Modo Redactor**: Si necesitas redactar algo sobre el tema\n🔢 **Modo Matemáticas**: Si hay cálculos involucrados\n\n¿Te gustaría que cambie a alguno de estos modos para asistirte mejor? 🦜`,
        
        `Gracias por tu pregunta. �\n\nComo asistente de IA versátil, puedo abordar esto desde varios ángulos. ¿Qué prefieres?\n\n📖 **Explicación detallada** - Profundizo en el concepto\n📋 **Resumen estructurado** - Puntos clave organizados\n💡 **Ejemplos prácticos** - Casos de uso reales\n🔗 **Relaciones** - Cómo se conecta con otros temas\n\n¡Dime y vamos por allá! ✨`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

function generateCodeResponse(msg) {
    if (msg.includes('python') || msg.includes('python')) {
        return `🐍 **Excelente elección - Python**\n\nClaro que puedo ayudarte con Python. Cuéntame:\n\n• ¿Qué tipo de aplicación necesitas?\n• ¿Cuál es tu nivel actual?\n• ¿Tienes algún código existente?\n\nMientras tanto, aquí tienes una estructura profesional:\n\n\`\`\`python
# Estructura profesional Python
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Entidad:
    """Clase base de datos"""
    id: int
    nombre: str
    activo: bool = True

class Gestor:
    """Gestor principal"""
    def __init__(self):
        self._entidades: List[Entidad] = []
    
    def agregar(self, entidad: Entidad) -> None:
        self._entidades.append(entidad)
    
    def buscar(self, id: int) -> Optional[Entidad]:
        return next((e for e in self._entidades if e.id == id), None)
\`\`\`\n\nPara generar código completo y personalizado, usa el **módulo de Generación de Código** en la navegación superior. 💻✨`;
    }
    
    if (msg.includes('javascript') || msg.includes('js')) {
        return `⚡ **JavaScript - El lenguaje de la web**\n\nPerfecto. JavaScript es el lenguaje más versátil hoy en día. ¿Qué necesitas?\n\n• Frontend (React, Vue, Angular)\n• Backend (Node.js, Express)\n• Full-Stack\n• Scripts y automatización\n\nTe recomiendo ir al **Generador de Código** de OSAIA donde puedes crear código completo con plantillas profesionales listas para producción. 🚀`;
    }
    
    return `💻 **Modo Programador Activado**\n\nPuedo ayudarte con:\n\n📚 **Conceptos**: Explicar POO, patrones de diseño, algoritmos\n🔧 **Lenguajes**: Python, JS/TS, Java, C++, C#, Go, PHP, SQL, Rust, Swift, Kotlin\n⚙️ **Arquitectura**: Microservicios, MVC, Clean Architecture, DDD\n🐛 **Debugging**: Análisis de errores y optimización\n📋 **Code Review**: Revisión y mejora de código existente\n\n💡 **Tip**: Para código completo y listo para usar, ve al **Generador de Código** de OSAIA en el menú superior. Allí puedes especificar lenguaje, complejidad y obtener plantillas profesionales. 🦜✨`;
}

function generateTranslateResponse(msg) {
    // Detectar patrones de traducción
    const patterns = [
        /traduce(?:r)?\s+(?:al\s+)?(\w+)(?:\s*:)?\s*["']?(.+?)["']?$/i,
        /traduce(?:r)?\s+["'](.+?)["']?\s+al\s+(\w+)/i,
        /cómo\s+se\s+dice\s+["']?(.+?)["']?\s+en\s+(\w+)/i
    ];
    
    for (const pattern of patterns) {
        const match = msg.match(pattern);
        if (match) {
            let idioma, texto;
            if (match.length === 3 && match[1].length < 15) {
                idioma = match[1].toLowerCase();
                texto = match[2];
            } else if (match.length === 3) {
                texto = match[1];
                idioma = match[2].toLowerCase();
            }
            
            if (idioma && texto) {
                return translateText(texto, idioma);
            }
        }
    }
    
    return `🌐 **Modo Traductor Activado** 📚\n\nPuedo traducir entre múltiples idiomas. Para traducir, dime:\n\n**Opción 1**: "Traduce al inglés: Hola mundo"\n**Opción 2**: "Traduce 'Buenos días' al francés"\n**Opción 3**: "¿Cómo se dice 'gracias' en alemán?"\n\nIdiomas disponibles: 🇪🇸 Español, 🇺🇸 Inglés, 🇫🇷 Francés, 🇩🇪 Alemán, 🇮🇹 Italiano, 🇵🇹 Portugués, 🇯🇵 Japonés, 🇨🇳 Chino, 🇰🇷 Coreano, 🇷🇺 Ruso, 🇸🇦 Árabe y más.\n\n¡Dime qué quieres traducir! ✨`;
}

function translateText(texto, idiomaDestino) {
    const traducciones = {
        'hola mundo': {
            'inglés': 'Hello world',
            'english': 'Hello world',
            'en': 'Hello world',
            'francés': 'Bonjour le monde',
            'french': 'Bonjour le monde',
            'fr': 'Bonjour le monde',
            'alemán': 'Hallo Welt',
            'german': 'Hallo Welt',
            'de': 'Hallo Welt',
            'italiano': 'Ciao mondo',
            'italian': 'Ciao mondo',
            'it': 'Ciao mondo',
            'portugués': 'Olá mundo',
            'portuguese': 'Olá mundo',
            'pt': 'Olá mundo',
            'japonés': 'こんにちは世界',
            'japanese': 'こんにちは世界',
            'ja': 'こんにちは世界',
            'chino': '你好，世界',
            'chinese': '你好，世界',
            'zh': '你好，世界',
            'coreano': '안녕하세요 세계',
            'korean': '안녕하세요 세계',
            'ko': '안녕하세요 세계',
            'ruso': 'Привет мир',
            'russian': 'Привет мир',
            'ru': 'Привет мир'
        },
        'buenos días': {
            'inglés': 'Good morning',
            'francés': 'Bonjour',
            'alemán': 'Guten Morgen',
            'italiano': 'Buongiorno',
            'portugués': 'Bom dia',
            'japonés': 'おはようございます',
            'chino': '早上好'
        },
        'gracias': {
            'inglés': 'Thank you',
            'francés': 'Merci',
            'alemán': 'Danke',
            'italiano': 'Grazie',
            'portugués': 'Obrigado/a',
            'japonés': 'ありがとうございます',
            'chino': '谢谢',
            'coreano': '감사합니다',
            'ruso': 'Спасибо'
        },
        'adiós': {
            'inglés': 'Goodbye',
            'francés': 'Au revoir',
            'alemán': 'Auf Wiedersehen',
            'italiano': 'Arrivederci',
            'portugués': 'Adeus',
            'japonés': 'さようなら',
            'chino': '再见'
        }
    };
    
    const textoKey = texto.toLowerCase().trim();
    
    if (traducciones[textoKey] && traducciones[textoKey][idiomaDestino]) {
        return `🌐 **Traducción:**\n\n📝 Original: "${texto}"\n🎯 Idioma: ${idiomaDestino}\n✅ Resultado: **${traducciones[textoKey][idiomaDestino]}**\n\n---\n💡 ¿Quieres que traduzca algo más?`;
    }
    
    // Traducción simulada para textos no en base de datos
    return `🌐 **Traducción simulada**\n\n📝 Original: "${texto}"\n🎯 Idioma destino: ${idiomaDestino}\n\n✅ *En una implementación completa con API de traducción, aquí verías el texto traducido.*\n\n💡 OSAIA puede integrarse con servicios como:\n• Google Translate API\n• DeepL API\n• Microsoft Translator\n• AWS Translate\n\nPara una demostración, usa frases comunes como "hola mundo", "gracias" o "buenos días".`;
}

function generateWriterResponse(msg) {
    if (msg.includes('correo') || msg.includes('email')) {
        return `📝 **Redacción de Correo Electrónico** ✉️\n\nAquí tienes una plantilla profesional:\n\n---\n**Asunto**: [Asunto claro y específico]\n\nEstimado/a [Nombre]:\n\nEspero que este mensaje le encuentre bien. Me dirijo a usted para [objetivo principal del correo].\n\n**Contexto:**\n[Breve párrafo explicando el contexto]\n\n**Detalles importantes:**\n• Punto clave 1\n• Punto clave 2\n• Punto clave 3\n\n**Solicitud / Próximos pasos:**\n[Indique qué necesita del destinatario]\n\nQuedo atento/a a su respuesta. No dude en contactarme si requiere información adicional.\n\nAtentamente,\n[Su nombre]\n[Su cargo]\n[Contacto]\n---\n\n¿Quieres que adapte esto a un contexto específico? (ventas, seguimiento, agradecimiento, solicitud, etc.) 📧✨`;
    }
    
    if (msg.includes('ensayo') || msg.includes('artículo') || msg.includes('articulo')) {
        return `📝 **Estructura de Ensayo / Artículo Profesional** 📚\n\n**Título**: [Título atractivo y descriptivo]\n\n**Introducción (≈10% del texto)**\n• Gancho: Frase que capte la atención\n• Contexto: Breve antecedente del tema\n• Tesis: Tu postura o argumento principal\n• Hoja de ruta: Qué cubrirá el texto\n\n**Desarrollo (≈70% del texto)**\n\n*Párrafo 1 - Argumento principal*\n• Idea principal\n• Evidencia o ejemplo\n• Análisis y conexión con la tesis\n\n*Párrafo 2 - Argumento secundario*\n• Idea complementaria\n• Datos o citas de apoyo\n• Explicación detallada\n\n*Párrafo 3 - Contraargumento y refutación*\n• Presentar visión opuesta\n• Refutar con lógica y evidencia\n• Reforzar tu postura\n\n**Conclusión (≈20% del texto)**\n• Reafirmar tesis (sin repetir literalmente)\n• Sintetizar puntos clave\n• Cierre memorable / Llamado a la acción\n\n---\n\n¿Sobre qué tema te gustaría que desarrolle el ensayo? 📝✨`;
    }
    
    return `📝 **Modo Redactor Profesional Activado** ✍️\n\nPuedo ayudarte a crear:\n\n📧 **Correos electrónicos** - Ventas, seguimiento, agradecimiento, formales\n📰 **Artículos y ensayos** - Estructura profesional, tesis, argumentos\n📄 **Documentos empresariales** - Informes, propuestas, memos\n📱 **Contenido para redes** - Posts, captions, hashtags\n📋 **Resúmenes y síntesis** - De textos largos a puntos clave\n💡 **Ideas creativas** - Lluvia de ideas para cualquier tema\n📝 **Cartas y comunicaciones** - Formales e informales\n\n¿Qué te gustaría redactar hoy? Cuéntame el contexto, el tono deseado y el objetivo. 🦜✨`;
}

function generateMathResponse(msg) {
    // Intentar resolver cálculos
    const calculo = tryMathCalculation(msg);
    if (calculo) {
        return `🔢 **Modo Matemáticas** 🧮\n\n${calculo}`;
    }
    
    if (msg.includes('ecuación') || msg.includes('resuelve') || msg.includes('x =') || msg.includes('x=')) {
        return `🔢 **Resolución de Ecuaciones** 📐\n\nVeo que necesitas resolver una ecuación. El método general:\n\n**Ejemplo: 2x + 5 = 15**\n\nPaso 1️⃣: Agrupar términos semejantes\n2x = 15 - 5\n\nPaso 2️⃣: Simplificar\n2x = 10\n\nPaso 3️⃣: Despejar x\nx = 10 / 2\n\nPaso 4️⃣: Solución\n**x = 5** ✅\n\nPaso 5️⃣: Verificación\n2(5) + 5 = 10 + 5 = 15 ✓\n\n---\n\n¿Cuál es tu ecuación específica? Puedo resolver:\n• Lineales: ax + b = c\n• Cuadráticas: ax² + bx + c = 0\n• Sistemas de ecuaciones\n• Derivadas e integrales básicas\n\n¡Dime cuál necesitas resolver! 🎯`;
    }
    
    return `🔢 **Modo Matemáticas Activado** 🧮\n\nPuedo ayudarte con:\n\n➕ **Aritmética básica** - Operaciones, porcentajes, proporciones\n📐 **Álgebra** - Ecuaciones, sistemas, polinomios, factorización\n📊 **Estadística** - Promedio, mediana, moda, desviación estándar\n📈 **Cálculo** - Derivadas, integrales, límites\n📐 **Geometría** - Áreas, volúmenes, teorema de Pitágoras\n🔢 **Trigonometría** - Seno, coseno, tangente, identidades\n🎲 **Probabilidad** - Eventos, combinaciones, permutaciones\n\n💡 **Tip**: Simplemente escribe la operación o problema. Por ejemplo:\n• "Cuánto es 15% de 250"\n• "Resuelve 3x + 7 = 22"\n• "La hipotenusa de un triángulo con catetos 3 y 4"\n\n¡Adelante! 🧮✨`;
}

function generateAnalystResponse(msg) {
    return `📊 **Modo Analista de Datos Activado** 📈\n\nComo analista, puedo ayudarte a:\n\n📋 **Estructurar información** - Organizar datos en categorías\n🔍 **Identificar patrones** - Encontrar tendencias y anomalías\n📊 **Visualización sugerida** - Qué gráfico usar según los datos\n💡 **Extraer insights** - Conclusiones accionables\n📝 **Generar informes** - Resúmenes ejecutivos\n🔢 **Cálculos estadísticos** - Métricas clave\n\n**Ejemplo de análisis:**\n\n*Datos de ventas mensuales:*\nEne: $10K, Feb: $12K, Mar: $15K, Abr: $14K, May: $18K, Jun: $22K\n\n**Análisis OSAIA:**\n📈 **Tendencia**: Crecimiento positivo sostenido\n📊 **Crecimiento promedio**: ~17% mensual\n🎯 **Mejor mes**: Junio ($22K)\n💡 **Insight**: Tendencia alcista fuerte, recomienda invertir en marketing\n📉 **Punto de atención**: Crecimiento se desaceleró en abril\n\n---\n\n¿Qué datos te gustaría analizar? Puedes describírmelos o pegarlos directamente. 🦜📊`;
}

// ===== CÁLCULO MATEMÁTICO =====
function tryMathCalculation(msg) {
    // Porcentajes
    const porcentaje = msg.match(/cuánto es\s+(\d+(?:\.\d+)?)\s*%\s*de\s+(\d+(?:\.\d+)?)/i);
    if (porcentaje) {
        const pct = parseFloat(porcentaje[1]);
        const total = parseFloat(porcentaje[2]);
        const resultado = (pct / 100) * total;
        return `🧮 **Cálculo de Porcentaje**\n\n📊 Pregunta: ¿Cuánto es el ${pct}% de ${total}?\n\n📝 Fórmula: (${pct} / 100) × ${total}\n🔢 Operación: ${pct / 100} × ${total}\n✅ **Resultado: ${resultado.toFixed(2)}**\n\n---\n💡 Regla rápida: Para calcular porcentajes mentalmente:\n• 10% = dividir entre 10\n• 50% = dividir entre 2\n• 25% = dividir entre 4\n• 1% = dividir entre 100`;
    }
    
    // Operaciones simples
    const operacion = msg.match(/(\d+(?:\.\d+)?)\s*([+\-×*/÷])\s*(\d+(?:\.\d+)?)/);
    if (operacion) {
        const a = parseFloat(operacion[1]);
        const op = operacion[2];
        const b = parseFloat(operacion[3]);
        let resultado, simbolo;
        
        switch(op) {
            case '+': resultado = a + b; simbolo = '+'; break;
            case '-': resultado = a - b; simbolo = '−'; break;
            case '×': case '*': resultado = a * b; simbolo = '×'; break;
            case '/': case '÷': 
                if (b === 0) return '⚠️ **Error matemático**: No se puede dividir entre cero';
                resultado = a / b; simbolo = '÷'; 
                break;
        }
        
        return `🧮 **Resultado del Cálculo**\n\n📝 Operación: ${a} ${simbolo} ${b}\n✅ **Resultado: ${resultado.toFixed(4).replace(/\.?0+$/, '')}**\n\n---\n¿Quieres que explique el procedimiento paso a paso? 📚`;
    }
    
    return null;
}

// ===== UTILIDADES DE CHAT =====
function formatMessage(text) {
    // Convertir **texto** a negrita
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Convertir *texto* a cursiva
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Convertir `código` a inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convertir bloques de código ```...```
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
    
    // Convertir saltos de línea
    text = text.replace(/\n/g, '<br>');
    
    // Convertir emojis de texto
    const emojis = {
        ':smile:': '😊', ':happy:': '😄', ':sad:': '😢',
        ':heart:': '❤️', ':star:': '⭐', ':check:': '✅',
        ':warning:': '⚠️', ':error:': '❌', ':fire:': '🔥'
    };
    
    for (const [key, value] of Object.entries(emojis)) {
        text = text.replace(new RegExp(key, 'g'), value);
    }
    
    return text;
}

function scrollToBottom() {
    const container = document.getElementById('chatMessages');
    container.scrollTop = container.scrollHeight;
}

function handleChatKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
}

function useHint(text) {
    document.getElementById('chatInput').value = text;
    document.getElementById('chatInput').focus();
    autoResizeTextarea(document.getElementById('chatInput'));
}

function newChat() {
    if (chatState.messages.length > 2) {
        // Guardar en historial
        chatState.history.push([...chatState.messages]);
        updateChatHistoryUI();
    }
    
    chatState.messages = [];
    document.getElementById('chatMessages').innerHTML = '';
    
    addAIMessage(
        `¡Hola! Soy **OSAIA** 🦜✨, tu inteligencia artificial asistente.\n\n` +
        `Estoy lista para ayudarte con lo que necesites. Actualmente estoy en modo **${chatModes[chatState.currentMode].name}**.\n\n` +
        `¿En qué puedo colaborar contigo hoy? 🚀`
    );
    
    showNotification('💬 Nueva conversación iniciada');
}

function updateChatHistoryUI() {
    const historyContainer = document.getElementById('chatHistory');
    historyContainer.innerHTML = '';
    
    chatState.history.forEach((chat, index) => {
        const firstMessage = chat.find(m => m.role === 'user');
        const title = firstMessage ? firstMessage.content.substring(0, 30) + '...' : `Chat ${index + 1}`;
        
        const item = document.createElement('div');
        item.className = 'chat-history-item';
        item.innerHTML = `<i class="ri-message-3-line" style="margin-right:6px;"></i>${title}`;
        item.onclick = () => loadChat(index);
        historyContainer.appendChild(item);
    });
}

function loadChat(index) {
    const chat = chatState.history[index];
    if (!chat) return;
    
    document.getElementById('chatMessages').innerHTML = '';
    chatState.messages = [];
    
    chat.forEach(msg => {
        if (msg.role === 'user') {
            addUserMessage(msg.content);
        } else {
            addAIMessage(msg.content);
        }
    });
    
    showNotification(`📜 Chat cargado`);
}

function clearChat() {
    if (confirm('¿Estás seguro de que deseas limpiar la conversación?')) {
        document.getElementById('chatMessages').innerHTML = '';
        chatState.messages = [];
        
        addAIMessage(
            `¡Conversación limpiada! 🧹✨\n\nSoy **OSAIA** 🦜. ¿En qué puedo ayudarte ahora?`
        );
    }
}

function exportChat() {
    if (chatState.messages.length === 0) {
        showNotification('⚠️ No hay mensajes para exportar', 'warning');
        return;
    }
    
    let contenido = `# Conversación con OSAIA\n`;
    contenido += `Fecha: ${new Date().toLocaleString('es-ES')}\n\n`;
    contenido += `Modo: ${chatModes[chatState.currentMode].name}\n\n`;
    contenido += `---\n\n`;
    
    chatState.messages.forEach(msg => {
        const autor = msg.role === 'user' ? 'Tú' : 'OSAIA 🦜';
        contenido += `**${autor}:**\n${msg.content}\n\n`;
    });
    
    downloadFile(contenido, `conversacion_osaia_${Date.now()}.md`, 'text/markdown');
    showNotification('💾 Conversación exportada exitosamente', 'success');
}

// ===== ACCIONES EN MENSAJES =====
function copyMessageContent(button) {
    const bubble = button.closest('.message-content-wrapper').querySelector('.message-bubble');
    const text = bubble.innerText;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('📋 Mensaje copiado', 'success');
    });
}

function deleteMessage(button) {
    button.closest('.message-wrapper').remove();
}

function speakMessage(button) {
    const bubble = button.closest('.message-content-wrapper').querySelector('.message-bubble');
    const text = bubble.innerText;
    speakTextFromChat(text);
}

function regenerateMessage() {
    showNotification('🔄 Regenerando respuesta...');
    // En una implementación real, generaría una nueva respuesta
}

function likeMessage(button) {
    button.classList.toggle('liked');
    button.style.color = button.classList.contains('liked') ? '#ff6b9d' : '';
    if (button.classList.contains('liked')) {
        showNotification('❤️ ¡Gracias por tu feedback!', 'success');
    }
}

// ===== VOZ EN CHAT =====
function toggleVoice() {
    chatState.voiceEnabled = !chatState.voiceEnabled;
    const icon = document.getElementById('voiceIcon');
    icon.className = chatState.voiceEnabled ? 'ri-volume-up-fill' : 'ri-volume-up-line';
    icon.style.color = chatState.voiceEnabled ? 'var(--accent-success)' : '';
    
    showNotification(chatState.voiceEnabled ? '🔊 Voz activada' : '🔇 Voz desactivada');
}

function speakTextFromChat(text) {
    if (!('speechSynthesis' in window)) {
        showNotification('⚠️ Tu navegador no soporta síntesis de voz', 'warning');
        return;
    }
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1;
    utterance.pitch = 1;
    
    const voces = window.speechSynthesis.getVoices();
    const vozEspañol = voces.find(v => v.lang.startsWith('es'));
    if (vozEspañol) utterance.voice = vozEspañol;
    
    window.speechSynthesis.speak(utterance);
}

// ===== INSERTAR EMOJI =====
function insertEmoji() {
    const emojis = ['😊', '🚀', '💻', '✨', '🦜', '📚', '🎯', '💡', '🔥', '⭐'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const input = document.getElementById('chatInput');
    input.value += emoji;
    input.focus();
}

// ===== MODO ARQUITECTO IA =====
function generateArchitectResponse(msg) {
    // Detectar temas técnicos específicos
    if (msg.includes('python')) {
        return knowledgeBase.python;
    }
    
    if (msg.includes('c++') || msg.includes('cpp') || msg.includes('c mas')) {
        return knowledgeBase.cpp;
    }
    
    if (msg.includes('cuda')) {
        return knowledgeBase.cuda;
    }
    
    if (msg.includes('glsl') || msg.includes('hlsl') || msg.includes('shader') || msg.includes('sombreador')) {
        return knowledgeBase.glsl;
    }
    
    if (msg.includes('pytorch') || msg.includes('torch')) {
        return knowledgeBase.pytorch;
    }
    
    if (msg.includes('tensorflow') || msg.includes('keras') || msg.includes('tf ')) {
        return knowledgeBase.tensorflow;
    }
    
    if (msg.includes('ffmpeg') || msg.includes('libav') || msg.includes('codec') || msg.includes('h.264') || msg.includes('h264') || msg.includes('h.265') || msg.includes('video')) {
        return knowledgeBase.ffmpeg;
    }
    
    if (msg.includes('difusión') || msg.includes('diffusion') || msg.includes('denoising') || msg.includes('ruido') || msg.includes('unet') || msg.includes('vae')) {
        return knowledgeBase.diffusion;
    }
    
    if (msg.includes('pipeline') || msg.includes('flujo') || msg.includes('arquitectura') || msg.includes('cómo funciona') || msg.includes('como funciona') || msg.includes('stack') || msg.includes('tecnología') || msg.includes('tecnologico')) {
        return patternResponses['cómo funciona'][0];
    }
    
    if (msg.includes('gpu') || msg.includes('tarjeta gráfica') || msg.includes('nvidia') || msg.includes('vram')) {
        return `🎮 **GPU y Aceleración Hardware en OSAIA** 🔬\n\n**¿Por qué la GPU es esencial para la IA generativa?**\n\n**CPU vs GPU:**\n• **CPU**: ~8-32 núcleos, optimizados para tareas secuenciales complejas\n• **GPU**: ~10,000-16,000 núcleos CUDA, optimizados para paralelismo masivo simple\n\n**Operaciones ideales para GPU:**\n• Multiplicaciones de matrices grandes (esencial en Transformers)\n• Convoluciones 2D (visión por computadora)\n• Procesamiento de píxeles independientes\n• Operaciones vectoriales por elemento\n\n**Memoria VRAM — El recurso crítico:**\n• **4-6 GB**: Modelos pequeños, SD 1.5 con optimizaciones\n• **8-12 GB**: SDXL, resoluciones medias\n• **16-24 GB**: SDXL + ControlNet, alta resolución\n• **48-80 GB**: Modelos grandes (Flux, SDXL Turbo), entrenamiento\n\n**Técnicas para ahorrar VRAM:**\n• **FP16/BF16**: Mitad de precisión, casi misma calidad\n• **Gradient Checkpointing**: Recomputar en backward\n• **LoRA**: Fine-tune solo adaptadores pequeños\n• **VAE Slicing/Tiling**: Procesar en trozos\n\n**Ejemplo de velocidad:**\n• CPU: ~10-30 segundos POR paso de difusión\n• GPU RTX 3090: ~0.2-0.5 segundos POR paso\n• **Aceleración: 50-100×** 🚀\n\nSin CUDA y GPU, la IA generativa moderna sería imposible en tiempos prácticos.`;
    }
    
    // Respuesta por defecto del modo Arquitecto
    return `🔬 **Modo Arquitecto IA Activado** 🦜⚙️\n\nSoy OSAIA en modo **Arquitecto Técnico**. Puedo explicarte con profundidad cada capa del stack de IA generativa:\n\n**🐍 Capa 1 — Python**\nOrquestación, tokenización CLIP, schedulers, manejo de memoria\n\n**⚡ Capa 2 — C++**\nBackend de alto rendimiento, procesamiento de frames, motores 3D\n\n**🎮 Capa 3 — CUDA**\nProgramación GPU, kernels paralelos, cuDNN, cuBLAS\n\n**🎨 Capa 4 — GLSL / HLSL**\nShaders, post-procesamiento, upscaling neural, efectos visuales\n\n**🔥 Capa 5 — PyTorch**\nUNet, VAE, modelos de difusión, entrenamiento e inferencia\n\n**🧠 Capa 6 — TensorFlow**\nDespliegue producción, TPU, optimización empresarial\n\n**🎬 Capa 7 — FFmpeg**\nCodificación H.264/H.265, contenedores MP4, compresión\n\n**¿Qué quieres explorar?**\n• Pregúntame por una tecnología específica\n• Pide que explique el pipeline completo\n• Consulta sobre requisitos hardware\n• Profundiza en el proceso de difusión\n\n¡Adelante! 🔬✨`;
}
