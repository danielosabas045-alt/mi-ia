/* ============================================================
   OSAIA - Generador de Código Multi-Lenguaje
   ============================================================ */

// Estado actual del generador
let currentLanguage = 'python';
let currentComplexity = 'standard';
let currentComments = 'yes';

// Plantillas de código por lenguaje y tipo de solicitud
const codeGenerator = {
    python: {
        extension: 'py',
        icon: '🐍',
        templates: {
            email_validator: codeTemplates.python.email_validator,
            calculadora: codeTemplates.python.calculadora,
            fibonacci: codeTemplates.python.fibonacci,
            default: generateDefaultPython
        }
    },
    javascript: {
        extension: 'js',
        icon: '⚡',
        templates: {
            email_validator: codeTemplates.javascript.email_validator,
            api_rest: codeTemplates.javascript.api_rest,
            default: generateDefaultJavaScript
        }
    },
    typescript: {
        extension: 'ts',
        icon: '📘',
        templates: {
            default: generateDefaultTypeScript
        }
    },
    java: {
        extension: 'java',
        icon: '☕',
        templates: {
            default: generateDefaultJava
        }
    },
    cpp: {
        extension: 'cpp',
        icon: '⚡',
        templates: {
            default: generateDefaultCpp
        }
    },
    cuda: {
        extension: 'cu',
        icon: '🎮',
        templates: {
            default: generateCUDAKernel
        }
    },
    glsl: {
        extension: 'glsl',
        icon: '🎨',
        templates: {
            default: generateGLSLShader
        }
    },
    pytorch: {
        extension: 'py',
        icon: '🔥',
        templates: {
            default: generatePyTorchModel
        }
    },
    rust: {
        extension: 'rs',
        icon: '🦀',
        templates: {
            default: generateDefaultRust
        }
    },
    csharp: {
        extension: 'cs',
        icon: '🟣',
        templates: {
            default: generateDefaultCSharp
        }
    },
    php: {
        extension: 'php',
        icon: '🐘',
        templates: {
            default: generateDefaultPHP
        }
    },
    go: {
        extension: 'go',
        icon: '🔵',
        templates: {
            default: generateDefaultGo
        }
    },
    sql: {
        extension: 'sql',
        icon: '🗄️',
        templates: {
            default: generateDefaultSQL
        }
    }
};

// ===== SELECCIÓN DE LENGUAJE =====
function selectLanguage(element, lang) {
    document.querySelectorAll('.lang-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    currentLanguage = lang;
    document.getElementById('codeLangLabel').textContent = getLanguageName(lang);
    showNotification(`🎯 Lenguaje seleccionado: ${getLanguageName(lang)}`);
}

function getLanguageName(lang) {
    const names = {
        python: 'Python',
        javascript: 'JavaScript',
        typescript: 'TypeScript',
        java: 'Java',
        cpp: 'C++',
        csharp: 'C#',
        php: 'PHP',
        go: 'Go',
        sql: 'SQL'
    };
    return names[lang] || lang;
}

// ===== GENERAR CÓDIGO =====
function generateCode() {
    const prompt = document.getElementById('codePrompt').value.trim();
    currentComplexity = document.getElementById('codeComplexity').value;
    currentComments = document.getElementById('codeComments').value;
    
    if (!prompt) {
        showNotification('⚠️ Por favor describe qué código quieres generar', 'warning');
        return;
    }
    
    // Mostrar indicador de carga
    const codeOutput = document.getElementById('codeOutput');
    codeOutput.innerHTML = '<code style="color: var(--accent-primary);">⏳ OSAIA está generando tu código...</code>';
    
    // Simular tiempo de generación
    setTimeout(() => {
        const code = generateCodeByLanguage(currentLanguage, prompt);
        codeOutput.innerHTML = `<code>${escapeHtml(code)}</code>`;
        
        // Efecto de máquina de escribir
        typeWriterEffect(codeOutput.querySelector('code'), code);
        
        showNotification(`✅ Código en ${getLanguageName(currentLanguage)} generado exitosamente`, 'success');
        triggerConfetti();
        
        // Actualizar estadísticas
        updateStat('statCodes', 1);
        
    }, 1200);
}

function generateCodeByLanguage(lang, prompt) {
    const generator = codeGenerator[lang];
    if (!generator) return generateFallbackCode(lang, prompt);
    
    // Detectar tipo de solicitud
    const promptLower = prompt.toLowerCase();
    let templateKey = 'default';
    
    if (promptLower.includes('correo') || promptLower.includes('email') || promptLower.includes('e-mail')) {
        templateKey = 'email_validator';
    } else if (promptLower.includes('calculadora') || promptLower.includes('calcula')) {
        templateKey = 'calculadora';
    } else if (promptLower.includes('fibonacci')) {
        templateKey = 'fibonacci';
    } else if (promptLower.includes('api') || promptLower.includes('rest') || promptLower.includes('express')) {
        templateKey = 'api_rest';
    }
    
    const template = generator.templates[templateKey] || generator.templates.default;
    
    if (typeof template === 'function') {
        return template(prompt);
    }
    
    return template;
}

// ===== GENERADORES POR DEFECTO =====
function generateDefaultPython(prompt) {
    return `# ============================================================
# Código Python generado por OSAIA 🦜
# Solicitud: ${prompt}
# Complejidad: ${currentComplexity}
# ============================================================

"""
Módulo principal: ${prompt}

Este módulo implementa la funcionalidad solicitada
siguiendo las mejores prácticas de Python (PEP 8).
"""

from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from abc import ABC, abstractmethod


@dataclass
class Resultado:
    """Clase de datos para encapsular resultados."""
    exitoso: bool
    datos: Any
    mensaje: str = ""


class BaseProcesador(ABC):
    """Clase base abstracta que define la interfaz."""
    
    @abstractmethod
    def procesar(self, datos: Any) -> Resultado:
        """Método principal que debe implementarse."""
        pass
    
    def validar_entrada(self, datos: Any) -> bool:
        """Valida que los datos de entrada sean correctos."""
        return datos is not None


class ProcesadorDatos(BaseProcesador):
    """
    Procesador concreto que implementa la lógica principal.
    
    Características:
    - Validación robusta de entradas
    - Manejo de errores con excepciones personalizadas
    - Logging de operaciones
    """
    
    def __init__(self, configuracion: Optional[Dict] = None):
        self.configuracion = configuracion or {}
        self._historial: List[Resultado] = []
    
    def procesar(self, datos: Any) -> Resultado:
        """
        Procesa los datos según la lógica definida.
        
        Args:
            datos: Entrada a procesar
            
        Returns:
            Resultado con el estado de la operación
        """
        if not self.validar_entrada(datos):
            return Resultado(
                exitoso=False,
                datos=None,
                mensaje="Datos de entrada inválidos"
            )
        
        try:
            # Lógica principal
            resultado_procesado = self._transformar(datos)
            
            resultado = Resultado(
                exitoso=True,
                datos=resultado_procesado,
                mensaje="Procesamiento exitoso"
            )
            
            self._historial.append(resultado)
            return resultado
            
        except Exception as e:
            return Resultado(
                exitoso=False,
                datos=None,
                mensaje=f"Error durante el procesamiento: {str(e)}"
            )
    
    def _transformar(self, datos: Any) -> Any:
        """
        Método privado con la lógica de transformación.
        Personaliza esta lógica según tus necesidades.
        """
        if isinstance(datos, (list, tuple)):
            return [self._procesar_elemento(item) for item in datos]
        elif isinstance(datos, dict):
            return {k: self._procesar_elemento(v) for k, v in datos.items()}
        else:
            return self._procesar_elemento(datos)
    
    def _procesar_elemento(self, elemento: Any) -> Any:
        """Procesa un elemento individual."""
        if isinstance(elemento, str):
            return elemento.strip().upper()
        elif isinstance(elemento, (int, float)):
            return round(elemento * 1.0, 2)
        return elemento
    
    def obtener_historial(self) -> List[Resultado]:
        """Retorna el historial de operaciones."""
        return self._historial.copy()


def main():
    """Función principal de demostración."""
    print("=" * 60)
    print("🐍 OSAIA - Código Python Generado")
    print("=" * 60)
    
    # Crear instancia del procesador
    procesador = ProcesadorDatos({"modo": "estricto"})
    
    # Ejemplo 1: Procesar lista
    print("\\n📋 Ejemplo 1: Procesar lista")
    datos_lista = ["  hola mundo  ", "python", 42, 3.14159]
    resultado1 = procesador.procesar(datos_lista)
    print(f"Entrada: {datos_lista}")
    print(f"Salida:  {resultado1.datos}")
    print(f"Estado:  {'✅ Éxito' if resultado1.exitoso else '❌ Error'}")
    
    # Ejemplo 2: Procesar diccionario
    print("\\n📊 Ejemplo 2: Procesar diccionario")
    datos_dict = {"nombre": "  ana  ", "valor": 123.456, "activo": True}
    resultado2 = procesador.procesar(datos_dict)
    print(f"Entrada: {datos_dict}")
    print(f"Salida:  {resultado2.datos}")
    
    # Ejemplo 3: Datos inválidos
    print("\\n⚠️  Ejemplo 3: Datos inválidos")
    resultado3 = procesador.procesar(None)
    print(f"Mensaje: {resultado3.mensaje}")
    
    # Mostrar historial
    print(f"\\n📜 Total operaciones: {len(procesador.obtener_historial())}")
    print("=" * 60)


if __name__ == "__main__":
    main()
`;
}

function generateDefaultJavaScript(prompt) {
    return `// ============================================================
// Código JavaScript generado por OSAIA 🦜
// Solicitud: ${prompt}
// Complejidad: ${currentComplexity}
// ============================================================

/**
 * Módulo principal: ${prompt}
 * Implementación siguiendo ES6+ y mejores prácticas modernas
 */

'use strict';

/**
 * Clase principal que gestiona la lógica de la aplicación
 */
class GestorPrincipal {
    /**
     * Constructor del gestor
     * @param {Object} configuracion - Opciones de configuración
     */
    constructor(configuracion = {}) {
        this.config = {
            modo: 'estandar',
            debug: false,
            maxIntentos: 3,
            tiempoEspera: 1000,
            ...configuracion
        };
        
        this._estado = {
            inicializado: false,
            contador: 0,
            historial: []
        };
        
        this._eventListeners = new Map();
    }
    
    /**
     * Inicializa el gestor
     * @returns {Promise<boolean>} Estado de inicialización
     */
    async inicializar() {
        try {
            this._log('Iniciando gestor...');
            
            // Simular inicialización asíncrona
            await this._configurarRecursos();
            
            this._estado.inicializado = true;
            this._emitir('inicializado', { timestamp: Date.now() });
            
            this._log('✅ Gestor inicializado correctamente');
            return true;
            
        } catch (error) {
            this._log(\`❌ Error de inicialización: \${error.message}\`, 'error');
            throw error;
        }
    }
    
    /**
     * Configura recursos internos (simulado)
     * @private
     */
    async _configurarRecursos() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this._log('🔧 Recursos configurados');
                resolve();
            }, 100);
        });
    }
    
    /**
     * Procesa los datos de entrada
     * @param {*} datos - Datos a procesar
     * @returns {Object} Resultado del procesamiento
     */
    procesar(datos) {
        if (!this._estado.inicializado) {
            throw new Error('El gestor no ha sido inicializado');
        }
        
        if (datos === null || datos === undefined) {
            return {
                exito: false,
                error: 'Los datos no pueden ser nulos',
                timestamp: Date.now()
            };
        }
        
        this._estado.contador++;
        
        const resultado = {
            exito: true,
            datosProcesados: this._transformar(datos),
            metadata: {
                id: this._estado.contador,
                timestamp: Date.now(),
                tipoEntrada: typeof datos
            }
        };
        
        this._estado.historial.push(resultado);
        this._emitir('procesado', resultado);
        
        return resultado;
    }
    
    /**
     * Transforma los datos según la lógica
     * @private
     * @param {*} datos 
     * @returns {*} Datos transformados
     */
    _transformar(datos) {
        if (Array.isArray(datos)) {
            return datos.map(item => this._procesarItem(item));
        }
        
        if (typeof datos === 'object') {
            return Object.fromEntries(
                Object.entries(datos).map(([key, value]) => [
                    key,
                    this._procesarItem(value)
                ])
            );
        }
        
        return this._procesarItem(datos);
    }
    
    /**
     * Procesa un elemento individual
     * @private
     */
    _procesarItem(item) {
        switch (typeof item) {
            case 'string':
                return item.trim().toUpperCase();
            case 'number':
                return Math.round(item * 100) / 100;
            case 'boolean':
                return item;
            default:
                return item;
        }
    }
    
    /**
     * Ejecuta una operación con reintentos
     * @param {Function} operacion - Función a ejecutar
     * @returns {Promise<*>} Resultado de la operación
     */
    async ejecutarConReintentos(operacion) {
        let ultimoError;
        
        for (let intento = 1; intento <= this.config.maxIntentos; intento++) {
            try {
                this._log(\`🔄 Intento \${intento}/\${this.config.maxIntentos}\`);
                return await operacion();
            } catch (error) {
                ultimoError = error;
                this._log(\`Intento \${intento} falló: \${error.message}\`, 'warn');
                
                if (intento < this.config.maxIntentos) {
                    await this._esperar(this.config.tiempoEspera * intento);
                }
            }
        }
        
        throw ultimoError;
    }
    
    /**
     * Espera un tiempo determinado
     * @private
     */
    _esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Sistema de eventos: suscribirse
     */
    on(evento, callback) {
        if (!this._eventListeners.has(evento)) {
            this._eventListeners.set(evento, []);
        }
        this._eventListeners.get(evento).push(callback);
        
        // Retornar función para desuscribirse
        return () => {
            const listeners = this._eventListeners.get(evento);
            const idx = listeners.indexOf(callback);
            if (idx > -1) listeners.splice(idx, 1);
        };
    }
    
    /**
     * Sistema de eventos: emitir
     * @private
     */
    _emitir(evento, datos) {
        const listeners = this._eventListeners.get(evento) || [];
        listeners.forEach(callback => {
            try { callback(datos); } catch (e) {
                console.error('Error en event listener:', e);
            }
        });
    }
    
    /**
     * Obtiene estadísticas del gestor
     * @returns {Object} Estadísticas actuales
     */
    obtenerEstadisticas() {
        return {
            inicializado: this._estado.inicializado,
            totalProcesados: this._estado.contador,
            tamanoHistorial: this._estado.historial.length,
            configuracion: { ...this.config }
        };
    }
    
    /**
     * Logger interno
     * @private
     */
    _log(mensaje, nivel = 'info') {
        if (!this.config.debug && nivel === 'debug') return;
        
        const timestamp = new Date().toISOString();
        const prefijos = {
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌',
            debug: '🔍'
        };
        
        console[\${nivel === 'error' ? 'error' : 'log'}](
            \`[\${timestamp}] \${prefijos[nivel] || 'ℹ️'} \${mensaje}\`
        );
    }
}

// ============================================================
// Ejemplo de uso
// ============================================================
async function main() {
    console.log('🚀 OSAIA - Demostración JavaScript');
    
    // Crear instancia
    const gestor = new GestorPrincipal({
        modo: 'avanzado',
        debug: true,
        maxIntentos: 3
    });
    
    // Suscribirse a eventos
    gestor.on('inicializado', (e) => {
        console.log('📢 Evento: Gestor inicializado en', new Date(e.timestamp).toLocaleTimeString());
    });
    
    gestor.on('procesado', (r) => {
        console.log('📢 Evento: Procesado #' + r.metadata.id);
    });
    
    try {
        // Inicializar
        await gestor.inicializar();
        
        // Procesar datos
        const resultado1 = gestor.procesar(['  hola  ', 'mundo', 123.456]);
        console.log('\\n📋 Resultado 1:', resultado1.datosProcesados);
        
        const resultado2 = gestor.procesar({ nombre: '  ana  ', valor: 42.123 });
        console.log('📊 Resultado 2:', resultado2.datosProcesados);
        
        // Mostrar estadísticas
        console.log('\\n📈 Estadísticas:', gestor.obtenerEstadisticas());
        
    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

// Ejecutar si es navegador
if (typeof window !== 'undefined') {
    window.GestorPrincipal = GestorPrincipal;
    window.ejecutarDemo = main;
}

// Ejecutar si es Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GestorPrincipal, main };
    if (require.main === module) main();
}
`;
}

function generateDefaultTypeScript(prompt) {
    return `// ============================================================
// Código TypeScript generado por OSAIA 🦜
// Solicitud: ${prompt}
// ============================================================

/**
 * Interfaz que define la estructura de un resultado
 */
export interface IResultado<T> {
    exitoso: boolean;
    datos?: T;
    error?: string;
    timestamp: number;
}

/**
 * Interfaz para configuración
 */
export interface IConfiguracion {
    modo?: 'basico' | 'estandar' | 'avanzado';
    debug?: boolean;
    maxElementos?: number;
}

/**
 * Interfaz para entidades con ID
 */
export interface IEntidad {
    id: string | number;
    fechaCreacion?: Date;
    fechaActualizacion?: Date;
}

/**
 * Clase genérica para gestión de entidades
 */
export class GestorEntidades<T extends IEntidad> {
    private entidades: Map<T['id'], T> = new Map();
    private config: Required<IConfiguracion>;
    
    constructor(configuracion: IConfiguracion = {}) {
        this.config = {
            modo: configuracion.modo ?? 'estandar',
            debug: configuracion.debug ?? false,
            maxElementos: configuracion.maxElementos ?? 1000
        };
    }
    
    /**
     * Agrega una nueva entidad
     * @param entidad - Entidad a agregar
     */
    agregar(entidad: T): IResultado<T> {
        if (this.entidades.size >= this.config.maxElementos) {
            return this.crearError('Límite máximo de elementos alcanzado');
        }
        
        if (this.entidades.has(entidad.id)) {
            return this.crearError('Ya existe una entidad con este ID');
        }
        
        const entidadConFecha: T = {
            ...entidad,
            fechaCreacion: entidad.fechaCreacion ?? new Date()
        };
        
        this.entidades.set(entidad.id, entidadConFecha);
        
        return {
            exitoso: true,
            datos: entidadConFecha,
            timestamp: Date.now()
        };
    }
    
    /**
     * Obtiene una entidad por ID
     */
    obtenerPorId(id: T['id']): IResultado<T> {
        const entidad = this.entidades.get(id);
        
        if (!entidad) {
            return this.crearError('Entidad no encontrada');
        }
        
        return {
            exitoso: true,
            datos: { ...entidad },
            timestamp: Date.now()
        };
    }
    
    /**
     * Actualiza una entidad existente
     */
    actualizar(id: T['id'], cambios: Partial<T>): IResultado<T> {
        const existente = this.entidades.get(id);
        
        if (!existente) {
            return this.crearError('Entidad no encontrada');
        }
        
        const actualizada: T = {
            ...existente,
            ...cambios,
            id, // No permitir cambiar ID
            fechaActualizacion: new Date()
        };
        
        this.entidades.set(id, actualizada);
        
        return {
            exitoso: true,
            datos: actualizada,
            timestamp: Date.now()
        };
    }
    
    /**
     * Elimina una entidad
     */
    eliminar(id: T['id']): IResultado<boolean> {
        if (!this.entidades.has(id)) {
            return this.crearError('Entidad no encontrada');
        }
        
        this.entidades.delete(id);
        
        return {
            exitoso: true,
            datos: true,
            timestamp: Date.now()
        };
    }
    
    /**
     * Filtra entidades usando un predicado
     */
    filtrar(predicado: (entidad: T) => boolean): T[] {
        return Array.from(this.entidades.values()).filter(predicado);
    }
    
    /**
     * Obtiene todas las entidades como array
     */
    obtenerTodos(): T[] {
        return Array.from(this.entidades.values());
    }
    
    /**
     * Obtiene la cantidad total
     */
    get cantidad(): number {
        return this.entidades.size;
    }
    
    /**
     * Crea un resultado de error
     */
    private crearError<U>(mensaje: string): IResultado<U> {
        return {
            exitoso: false,
            error: mensaje,
            timestamp: Date.now()
        };
    }
}

// ============================================================
// Ejemplo de uso
// ============================================================

interface Usuario extends IEntidad {
    nombre: string;
    email: string;
    edad: number;
    activo: boolean;
}

// Ejecutar demo
const gestorUsuarios = new GestorEntidades<Usuario>({ modo: 'avanzado', debug: true });

const resultado = gestorUsuarios.agregar({
    id: 1,
    nombre: 'Ana García',
    email: 'ana@email.com',
    edad: 28,
    activo: true
});

console.log('Resultado:', resultado);
console.log('Total:', gestorUsuarios.cantidad);
`;
}

function generateDefaultJava(prompt) {
    return `// ============================================================
// Código Java generado por OSAIA 🦜
// Solicitud: ${prompt}
// ============================================================

import java.util.*;
import java.util.function.*;
import java.util.stream.*;

/**
 * Clase principal que implementa ${prompt}
 * Sigue principios SOLID y buenas prácticas de Java
 */
public class GestorPrincipal<T> {
    
    private final List<T> elementos;
    private final int capacidadMaxima;
    private final Logger logger;
    
    /**
     * Constructor por defecto
     */
    public GestorPrincipal() {
        this(1000);
    }
    
    /**
     * Constructor con capacidad personalizada
     * @param capacidadMaxima - Límite de elementos
     */
    public GestorPrincipal(int capacidadMaxima) {
        if (capacidadMaxima <= 0) {
            throw new IllegalArgumentException("La capacidad debe ser positiva");
        }
        this.elementos = new ArrayList<>();
        this.capacidadMaxima = capacidadMaxima;
        this.logger = Logger.getInstance();
    }
    
    /**
     * Agrega un elemento a la colección
     * @param elemento - Elemento a agregar
     * @return true si se agregó exitosamente
     */
    public boolean agregar(T elemento) {
        Objects.requireNonNull(elemento, "El elemento no puede ser nulo");
        
        if (elementos.size() >= capacidadMaxima) {
            logger.warn("Capacidad máxima alcanzada: " + capacidadMaxima);
            return false;
        }
        
        boolean resultado = elementos.add(elemento);
        logger.info("Elemento agregado. Total: " + elementos.size());
        return resultado;
    }
    
    /**
     * Elimina un elemento
     */
    public boolean eliminar(T elemento) {
        return elementos.remove(elemento);
    }
    
    /**
     * Busca elementos que cumplen un predicado
     */
    public List<T> filtrar(Predicate<T> predicado) {
        return elementos.stream()
            .filter(predicado)
            .collect(Collectors.toList());
    }
    
    /**
     * Transforma y recolecta
     */
    public <R> List<R> transformar(Function<T, R> transformador) {
        return elementos.stream()
            .map(transformador)
            .collect(Collectors.toList());
    }
    
    /**
     * Ordena usando un comparador
     */
    public List<T> ordenar(Comparator<T> comparador) {
        List<T> ordenada = new ArrayList<>(elementos);
        ordenada.sort(comparador);
        return ordenada;
    }
    
    /**
     * Obtiene elementos paginados
     */
    public List<T> obtenerPagina(int pagina, int tamanoPagina) {
        int desde = (pagina - 1) * tamanoPagina;
        int hasta = Math.min(desde + tamanoPagina, elementos.size());
        
        if (desde >= elementos.size()) {
            return Collections.emptyList();
        }
        
        return new ArrayList<>(elementos.subList(desde, hasta));
    }
    
    /**
     * Verifica si existe un elemento
     */
    public boolean contiene(T elemento) {
        return elementos.contains(elemento);
    }
    
    /**
     * Obtiene la cantidad de elementos
     */
    public int getCantidad() {
        return elementos.size();
    }
    
    /**
     * Limpia todos los elementos
     */
    public void limpiar() {
        elementos.clear();
        logger.info("Colección limpiada");
    }
    
    /**
     * Obtiene una vista inmodificable
     */
    public List<T> obtenerTodos() {
        return Collections.unmodifiableList(elementos);
    }
    
    // ============================================================
    // Logger simple interno
    // ============================================================
    private static class Logger {
        private static Logger instancia;
        
        private Logger() {}
        
        public static synchronized Logger getInstance() {
            if (instancia == null) {
                instancia = new Logger();
            }
            return instancia;
        }
        
        public void info(String msg) {
            System.out.println("[INFO] " + new Date() + " - " + msg);
        }
        
        public void warn(String msg) {
            System.out.println("[WARN] " + new Date() + " - " + msg);
        }
        
        public void error(String msg) {
            System.err.println("[ERROR] " + new Date() + " - " + msg);
        }
    }
    
    // ============================================================
    // Método main para demostración
    // ============================================================
    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("☕ OSAIA - Demostración Java");
        System.out.println("========================================");
        
        GestorPrincipal<String> gestor = new GestorPrincipal<>();
        
        // Agregar elementos
        gestor.agregar("Java");
        gestor.agregar("Python");
        gestor.agregar("JavaScript");
        gestor.agregar("TypeScript");
        gestor.agregar("Go");
        
        System.out.println("\\n📋 Todos los elementos:");
        gestor.obtenerTodos().forEach(System.out::println);
        
        // Filtrar
        System.out.println("\\n🔍 Filtrar (empiezan con J):");
        gestor.filtrar(s -> s.startsWith("J")).forEach(System.out::println);
        
        // Transformar
        System.out.println("\\n🔄 Transformar a mayúsculas:");
        gestor.transformar(String::toUpperCase).forEach(System.out::println);
        
        // Ordenar
        System.out.println("\\n📊 Ordenados alfabéticamente:");
        gestor.ordenar(String::compareTo).forEach(System.out::println);
        
        System.out.println("\\n📈 Total elementos: " + gestor.getCantidad());
    }
}
`;
}

function generateDefaultCpp(prompt) {
    return `// ============================================================
// Código C++ generado por OSAIA 🦜
// Solicitud: ${prompt}
// Compilación: g++ -std=c++17 archivo.cpp -o programa
// ============================================================

#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <memory>
#include <optional>
#include <stdexcept>
#include <format>

/**
 * @brief Clase gestora que implementa ${prompt}
 * 
 * Características modernas de C++17:
 * - RAII y punteros inteligentes
 * - std::optional para valores opcionales
 * - Manejo de excepciones
 * - Templates genéricos
 */
template<typename T>
class GestorContenedor {
private:
    std::vector<T> datos_;
    size_t capacidad_maxima_;
    
public:
    /**
     * @brief Constructor por defecto
     */
    GestorContenedor() : capacidad_maxima_(1000) {
        datos_.reserve(100); // Reservar espacio inicial
    }
    
    /**
     * @brief Constructor con capacidad personalizada
     */
    explicit GestorContenedor(size_t capacidad_maxima) 
        : capacidad_maxima_(capacidad_maxima) {
        if (capacidad_maxima == 0) {
            throw std::invalid_argument("La capacidad debe ser > 0");
        }
        datos_.reserve(std::min(capacidad_maxima, static_cast<size_t>(100)));
    }
    
    /**
     * @brief Agrega un elemento al contenedor
     * @return true si se agregó exitosamente
     */
    bool agregar(const T& elemento) {
        if (datos_.size() >= capacidad_maxima_) {
            std::cerr << "⚠️ Capacidad máxima alcanzada\\n";
            return false;
        }
        datos_.push_back(elemento);
        return true;
    }
    
    /**
     * @brief Agrega con movimiento (C++11+)
     */
    bool agregar(T&& elemento) noexcept {
        if (datos_.size() >= capacidad_maxima_) return false;
        datos_.push_back(std::move(elemento));
        return true;
    }
    
    /**
     * @brief Elimina elemento por valor
     */
    bool eliminar(const T& elemento) {
        auto it = std::find(datos_.begin(), datos_.end(), elemento);
        if (it != datos_.end()) {
            datos_.erase(it);
            return true;
        }
        return false;
    }
    
    /**
     * @brief Busca un elemento
     * @return std::nullopt si no se encuentra
     */
    std::optional<size_t> buscar(const T& elemento) const {
        auto it = std::find(datos_.begin(), datos_.end(), elemento);
        if (it != datos_.end()) {
            return std::distance(datos_.begin(), it);
        }
        return std::nullopt;
    }
    
    /**
     * @brief Filtra elementos usando un predicado
     */
    template<typename Predicado>
    std::vector<T> filtrar(Predicado&& pred) const {
        std::vector<T> resultado;
        std::copy_if(datos_.begin(), datos_.end(), 
                    std::back_inserter(resultado), 
                    std::forward<Predicado>(pred));
        return resultado;
    }
    
    /**
     * @brief Transforma cada elemento
     */
    template<typename Funcion>
    auto transformar(Funcion&& func) const {
        using Resultado = decltype(func(std::declval<T>()));
        std::vector<Resultado> resultado;
        resultado.reserve(datos_.size());
        
        std::transform(datos_.begin(), datos_.end(),
                      std::back_inserter(resultado),
                      std::forward<Funcion>(func));
        return resultado;
    }
    
    /**
     * @brief Ordena el contenedor
     */
    template<typename Comparador = std::less<T>>
    void ordenar(Comparador&& comp = Comparador{}) {
        std::sort(datos_.begin(), datos_.end(), std::forward<Comparador>(comp));
    }
    
    /**
     * @brief Acceso por índice (seguro)
     */
    const T& operator[](size_t indice) const {
        if (indice >= datos_.size()) {
            throw std::out_of_range("Índice fuera de rango");
        }
        return datos_[indice];
    }
    
    /**
     * @brief Cantidad de elementos
     */
    [[nodiscard]] size_t tamano() const noexcept { return datos_.size(); }
    
    /**
     * @brief Verifica si está vacío
     */
    [[nodiscard]] bool vacio() const noexcept { return datos_.empty(); }
    
    /**
     * @brief Limpia el contenedor
     */
    void limpiar() noexcept { datos_.clear(); }
    
    // Iteradores
    auto begin() noexcept { return datos_.begin(); }
    auto end() noexcept { return datos_.end(); }
    auto begin() const noexcept { return datos_.cbegin(); }
    auto end() const noexcept { return datos_.cend(); }
};

// ============================================================
// Función principal
// ============================================================
int main() {
    try {
        std::cout << "========================================\\n";
        std::cout << "🎮 OSAIA - Demostración C++17\\n";
        std::cout << "========================================\\n\\n";
        
        // Crear gestor de strings
        GestorContenedor<std::string> gestor;
        
        // Agregar elementos
        gestor.agregar("C++");
        gestor.agregar("Python");
        gestor.agregar("JavaScript");
        gestor.agregar("Rust");
        gestor.agregar("Go");
        
        std::cout << "📋 Elementos (" << gestor.tamano() << "):\\n";
        for (const auto& item : gestor) {
            std::cout << "  • " << item << "\\n";
        }
        
        // Filtrar
        auto empiezan_con_p = gestor.filtrar([](const auto& s) {
            return !s.empty() && s[0] == 'P';
        });
        
        std::cout << "\\n🔍 Empiezan con 'P':\\n";
        for (const auto& item : empiezan_con_p) {
            std::cout << "  • " << item << "\\n";
        }
        
        // Transformar a longitudes
        auto longitudes = gestor.transformar([](const auto& s) {
            return s.length();
        });
        
        std::cout << "\\n📏 Longitudes:\\n";
        for (size_t i = 0; i < gestor.tamano(); ++i) {
            std::cout << "  " << gestor[i] << ": " << longitudes[i] << " caracteres\\n";
        }
        
        // Ordenar
        gestor.ordenar();
        std::cout << "\\n📊 Ordenados:\\n";
        for (const auto& item : gestor) {
            std::cout << "  • " << item << "\\n";
        }
        
        // Buscar
        auto posicion = gestor.buscar(std::string("Python"));
        if (posicion) {
            std::cout << "\\n✅ Python encontrado en posición: " << *posicion << "\\n";
        }
        
        std::cout << "\\n🎉 ¡Demostración completada exitosamente!\\n";
        
    } catch (const std::exception& e) {
        std::cerr << "💥 Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
`;
}

function generateDefaultCSharp(prompt) {
    return `// ============================================================
// Código C# generado por OSAIA 🦜
// Solicitud: ${prompt}
// .NET 8+ | C# 12
// ============================================================

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Osaia.Generated
{
    /// <summary>
    /// Clase genérica para gestión de entidades
    /// Implementa operaciones CRUD y consultas LINQ
    /// </summary>
    /// <typeparam name="T">Tipo de entidad</typeparam>
    public class GestorEntidades<T> where T : class
    {
        private readonly List<T> _entidades;
        private readonly object _lockObj = new();
        
        /// <summary>
        /// Evento que se dispara al agregar una entidad
        /// </summary>
        public event EventHandler<T>? EntidadAgregada;
        
        /// <summary>
        /// Evento que se dispara al eliminar una entidad
        /// </summary>
        public event EventHandler<T>? EntidadEliminada;
        
        /// <summary>
        /// Constructor por defecto
        /// </summary>
        public GestorEntidades()
        {
            _entidades = new List<T>();
        }
        
        /// <summary>
        /// Constructor con colección inicial
        /// </summary>
        public GestorEntidades(IEnumerable<T> entidadesIniciales)
        {
            _entidades = new List<T>(entidadesIniciales);
        }
        
        /// <summary>
        /// Cantidad total de entidades
        /// </summary>
        public int Cantidad => _entidades.Count;
        
        /// <summary>
        /// Agrega una nueva entidad
        /// </summary>
        /// <param name="entidad">Entidad a agregar</param>
        /// <returns>True si se agregó exitosamente</returns>
        /// <exception cref="ArgumentNullException">Si entidad es null</exception>
        public bool Agregar(T entidad)
        {
            if (entidad == null)
                throw new ArgumentNullException(nameof(entidad));
            
            lock (_lockObj)
            {
                _entidades.Add(entidad);
            }
            
            OnEntidadAgregada(entidad);
            return true;
        }
        
        /// <summary>
        /// Agrega múltiples entidades de forma segura
        /// </summary>
        public void AgregarRango(IEnumerable<T> entidades)
        {
            if (entidades == null)
                throw new ArgumentNullException(nameof(entidades));
            
            lock (_lockObj)
            {
                _entidades.AddRange(entidades);
            }
        }
        
        /// <summary>
        /// Elimina una entidad
        /// </summary>
        public bool Eliminar(T entidad)
        {
            if (entidad == null) return false;
            
            bool eliminado;
            lock (_lockObj)
            {
                eliminado = _entidades.Remove(entidad);
            }
            
            if (eliminado)
                OnEntidadEliminada(entidad);
            
            return eliminado;
        }
        
        /// <summary>
        /// Elimina entidades que cumplen un predicado
        /// </summary>
        public int EliminarPor(Func<T, bool> predicado)
        {
            var aEliminar = _entidades.Where(predicado).ToList();
            int eliminados = 0;
            
            foreach (var entidad in aEliminar)
            {
                if (Eliminar(entidad)) eliminados++;
            }
            
            return eliminados;
        }
        
        /// <summary>
        /// Busca entidades que cumplen un predicado
        /// </summary>
        public List<T> Buscar(Func<T, bool> predicado)
        {
            return _entidades.Where(predicado).ToList();
        }
        
        /// <summary>
        /// Busca la primera coincidencia o null
        /// </summary>
        public T? BuscarPrimero(Func<T, bool> predicado)
        {
            return _entidades.FirstOrDefault(predicado);
        }
        
        /// <summary>
        /// Proyecta y transforma entidades
        /// </summary>
        public List<TResultado> Proyectar<TResultado>(Func<T, TResultado> selector)
        {
            return _entidades.Select(selector).ToList();
        }
        
        /// <summary>
        /// Ordena entidades
        /// </summary>
        public List<T> Ordenar<TClave>(Func<T, TClave> selector, bool descendente = false)
        {
            return descendente 
                ? _entidades.OrderByDescending(selector).ToList()
                : _entidades.OrderBy(selector).ToList();
        }
        
        /// <summary>
        /// Pagina los resultados
        /// </summary>
        public List<T> ObtenerPagina(int numeroPagina, int tamanoPagina)
        {
            if (numeroPagina < 1)
                throw new ArgumentException("La página debe ser >= 1");
            
            if (tamanoPagina < 1)
                throw new ArgumentException("El tamaño debe ser >= 1");
            
            return _entidades
                .Skip((numeroPagina - 1) * tamanoPagina)
                .Take(tamanoPagina)
                .ToList();
        }
        
        /// <summary>
        /// Verifica si existe alguna entidad que cumpla el predicado
        /// </summary>
        public bool Existe(Func<T, bool> predicado)
        {
            return _entidades.Any(predicado);
        }
        
        /// <summary>
        /// Obtiene todas las entidades como lista inmodificable
        /// </summary>
        public IReadOnlyList<T> ObtenerTodos() => _entidades.AsReadOnly();
        
        /// <summary>
        /// Limpia todas las entidades
        /// </summary>
        public void Limpiar()
        {
            lock (_lockObj)
            {
                _entidades.Clear();
            }
        }
        
        /// <summary>
        /// Método virtual para disparar evento
        /// </summary>
        protected virtual void OnEntidadAgregada(T e)
        {
            EntidadAgregada?.Invoke(this, e);
        }
        
        /// <summary>
        /// Método virtual para disparar evento
        /// </summary>
        protected virtual void OnEntidadEliminada(T e)
        {
            EntidadEliminada?.Invoke(this, e);
        }
    }
    
    // ============================================================
    // Ejemplo de uso
    // ============================================================
    
    /// <summary>
    /// Clase de ejemplo: Usuario
    /// </summary>
    public class Usuario
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int Edad { get; set; }
        public bool Activo { get; set; } = true;
        public DateTime FechaRegistro { get; set; } = DateTime.Now;
        
        public override string ToString()
        {
            return $"[ID: {Id}] {Nombre} ({Edad} años) - {(Activo ? "✅ Activo" : "❌ Inactivo")}";
        }
    }
    
    /// <summary>
    /// Clase principal de demostración
    /// </summary>
    public class Programa
    {
        public static void Main()
        {
            Console.WriteLine("========================================");
            Console.WriteLine("🟣 OSAIA - Demostración C# 12");
            Console.WriteLine("========================================\\n");
            
            var gestor = new GestorEntidades<Usuario>();
            
            // Suscribirse a eventos
            gestor.EntidadAgregada += (sender, e) => 
                Console.WriteLine($"📢 Evento: Usuario agregado - {e.Nombre}");
            
            // Agregar usuarios
            gestor.Agregar(new Usuario { Id = 1, Nombre = "Ana García", Email = "ana@email.com", Edad = 28 });
            gestor.Agregar(new Usuario { Id = 2, Nombre = "Carlos Pérez", Email = "carlos@email.com", Edad = 35 });
            gestor.Agregar(new Usuario { Id = 3, Nombre = "María López", Email = "maria@email.com", Edad = 42, Activo = false });
            
            Console.WriteLine($"\\n📋 Total usuarios: {gestor.Cantidad}\\n");
            
            // Mostrar todos
            Console.WriteLine("Todos los usuarios:");
            foreach (var u in gestor.ObtenerTodos())
                Console.WriteLine($"  {u}");
            
            // Filtrar
            var activos = gestor.Buscar(u => u.Activo);
            Console.WriteLine($"\\n🔍 Usuarios activos ({activos.Count}):");
            activos.ForEach(u => Console.WriteLine($"  {u.Nombre}"));
            
            // Ordenar
            var ordenadosPorEdad = gestor.Ordenar(u => u.Edad, descendente: true);
            Console.WriteLine("\\n📊 Por edad (mayor a menor):");
            ordenadosPorEdad.ForEach(u => Console.WriteLine($"  {u.Nombre}: {u.Edad}"));
            
            Console.WriteLine("\\n🎉 ¡Demostración completada!");
        }
    }
}
`;
}

function generateDefaultPHP(prompt) {
    return `<?php
// ============================================================
// Código PHP generado por OSAIA 🦜
// Solicitud: ${prompt}
// PHP 8.0+ | Tipado estricto
// ============================================================

declare(strict_types=1);

namespace Osaia\\Generated;

use InvalidArgumentException;
use RuntimeException;
use JsonSerializable;

/**
 * Clase gestora que implementa ${prompt}
 * 
 * Características:
 * - Tipado estricto PHP 8
 * - POO moderna
 * - Manejo de excepciones
 * - Serialización JSON
 */
class GestorPrincipal implements JsonSerializable
{
    /** @var array Almacén de elementos */
    private array $elementos = [];
    
    /** @var int Capacidad máxima */
    private int $capacidadMaxima;
    
    /** @var array Historial de operaciones */
    private array $historial = [];
    
    /**
     * Constructor
     * 
     * @param int $capacidadMaxima Límite de elementos
     */
    public function __construct(int $capacidadMaxima = 1000)
    {
        if ($capacidadMaxima <= 0) {
            throw new InvalidArgumentException(
                'La capacidad máxima debe ser mayor a cero'
            );
        }
        
        $this->capacidadMaxima = $capacidadMaxima;
        $this->registrar('inicializacion', 'Gestor creado');
    }
    
    /**
     * Agrega un elemento
     * 
     * @param mixed $elemento Elemento a agregar
     * @return bool True si se agregó
     */
    public function agregar(mixed $elemento): bool
    {
        if (count($this->elementos) >= $this->capacidadMaxima) {
            throw new RuntimeException('Capacidad máxima alcanzada');
        }
        
        $this->elementos[] = $elemento;
        $this->registrar('agregar', 'Elemento agregado');
        
        return true;
    }
    
    /**
     * Obtiene un elemento por índice
     * 
     * @param int $indice
     * @return mixed
     */
    public function obtener(int $indice): mixed
    {
        if (!isset($this->elementos[$indice])) {
            throw new InvalidArgumentException("Índice {$indice} no existe");
        }
        
        return $this->elementos[$indice];
    }
    
    /**
     * Actualiza un elemento
     */
    public function actualizar(int $indice, mixed $nuevoValor): bool
    {
        if (!isset($this->elementos[$indice])) {
            return false;
        }
        
        $this->elementos[$indice] = $nuevoValor;
        $this->registrar('actualizar', "Índice {$indice} actualizado");
        
        return true;
    }
    
    /**
     * Elimina un elemento por índice
     */
    public function eliminar(int $indice): bool
    {
        if (!isset($this->elementos[$indice])) {
            return false;
        }
        
        array_splice($this->elementos, $indice, 1);
        $this->registrar('eliminar', "Índice {$indice} eliminado");
        
        return true;
    }
    
    /**
     * Filtra elementos usando un callable
     * 
     * @param callable $predicado Función que recibe elemento y retorna bool
     * @return array
     */
    public function filtrar(callable $predicado): array
    {
        return array_values(array_filter($this->elementos, $predicado));
    }
    
    /**
     * Transforma cada elemento
     */
    public function transformar(callable $transformador): array
    {
        return array_map($transformador, $this->elementos);
    }
    
    /**
     * Busca el primer elemento que cumpla el predicado
     */
    public function buscarPrimero(callable $predicado): mixed
    {
        foreach ($this->elementos as $elemento) {
            if ($predicado($elemento)) {
                return $elemento;
            }
        }
        
        return null;
    }
    
    /**
     * Ordena los elementos
     */
    public function ordenar(?callable $comparador = null): self
    {
        if ($comparador) {
            usort($this->elementos, $comparador);
        } else {
            sort($this->elementos);
        }
        
        $this->registrar('ordenar', 'Elementos ordenados');
        return $this;
    }
    
    /**
     * Obtiene todos los elementos
     */
    public function obtenerTodos(): array
    {
        return $this->elementos;
    }
    
    /**
     * Cantidad de elementos
     */
    public function cantidad(): int
    {
        return count($this->elementos);
    }
    
    /**
     * Obtiene el historial
     */
    public function obtenerHistorial(): array
    {
        return $this->historial;
    }
    
    /**
     * Registra una operación en el historial
     */
    private function registrar(string $accion, string $detalle): void
    {
        $this->historial[] = [
            'timestamp' => date('Y-m-d H:i:s'),
            'accion' => $accion,
            'detalle' => $detalle,
            'total_elementos' => count($this->elementos)
        ];
    }
    
    /**
     * Serialización JSON
     */
    public function jsonSerialize(): array
    {
        return [
            'cantidad' => $this->cantidad(),
            'capacidad_maxima' => $this->capacidadMaxima,
            'elementos' => $this->elementos,
            'historial' => array_slice($this->historial, -10)
        ];
    }
    
    /**
     * Representación string
     */
    public function __toString(): string
    {
        return sprintf(
            'GestorPrincipal [%d elementos, capacidad: %d]',
            $this->cantidad(),
            $this->capacidadMaxima
        );
    }
}

// ============================================================
// Ejemplo de uso
// ============================================================

// Autoloading simple (en producción usar Composer PSR-4)
spl_autoload_register(function ($clase) {
    $archivo = __DIR__ . '/' . str_replace('\\\\', '/', $clase) . '.php';
    if (file_exists($archivo)) require_once $archivo;
});

try {
    echo "========================================\\n";
    echo "🐘 OSAIA - Demostración PHP 8\\n";
    echo "========================================\\n\\n";
    
    $gestor = new GestorPrincipal(100);
    
    // Agregar elementos
    $gestor->agregar(['id' => 1, 'nombre' => 'PHP', 'tipo' => 'lenguaje']);
    $gestor->agregar(['id' => 2, 'nombre' => 'Laravel', 'tipo' => 'framework']);
    $gestor->agregar(['id' => 3, 'nombre' => 'WordPress', 'tipo' => 'cms']);
    $gestor->agregar(['id' => 4, 'nombre' => 'Symfony', 'tipo' => 'framework']);
    
    echo "📋 Cantidad: " . $gestor->cantidad() . "\\n\\n";
    
    // Filtrar frameworks
    $frameworks = $gestor->filtrar(fn($item) => $item['tipo'] === 'framework');
    echo "🔍 Frameworks encontrados:\\n";
    foreach ($frameworks as $fw) {
        echo "  • " . $fw['nombre'] . "\\n";
    }
    
    // Transformar a nombres
    $nombres = $gestor->transformar(fn($item) => strtoupper($item['nombre']));
    echo "\\n🔄 Nombres en mayúsculas: " . implode(', ', $nombres) . "\\n";
    
    // JSON
    echo "\\n📄 JSON serializado:\\n";
    echo json_encode($gestor, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\\n";
    
    echo "\\n🎉 ¡Demostración exitosa!\\n";
    
} catch (Exception $e) {
    echo "💥 Error: " . $e->getMessage() . "\\n";
    exit(1);
}
`;
}

function generateDefaultGo(prompt) {
    return `// ============================================================
// Código Go generado por OSAIA 🦜
// Solicitud: ${prompt}
// Go 1.21+
// ============================================================

package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"sort"
	"sync"
	"time"
)

// ============================================================
// Tipos y Estructuras
// ============================================================

// Resultado encapsula el resultado de una operación
type Resultado[T any] struct {
	Exitoso bool      \`json:"exitoso"\`
	Datos   T         \`json:"datos,omitempty"\`
	Error   string    \`json:"error,omitempty"\`
	MarcaTiempo time.Time \`json:"marca_tiempo"\`
}

// Gestor gestiona una colección de elementos genéricos
type Gestor[T comparable] struct {
	mu          sync.RWMutex
	elementos   []T
	capacidad   int
	historial   []string
}

// NuevoGestor crea un nuevo gestor
func NuevoGestor[T comparable](capacidad int) (*Gestor[T], error) {
	if capacidad <= 0 {
		return nil, errors.New("la capacidad debe ser positiva")
	}
	
	return &Gestor[T]{
		elementos: make([]T, 0, capacidad/10),
		capacidad: capacidad,
		historial: make([]string, 0),
	}, nil
}

// ============================================================
// Métodos principales
// ============================================================

// Agregar añade un elemento
func (g *Gestor[T]) Agregar(elemento T) error {
	g.mu.Lock()
	defer g.mu.Unlock()
	
	if len(g.elementos) >= g.capacidad {
		return errors.New("capacidad máxima alcanzada")
	}
	
	g.elementos = append(g.elementos, elemento)
	g.registrar(fmt.Sprintf("Agregado: %v", elemento))
	
	return nil
}

// Eliminar elimina un elemento
func (g *Gestor[T]) Eliminar(elemento T) bool {
	g.mu.Lock()
	defer g.mu.Unlock()
	
	for i, e := range g.elementos {
		if e == elemento {
			g.elementos = append(g.elementos[:i], g.elementos[i+1:]...)
			g.registrar(fmt.Sprintf("Eliminado: %v", elemento))
			return true
		}
	}
	return false
}

// Buscar busca el primer elemento que cumpla el predicado
func (g *Gestor[T]) Buscar(predicado func(T) bool) (T, bool) {
	g.mu.RLock()
	defer g.mu.RUnlock()
	
	var cero T
	for _, e := range g.elementos {
		if predicado(e) {
			return e, true
		}
	}
	return cero, false
}

// Filtrar retorna todos los elementos que cumplan el predicado
func (g *Gestor[T]) Filtrar(predicado func(T) bool) []T {
	g.mu.RLock()
	defer g.mu.RUnlock()
	
	resultado := make([]T, 0)
	for _, e := range g.elementos {
		if predicado(e) {
			resultado = append(resultado, e)
		}
	}
	return resultado
}

// Cantidad retorna el número de elementos
func (g *Gestor[T]) Cantidad() int {
	g.mu.RLock()
	defer g.mu.RUnlock()
	return len(g.elementos)
}

// ObtenerTodos retorna una copia de todos los elementos
func (g *Gestor[T]) ObtenerTodos() []T {
	g.mu.RLock()
	defer g.mu.RUnlock()
	
	copia := make([]T, len(g.elementos))
	copy(copia, g.elementos)
	return copia
}

// Ordenar ordena los elementos usando un comparador
func (g *Gestor[T]) Ordenar(comparador func(a, b T) bool) {
	g.mu.Lock()
	defer g.mu.Unlock()
	
	sort.Slice(g.elementos, func(i, j int) bool {
		return comparador(g.elementos[i], g.elementos[j])
	})
	g.registrar("Ordenado")
}

// Limpiar elimina todos los elementos
func (g *Gestor[T]) Limpiar() {
	g.mu.Lock()
	defer g.mu.Unlock()
	
	g.elementos = g.elementos[:0]
	g.registrar("Limpiado")
}

// AJSON serializa a JSON
func (g *Gestor[T]) AJSON() (string, error) {
	g.mu.RLock()
	defer g.mu.RUnlock()
	
	datos := map[string]interface{}{
		"cantidad":  len(g.elementos),
		"capacidad": g.capacidad,
		"elementos": g.elementos,
		"historial": g.historial,
	}
	
	bytes, err := json.MarshalIndent(datos, "", "  ")
	if err != nil {
		return "", fmt.Errorf("error serializando: %w", err)
	}
	
	return string(bytes), nil
}

// registrar agrega una entrada al historial
func (g *Gestor[T]) registrar(mensaje string) {
	entrada := fmt.Sprintf("[%s] %s", time.Now().Format(time.RFC3339), mensaje)
	g.historial = append(g.historial, entrada)
	
	// Mantener solo últimos 100 registros
	if len(g.historial) > 100 {
		g.historial = g.historial[len(g.historial)-100:]
	}
}

// ============================================================
// Ejemplo: Estructura Usuario
// ============================================================

// Usuario representa un usuario del sistema
type Usuario struct {
	ID     int       \`json:"id"\`
	Nombre string    \`json:"nombre"\`
	Email  string    \`json:"email"\`
	Edad   int       \`json:"edad"\`
	Activo bool      \`json:"activo"\`
}

// String implementa Stringer
func (u Usuario) String() string {
	estado := "✅"
	if !u.Activo {
		estado = "❌"
	}
	return fmt.Sprintf("%s [ID:%d] %s (%d) %s", estado, u.ID, u.Nombre, u.Edad, u.Email)
}

// ============================================================
// Función principal
// ============================================================

func main() {
	fmt.Println("========================================")
	fmt.Println("🔵 OSAIA - Demostración Go")
	fmt.Println("========================================")
	fmt.Println()
	
	// Crear gestor de usuarios
	gestor, err := NuevoGestor[Usuario](100)
	if err != nil {
		log.Fatalf("Error creando gestor: %v", err)
	}
	
	// Agregar usuarios
	usuarios := []Usuario{
		{ID: 1, Nombre: "Ana García", Email: "ana@email.com", Edad: 28, Activo: true},
		{ID: 2, Nombre: "Carlos Pérez", Email: "carlos@email.com", Edad: 35, Activo: true},
		{ID: 3, Nombre: "María López", Email: "maria@email.com", Edad: 42, Activo: false},
		{ID: 4, Nombre: "Juan Rodríguez", Email: "juan@email.com", Edad: 31, Activo: true},
	}
	
	for _, u := range usuarios {
		if err := gestor.Agregar(u); err != nil {
			log.Printf("Error agregando %s: %v", u.Nombre, err)
		}
	}
	
	fmt.Printf("📋 Total usuarios: %d\\n\\n", gestor.Cantidad())
	
	// Mostrar todos
	fmt.Println("Todos los usuarios:")
	for _, u := range gestor.ObtenerTodos() {
		fmt.Printf("  %s\\n", u)
	}
	
	// Filtrar activos
	activos := gestor.Filtrar(func(u Usuario) bool { return u.Activo })
	fmt.Printf("\\n🔍 Usuarios activos (%d):\\n", len(activos))
	for _, u := range activos {
		fmt.Printf("  • %s\\n", u.Nombre)
	}
	
	// Ordenar por edad
	gestor.Ordenar(func(a, b Usuario) bool { return a.Edad > b.Edad })
	fmt.Println("\\n📊 Ordenados por edad (mayor a menor):")
	for _, u := range gestor.ObtenerTodos() {
		fmt.Printf("  %s: %d años\\n", u.Nombre, u.Edad)
	}
	
	// Buscar
	encontrado, existe := gestor.Buscar(func(u Usuario) bool { return u.ID == 2 })
	if existe {
		fmt.Printf("\\n🔎 Usuario #2 encontrado: %s\\n", encontrado.Nombre)
	}
	
	// JSON
	jsonStr, err := gestor.AJSON()
	if err == nil {
		fmt.Printf("\\n📄 JSON:\\n%s\\n", jsonStr)
	}
	
	fmt.Println("\\n🎉 ¡Demostración completada exitosamente!")
}
`;
}

function generateDefaultSQL(prompt) {
    return `-- ============================================================
-- Script SQL generado por OSAIA 🦜
-- Solicitud: ${prompt}
-- Motor: PostgreSQL (compatible con MySQL con ajustes menores)
-- ============================================================

-- ============================================================
-- Tabla: Usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id                  BIGSERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    apellido            VARCHAR(100) NOT NULL,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    telefono            VARCHAR(20),
    fecha_nacimiento    DATE,
    genero              CHAR(1) CHECK (genero IN ('M', 'F', 'O')),
    direccion           TEXT,
    ciudad              VARCHAR(100),
    pais                VARCHAR(100) DEFAULT 'Guatemala',
    codigo_postal       VARCHAR(20),
    activo              BOOLEAN DEFAULT TRUE,
    verificado          BOOLEAN DEFAULT FALSE,
    ultimo_acceso       TIMESTAMP,
    intentos_fallidos   INTEGER DEFAULT 0,
    bloqueado_hasta     TIMESTAMP,
    rol                 VARCHAR(20) DEFAULT 'usuario' 
        CHECK (rol IN ('usuario', 'admin', 'moderador', 'editor')),
    avatar_url          VARCHAR(500),
    biografia           TEXT,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_eliminacion   TIMESTAMP
);

-- Índices para optimizar consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_fecha_creacion ON usuarios(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_usuarios_nombre_completo ON usuarios(nombre, apellido);

-- ============================================================
-- Tabla: Categorías
-- ============================================================
CREATE TABLE IF NOT EXISTS categorias (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL UNIQUE,
    descripcion         TEXT,
    color_hex           VARCHAR(7) DEFAULT '#00d4ff',
    icono               VARCHAR(50),
    padre_id            INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    orden               INTEGER DEFAULT 0,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Tabla: Productos
-- ============================================================
CREATE TABLE IF NOT EXISTS productos (
    id                  BIGSERIAL PRIMARY KEY,
    sku                 VARCHAR(50) NOT NULL UNIQUE,
    nombre              VARCHAR(200) NOT NULL,
    descripcion_corta   VARCHAR(500),
    descripcion_larga   TEXT,
    precio              DECIMAL(12, 2) NOT NULL CHECK (precio >= 0),
    precio_original     DECIMAL(12, 2),
    stock               INTEGER DEFAULT 0 CHECK (stock >= 0),
    stock_minimo        INTEGER DEFAULT 5,
    categoria_id        INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    marca               VARCHAR(100),
    modelo              VARCHAR(100),
    peso_kg             DECIMAL(8, 3),
    dimensiones         VARCHAR(100),
    imagen_principal    VARCHAR(500),
    galeria_imagenes    JSONB,
    atributos           JSONB,
    etiquetas           VARCHAR(255)[],
    destacado           BOOLEAN DEFAULT FALSE,
    nuevo               BOOLEAN DEFAULT TRUE,
    descuento           INTEGER DEFAULT 0 CHECK (descuento BETWEEN 0 AND 100),
    visible             BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_eliminacion   TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_precio ON productos(precio);
CREATE INDEX IF NOT EXISTS idx_productos_destacado ON productos(destacado);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos USING GIN (to_tsvector('spanish', nombre));

-- ============================================================
-- Tabla: Pedidos
-- ============================================================
CREATE TABLE IF NOT EXISTS pedidos (
    id                  BIGSERIAL PRIMARY KEY,
    numero_pedido       VARCHAR(20) NOT NULL UNIQUE,
    usuario_id          BIGINT NOT NULL REFERENCES usuarios(id),
    subtotal            DECIMAL(12, 2) NOT NULL,
    impuestos           DECIMAL(12, 2) DEFAULT 0,
    envio               DECIMAL(12, 2) DEFAULT 0,
    descuento_total     DECIMAL(12, 2) DEFAULT 0,
    total               DECIMAL(12, 2) NOT NULL,
    moneda              CHAR(3) DEFAULT 'GTQ',
    estado              VARCHAR(20) DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'procesando', 'enviado', 
                          'entregado', 'cancelado', 'devuelto')),
    metodo_pago         VARCHAR(50),
    pago_completado     BOOLEAN DEFAULT FALSE,
    fecha_pago          TIMESTAMP,
    transaccion_id      VARCHAR(100),
    direccion_envio     JSONB NOT NULL,
    notas               TEXT,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha_creacion);

-- ============================================================
-- Tabla: Detalles de Pedido
-- ============================================================
CREATE TABLE IF NOT EXISTS pedido_detalles (
    id                  BIGSERIAL PRIMARY KEY,
    pedido_id           BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id         BIGINT REFERENCES productos(id) ON DELETE SET NULL,
    nombre_producto     VARCHAR(200) NOT NULL,
    sku_producto        VARCHAR(50),
    precio_unitario     DECIMAL(12, 2) NOT NULL,
    cantidad            INTEGER NOT NULL CHECK (cantidad > 0),
    descuento_unitario  DECIMAL(12, 2) DEFAULT 0,
    subtotal            DECIMAL(12, 2) NOT NULL,
    atributos_seleccionados JSONB,
    UNIQUE(pedido_id, producto_id)
);

-- ============================================================
-- Tabla: Auditoría (logs)
-- ============================================================
CREATE TABLE IF NOT EXISTS auditoria_logs (
    id                  BIGSERIAL PRIMARY KEY,
    tabla               VARCHAR(100) NOT NULL,
    registro_id         BIGINT,
    accion              VARCHAR(20) NOT NULL 
        CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),
    datos_anteriores    JSONB,
    datos_nuevos        JSONB,
    usuario_id          BIGINT REFERENCES usuarios(id),
    ip_origen           INET,
    user_agent          TEXT,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- VISTAS ÚTILES
-- ============================================================

-- Vista: Resumen de productos
CREATE OR REPLACE VIEW vw_productos_resumen AS
SELECT 
    p.id,
    p.sku,
    p.nombre,
    p.precio,
    p.stock,
    c.nombre AS categoria,
    CASE 
        WHEN p.stock = 0 THEN 'Agotado'
        WHEN p.stock <= p.stock_minimo THEN 'Bajo'
        ELSE 'Disponible'
    END AS estado_stock,
    p.fecha_creacion
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.fecha_eliminacion IS NULL;

-- Vista: Pedidos con información de usuario
CREATE OR REPLACE VIEW vw_pedidos_detallados AS
SELECT 
    p.id,
    p.numero_pedido,
    p.total,
    p.estado,
    p.fecha_creacion,
    u.nombre || ' ' || u.apellido AS cliente,
    u.email AS cliente_email,
    (SELECT COUNT(*) FROM pedido_detalles pd WHERE pd.pedido_id = p.id) AS cantidad_items
FROM pedidos p
JOIN usuarios u ON p.usuario_id = u.id;

-- ============================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================

-- Función: Actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para usuarios
DROP TRIGGER IF EXISTS trg_usuarios_actualizar_fecha ON usuarios;
CREATE TRIGGER trg_usuarios_actualizar_fecha
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- Trigger para productos
DROP TRIGGER IF EXISTS trg_productos_actualizar_fecha ON productos;
CREATE TRIGGER trg_productos_actualizar_fecha
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- ============================================================
-- DATOS INICIALES (SEED)
-- ============================================================

INSERT INTO categorias (nombre, descripcion, color_hex, icono, orden) VALUES
    ('Electrónica', 'Dispositivos electrónicos y accesorios', '#00d4ff', 'ri-smartphone-line', 1),
    ('Computación', 'Laptops, PCs y periféricos', '#a855f7', 'ri-computer-line', 2),
    ('Ropa', 'Moda y vestimenta', '#ff6b9d', 'ri-t-shirt-line', 3),
    ('Hogar', 'Artículos para el hogar', '#00ff88', 'ri-home-heart-line', 4),
    ('Libros', 'Libros y material educativo', '#ffaa00', 'ri-book-open-line', 5)
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- CONSULTAS DE EJEMPLO
-- ============================================================

-- 1. Obtener productos con categoría
SELECT p.nombre, p.precio, p.stock, c.nombre AS categoria
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
WHERE p.visible = TRUE AND p.fecha_eliminacion IS NULL
ORDER BY p.fecha_creacion DESC
LIMIT 20;

-- 2. Ventas totales por mes
SELECT 
    DATE_TRUNC('month', fecha_creacion) AS mes,
    COUNT(*) AS total_pedidos,
    SUM(total) AS ventas_totales,
    AVG(total) AS promedio_pedido
FROM pedidos
WHERE estado != 'cancelado'
GROUP BY DATE_TRUNC('month', fecha_creacion)
ORDER BY mes DESC;

-- 3. Top 10 productos más vendidos
SELECT 
    p.nombre,
    p.sku,
    SUM(pd.cantidad) AS unidades_vendidas,
    SUM(pd.subtotal) AS ingresos
FROM pedido_detalles pd
JOIN productos p ON pd.producto_id = p.id
GROUP BY p.id, p.nombre, p.sku
ORDER BY unidades_vendidas DESC
LIMIT 10;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
`;
}

function generateFallbackCode(lang, prompt) {
    return `// ============================================================
// Código generado por OSAIA 🦜
// Lenguaje: ${lang}
// Solicitud: ${prompt}
// ============================================================

/*
  Este es un código de ejemplo para ${lang}.
  OSAIA está procesando tu solicitud específica.
  
  Stack técnico disponible:
  - Python: Orquestación y modelos
  - C++: Alto rendimiento
  - CUDA: Aceleración GPU
  - GLSL: Shaders y procesamiento visual
  - PyTorch: Redes neuronales
  - TensorFlow: Producción y TPU
  - FFmpeg: Codificación de audio/video
  
  Personaliza este código según tus necesidades.
*/

console.log("¡Hola desde OSAIA!");
console.log("Solicitud: ${prompt}");
`;
}

// ===== NUEVOS GENERADORES TÉCNICOS =====

function generateCUDAKernel(prompt) {
    return `// ============================================================
// Kernel CUDA generado por OSAIA 🦜
// Solicitud: ${prompt}
// Compilación: nvcc -arch=sm_75 vector_add.cu -o vector_add
// ============================================================

#include <iostream>
#include <vector>
#include <cmath>
#include <cuda_runtime.h>

// ============================================================
// Manejo de errores CUDA
// ============================================================
#define CUDA_CHECK(err) \
    do { \
        cudaError_t err_ = (err); \
        if (err_ != cudaSuccess) { \
            std::cerr << "CUDA Error en " << __FILE__ << ":" << __LINE__ \
                      << ": " << cudaGetErrorString(err_) << std::endl; \
            exit(EXIT_FAILURE); \
        } \
    } while (0)

// ============================================================
// Kernel: Suma de vectores en paralelo
// Cada hilo procesa un elemento independiente
// ============================================================
__global__ void vectorAddKernel(
    const float* __restrict__ A,
    const float* __restrict__ B,
    float* __restrict__ C,
    int N
) {
    // Calcular índice global del hilo
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    
    // Verificar límites (evitar acceso fuera de rango)
    if (idx < N) {
        // Cada hilo suma un par de elementos
        C[idx] = A[idx] + B[idx];
    }
}

// ============================================================
// Kernel: Multiplicación de vectores
// ============================================================
__global__ void vectorMulKernel(
    const float* __restrict__ A,
    const float* __restrict__ B,
    float* __restrict__ C,
    int N
) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < N) {
        C[idx] = A[idx] * B[idx];
    }
}

// ============================================================
// Kernel: Suma axpy: y = a * x + y
// Operación BLAS nivel 1 muy común
// ============================================================
__global__ void axpyKernel(
    float alpha,
    const float* __restrict__ X,
    float* __restrict__ Y,
    int N
) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < N) {
        Y[idx] = alpha * X[idx] + Y[idx];
    }
}

// ============================================================
// Wrapper de alto nivel para la suma de vectores
// ============================================================
void vectorAddCUDA(
    const std::vector<float>& h_A,
    const std::vector<float>& h_B,
    std::vector<float>& h_C
) {
    const int N = h_A.size();
    const size_t bytes = N * sizeof(float);
    
    // 1. Reservar memoria en el dispositivo (GPU)
    float *d_A, *d_B, *d_C;
    CUDA_CHECK(cudaMalloc(&d_A, bytes));
    CUDA_CHECK(cudaMalloc(&d_B, bytes));
    CUDA_CHECK(cudaMalloc(&d_C, bytes));
    
    // 2. Copiar datos: Host → Device
    CUDA_CHECK(cudaMemcpy(d_A, h_A.data(), bytes, cudaMemcpyHostToDevice));
    CUDA_CHECK(cudaMemcpy(d_B, h_B.data(), bytes, cudaMemcpyHostToDevice));
    
    // 3. Configurar la ejecución del kernel
    const int threadsPerBlock = 256;  // Típico: múltiplo de 32 (warp)
    const int blocksPerGrid = (N + threadsPerBlock - 1) / threadsPerBlock;
    
    std::cout << "  Lanzando kernel: " << blocksPerGrid 
              << " bloques × " << threadsPerBlock 
              << " hilos = " << blocksPerGrid * threadsPerBlock 
              << " hilos totales" << std::endl;
    
    // 4. Lanzar el kernel
    vectorAddKernel<<<blocksPerGrid, threadsPerBlock>>>(d_A, d_B, d_C, N);
    
    // Verificar errores de lanzamiento
    CUDA_CHECK(cudaGetLastError());
    
    // 5. Sincronizar: esperar a que termine el kernel
    CUDA_CHECK(cudaDeviceSynchronize());
    
    // 6. Copiar resultado: Device → Host
    h_C.resize(N);
    CUDA_CHECK(cudaMemcpy(h_C.data(), d_C, bytes, cudaMemcpyDeviceToHost));
    
    // 7. Liberar memoria GPU
    CUDA_CHECK(cudaFree(d_A));
    CUDA_CHECK(cudaFree(d_B));
    CUDA_CHECK(cudaFree(d_C));
}

// ============================================================
// Verificación en CPU (para validar resultados)
// ============================================================
void verificarResultado(
    const std::vector<float>& A,
    const std::vector<float>& B,
    const std::vector<float>& C,
    float tolerancia = 1e-5f
) {
    bool correcto = true;
    for (size_t i = 0; i < A.size(); ++i) {
        float esperado = A[i] + B[i];
        if (std::fabs(C[i] - esperado) > tolerancia) {
            std::cerr << "❌ Error en índice " << i 
                      << ": C=" << C[i] 
                      << " esperado=" << esperado << std::endl;
            correcto = false;
            break;
        }
    }
    
    if (correcto) {
        std::cout << "✅ ¡Verificación exitosa! Todos los elementos coinciden." << std::endl;
    }
}

// ============================================================
// Información del dispositivo GPU
// ============================================================
void mostrarInfoGPU() {
    int deviceCount;
    CUDA_CHECK(cudaGetDeviceCount(&deviceCount));
    
    std::cout << "\\n========================================" << std::endl;
    std::cout << "🎮 Dispositivos CUDA detectados: " << deviceCount << std::endl;
    
    for (int i = 0; i < deviceCount; ++i) {
        cudaDeviceProp prop;
        CUDA_CHECK(cudaGetDeviceProperties(&prop, i));
        
        std::cout << "\\n--- GPU #" << i << ": " << prop.name << " ---" << std::endl;
        std::cout << "  • Multiprocesadores: " << prop.multiProcessorCount << std::endl;
        std::cout << "  • Memoria global: " << (prop.totalGlobalMem / 1024 / 1024) << " MB" << std::endl;
        std::cout << "  • Hilos por bloque máx: " << prop.maxThreadsPerBlock << std::endl;
        std::cout << "  • Capacidad de cómputo: " << prop.major << "." << prop.minor << std::endl;
        std::cout << "  • Reloj: " << (prop.clockRate / 1000) << " MHz" << std::endl;
    }
    std::cout << "========================================\\n" << std::endl;
}

// ============================================================
// Función principal
// ============================================================
int main() {
    std::cout << "🦜 OSAIA - Suma de Vectores CUDA" << std::endl;
    std::cout << "========================================\\n" << std::endl;
    
    // Mostrar info de GPU
    mostrarInfoGPU();
    
    // Tamaño del vector (1 millón de elementos)
    const int N = 1 << 20;  // 2^20 = 1,048,576
    std::cout << "📐 Tamaño de vectores: " << N << " elementos" << std::endl;
    std::cout << "📦 Memoria por vector: " << (N * sizeof(float) / 1024 / 1024) << " MB\\n" << std::endl;
    
    // Inicializar vectores en el host (CPU)
    std::vector<float> h_A(N);
    std::vector<float> h_B(N);
    std::vector<float> h_C;
    
    for (int i = 0; i < N; ++i) {
        h_A[i] = static_cast<float>(i) * 0.01f;
        h_B[i] = static_cast<float>(N - i) * 0.01f;
    }
    
    // Medir tiempo
    cudaEvent_t start, stop;
    CUDA_CHECK(cudaEventCreate(&start));
    CUDA_CHECK(cudaEventCreate(&stop));
    
    std::cout << "🚀 Ejecutando kernel CUDA..." << std::endl;
    CUDA_CHECK(cudaEventRecord(start));
    
    // Ejecutar suma en GPU
    vectorAddCUDA(h_A, h_B, h_C);
    
    CUDA_CHECK(cudaEventRecord(stop));
    CUDA_CHECK(cudaEventSynchronize(stop));
    
    float milisegundos;
    CUDA_CHECK(cudaEventElapsedTime(&milisegundos, start, stop));
    
    std::cout << "\\n⏱️  Tiempo GPU: " << milisegundos << " ms" << std::endl;
    std::cout << "📊 Rendimiento: " << (N / milisegundos / 1000) << " M operaciones/segundo" << std::endl;
    
    // Verificar
    std::cout << "\\n🔍 Verificando resultados..." << std::endl;
    verificarResultado(h_A, h_B, h_C);
    
    // Limpiar eventos
    CUDA_CHECK(cudaEventDestroy(start));
    CUDA_CHECK(cudaEventDestroy(stop));
    
    // Resetear dispositivo (buena práctica)
    CUDA_CHECK(cudaDeviceReset());
    
    std::cout << "\\n✨ ¡Operación CUDA completada exitosamente!" << std::endl;
    return 0;
}
`;
}

function generateGLSLShader(prompt) {
    return `// ============================================================
// Fragment Shader GLSL generado por OSAIA 🦜
// Solicitud: ${prompt}
// Versión: GLSL 450 core
// Propósito: Post-procesamiento de imagen con corrección de color
// ============================================================

#version 450 core

// ============================================================
// Entradas y Salidas
// ============================================================
layout(location = 0) in vec2 v_texCoord;          // Coordenadas de textura (0,0)-(1,1)
layout(location = 0) out vec4 fragColor;          // Color final del píxel

// ============================================================
// Uniforms (parámetros desde CPU)
// ============================================================
uniform sampler2D u_texture;       // Textura de entrada (imagen generada)
uniform float     u_time;          // Tiempo transcurrido (segundos)
uniform vec2      u_resolution;    // Resolución de la pantalla
uniform vec2      u_mouse;         // Posición del mouse

// Parámetros de corrección de color
uniform float u_brightness;        // Brillo: -0.5 a 0.5
uniform float u_contrast;          // Contraste: 0.5 a 2.0
uniform float u_saturation;        // Saturación: 0.0 a 2.0
uniform float u_vignette;          // Viñeta: 0.0 a 1.0
uniform float u_grain;             // Grano de película: 0.0 a 0.1

// ============================================================
// Constantes útiles
// ============================================================
const vec3 LUMA = vec3(0.299, 0.587, 0.114);  // Coeficientes de luminancia BT.601

// ============================================================
// Funciones auxiliares
// ============================================================

// RGB → HSV (espacio Tono-Saturación-Valor)
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    
    return vec3(
        abs(q.z + (q.w - q.y) / (6.0 * d + e)),  // H: Tono
        d / (q.x + e),                            // S: Saturación
        q.x                                       // V: Valor
    );
}

// HSV → RGB
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Ruido pseudoaleatorio (para grano de película)
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// ============================================================
// FUNCIÓN PRINCIPAL DEL SHADER
// Se ejecuta UNA VEZ POR CADA PÍXEL
// ============================================================
void main() {
    // 1. Muestrear la textura original
    vec3 color = texture(u_texture, v_texCoord).rgb;
    
    // 2. Aplicar brillo (suma)
    color += u_brightness;
    
    // 3. Aplicar contraste (escalado alrededor de 0.5)
    color = (color - 0.5) * u_contrast + 0.5;
    
    // 4. Aplicar saturación (via espacio HSV)
    vec3 hsv = rgb2hsv(color);
    hsv.y *= u_saturation;
    color = hsv2rgb(hsv);
    
    // 5. Balance de blancos sutil (enfriar ligeramente)
    color = color * vec3(1.0, 1.0, 1.02);
    
    // 6. Efecto viñeta (bordes más oscuros)
    vec2 centro = v_texCoord - 0.5;
    float distancia = length(centro) * 2.0;  // 0 en centro, ~1.4 en esquinas
    float viñeta = 1.0 - smoothstep(0.5, 1.5, distancia) * u_vignette;
    color *= viñeta;
    
    // 7. Grano de película
    float grano = random(v_texCoord + u_time * 0.1) * 2.0 - 1.0;
    color += grano * u_grain;
    
    // 8. Curva S para contraste final suave
    color = smoothstep(0.0, 1.0, color);
    
    // 9. Clampeo final al rango válido [0,1]
    color = clamp(color, 0.0, 1.0);
    
    // 10. Corrección gamma (lineal → sRGB)
    color = pow(color, vec3(1.0 / 2.2));
    
    // Salida final (alfa = 1, opaco)
    fragColor = vec4(color, 1.0);
}

// ============================================================
// COMPAÑERO: Vertex Shader (sencillo)
// ============================================================
/*
#version 450 core
layout(location = 0) in vec2 a_posicion;   // Coordenadas del cuad
layout(location = 1) in vec2 a_texCoord;   // Coordenadas de textura

layout(location = 0) out vec2 v_texCoord;

void main() {
    v_texCoord = a_texCoord;
    gl_Position = vec4(a_posicion, 0.0, 1.0);
}
*/

// ============================================================
// EXPLICACIÓN DEL FLUJO:
//
// 1. CPU prepara la textura con la imagen generada por la IA
// 2. CPU envía uniforms (brillo, contraste, etc.) a la GPU
// 3. GPU ejecuta el Vertex Shader (dibuja un cuad que cubre pantalla)
// 4. GPU ejecuta ESTE Fragment Shader en paralelo
//    • Cada píxel = un hilo independiente en la GPU
//    • Miles de hilos corren simultáneamente
// 5. Resultado: imagen post-procesada en el framebuffer
// 6. Se presenta en pantalla o se guarda a archivo
//
// Velocidad típica: 1000+ FPS en una GPU moderna 🚀
// ============================================================
`;
}

function generatePyTorchModel(prompt) {
    return `# ============================================================
# Modelo PyTorch generado por OSAIA 🦜🔥
# Solicitud: ${prompt}
# Arquitectura: Bloque Residual + UNet simplificado para Difusión
# Dependencias: torch, torchvision, numpy
# ============================================================

import math
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from typing import Optional, Tuple, Dict, Any


# ============================================================
# 1. Embedding Sinusoidal de Tiempo
# Indica al modelo en qué paso de difusión está
# ============================================================
class SinusoidalTimeEmbedding(nn.Module):
    """
    Convierte un paso de tiempo (escalar) en un vector rico.
    Inspirado en la codificación posicional de Transformers.
    """
    
    def __init__(self, dim: int = 128):
        super().__init__()
        self.dim = dim
        half_dim = dim // 2
        emb = math.log(10000) / (half_dim - 1)
        self.register_buffer(
            'freqs',
            torch.exp(torch.arange(half_dim, dtype=torch.float32) * -emb)
        )
    
    def forward(self, t: torch.Tensor) -> torch.Tensor:
        """
        Args:
            t: Tensor de tiempos [batch_size]
        Returns:
            Embedding [batch_size, dim]
        """
        args = t[:, None].float() * self.freqs[None, :]
        return torch.cat([torch.sin(args), torch.cos(args)], dim=-1)


# ============================================================
# 2. Bloque Residual con Atención al Tiempo
# ============================================================
class ResidualBlock(nn.Module):
    """
    Bloque convolucional con:
    - GroupNorm → SiLU → Conv2d
    - Proyección de embedding de tiempo
    - Skip connection (identidad o 1×1 conv)
    """
    
    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        time_emb_dim: int = 128,
        num_groups: int = 8,
        dropout: float = 0.1
    ):
        super().__init__()
        
        # Primera convolución
        self.norm1 = nn.GroupNorm(num_groups, in_channels)
        self.act1 = nn.SiLU()
        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1)
        
        # Proyección del embedding de tiempo
        self.time_proj = nn.Sequential(
            nn.SiLU(),
            nn.Linear(time_emb_dim, out_channels)
        )
        
        # Segunda convolución
        self.norm2 = nn.GroupNorm(num_groups, out_channels)
        self.act2 = nn.SiLU()
        self.dropout = nn.Dropout(dropout)
        self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1)
        
        # Skip connection (adaptar canales si cambian)
        if in_channels != out_channels:
            self.skip_conv = nn.Conv2d(in_channels, out_channels, kernel_size=1)
        else:
            self.skip_conv = nn.Identity()
    
    def forward(self, x: torch.Tensor, t_emb: torch.Tensor) -> torch.Tensor:
        residual = self.skip_conv(x)
        
        h = self.conv1(self.act1(self.norm1(x)))
        
        # Agregar información de tiempo (broadcast sobre espacial)
        t_proj = self.time_proj(t_emb)[:, :, None, None]
        h = h + t_proj
        
        h = self.conv2(self.dropout(self.act2(self.norm2(h))))
        
        return h + residual


# ============================================================
# 3. Bloque de Atención (Self-Attention)
# ============================================================
class AttentionBlock(nn.Module):
    """
    Atención de múltiples cabezas sobre el espacio de la imagen.
    Permite al modelo relacionar partes distantes de la imagen.
    """
    
    def __init__(self, channels: int, num_heads: int = 4):
        super().__init__()
        self.num_heads = num_heads
        self.head_dim = channels // num_heads
        self.scale = self.head_dim ** -0.5
        
        self.qkv = nn.Conv2d(channels, channels * 3, kernel_size=1)
        self.proj = nn.Conv2d(channels, channels, kernel_size=1)
        self.norm = nn.GroupNorm(4, channels)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        B, C, H, W = x.shape
        
        # Normalizar entrada
        h = self.norm(x)
        
        # Q, K, V
        qkv = self.qkv(h).chunk(3, dim=1)
        q, k, v = [t.view(B, self.num_heads, self.head_dim, H * W) for t in qkv]
        
        # Atención: softmax(Q·K^T / √d) · V
        attn = torch.einsum('bhcn,bhcm->bhnm', q, k) * self.scale
        attn = F.softmax(attn, dim=-1)
        
        out = torch.einsum('bhnm,bhcm->bhcn', attn, v)
        out = out.reshape(B, C, H, W)
        
        return x + self.proj(out)


# ============================================================
# 4. UNet COMPLETO para Difusión
# Arquitectura Encoder → Bottleneck → Decoder con skip connections
# ============================================================
class DiffusionUNet(nn.Module):
    """
    UNet que predice el ruido en una imagen latente.
    Entrada: imagen ruidosa + paso de tiempo + embedding de texto
    Salida: predicción del ruido ε
    """
    
    def __init__(
        self,
        in_channels: int = 4,           # Canales del espacio latente
        out_channels: int = 4,
        base_channels: int = 64,
        channel_multipliers: Tuple[int] = (1, 2, 4, 8),
        num_res_blocks: int = 2,
        time_emb_dim: int = 128,
        attention_levels: Tuple[int] = (1, 2)
    ):
        super().__init__()
        
        self.time_mlp = nn.Sequential(
            SinusoidalTimeEmbedding(time_emb_dim),
            nn.Linear(time_emb_dim, time_emb_dim * 4),
            nn.SiLU(),
            nn.Linear(time_emb_dim * 4, time_emb_dim)
        )
        
        # Capa de entrada
        self.input_conv = nn.Conv2d(in_channels, base_channels, kernel_size=3, padding=1)
        
        # ========== ENCODER (Downsampling) ==========
        self.down_blocks = nn.ModuleList()
        self.downsamplers = nn.ModuleList()
        
        current_channels = base_channels
        all_channels = [current_channels]
        
        for level, mult in enumerate(channel_multipliers):
            out_ch = base_channels * mult
            
            # Bloques residuales por nivel
            level_blocks = nn.ModuleList()
            for _ in range(num_res_blocks):
                level_blocks.append(ResidualBlock(current_channels, out_ch, time_emb_dim))
                current_channels = out_ch
                all_channels.append(current_channels)
                
                # Atención en niveles seleccionados
                if level in attention_levels:
                    level_blocks.append(AttentionBlock(current_channels))
            
            self.down_blocks.append(level_blocks)
            
            # Downsampling (excepto último nivel)
            if level != len(channel_multipliers) - 1:
                self.downsamplers.append(nn.Conv2d(current_channels, current_channels, 
                                                   kernel_size=3, stride=2, padding=1))
        
        # ========== BOTTLENECK ==========
        self.bottleneck = nn.ModuleList([
            ResidualBlock(current_channels, current_channels, time_emb_dim),
            AttentionBlock(current_channels),
            ResidualBlock(current_channels, current_channels, time_emb_dim)
        ])
        
        # ========== DECODER (Upsampling) ==========
        self.up_blocks = nn.ModuleList()
        self.upsamplers = nn.ModuleList()
        
        for level in reversed(range(len(channel_multipliers))):
            mult = channel_multipliers[level]
            out_ch = base_channels * mult
            
            # Upsampling (excepto primer nivel de decoder)
            if level != len(channel_multipliers) - 1:
                self.upsamplers.append(nn.Sequential(
                    nn.Upsample(scale_factor=2, mode='nearest'),
                    nn.Conv2d(current_channels, current_channels, kernel_size=3, padding=1)
                ))
            
            # Bloques residuales con skip connections
            level_blocks = nn.ModuleList()
            for _ in range(num_res_blocks):
                skip_ch = all_channels.pop()
                level_blocks.append(ResidualBlock(
                    current_channels + skip_ch, out_ch, time_emb_dim
                ))
                current_channels = out_ch
                
                if level in attention_levels:
                    level_blocks.append(AttentionBlock(current_channels))
            
            self.up_blocks.append(level_blocks)
        
        # Capa de salida
        self.output_norm = nn.GroupNorm(8, current_channels)
        self.output_act = nn.SiLU()
        self.output_conv = nn.Conv2d(current_channels, out_channels, kernel_size=3, padding=1)
        
        # Inicialización de pesos
        self._initialize_weights()
    
    def _initialize_weights(self):
        """Inicialización especial para la capa de salida (cero init)"""
        nn.init.zeros_(self.output_conv.weight)
        nn.init.zeros_(self.output_conv.bias)
    
    def forward(
        self,
        x: torch.Tensor,
        t: torch.Tensor,
        context: Optional[torch.Tensor] = None
    ) -> torch.Tensor:
        """
        Args:
            x: Imagen latente ruidosa [B, C, H, W]
            t: Pasos de tiempo [B]
            context: Embedding de texto opcional [B, seq_len, emb_dim]
        Returns:
            Predicción de ruido [B, C, H, W]
        """
        # Embedding de tiempo
        t_emb = self.time_mlp(t)
        
        # Entrada
        x = self.input_conv(x)
        skips = [x]
        
        # ===== Encoder =====
        for i, blocks in enumerate(self.down_blocks):
            for block in blocks:
                if isinstance(block, AttentionBlock):
                    x = block(x)
                else:
                    x = block(x, t_emb)
                skips.append(x)
            
            if i < len(self.downsamplers):
                x = self.downsamplers[i](x)
                skips.append(x)
        
        # ===== Bottleneck =====
        for block in self.bottleneck:
            if isinstance(block, AttentionBlock):
                x = block(x)
            else:
                x = block(x, t_emb)
        
        # ===== Decoder =====
        for i, blocks in enumerate(self.up_blocks):
            if i > 0:
                x = self.upsamplers[i - 1](x)
            
            for block in blocks:
                if isinstance(block, AttentionBlock):
                    x = block(x)
                else:
                    # Concatenar skip connection
                    skip = skips.pop()
                    x = torch.cat([x, skip], dim=1)
                    x = block(x, t_emb)
        
        # Salida
        x = self.output_conv(self.output_act(self.output_norm(x)))
        
        return x


# ============================================================
# 5. Proceso de Difusión (Forward + Sampling)
# ============================================================
class DiffusionProcess:
    """
    Implementa el proceso de difusión:
    - Forward: agrega ruido programado
    - Reverse: remueve ruido paso a paso
    """
    
    def __init__(
        self,
        num_timesteps: int = 1000,
        beta_start: float = 0.0001,
        beta_end: float = 0.02,
        device: str = 'cuda' if torch.cuda.is_available() else 'cpu'
    ):
        self.device = device
        self.num_timesteps = num_timesteps
        
        # Schedule lineal de β
        self.betas = torch.linspace(beta_start, beta_end, num_timesteps).to(device)
        self.alphas = 1.0 - self.betas
        self.alphas_cumprod = torch.cumprod(self.alphas, dim=0)
        self.alphas_cumprod_prev = F.pad(self.alphas_cumprod[:-1], (1, 0), value=1.0)
        
        # Pre-calcular para el forward
        self.sqrt_alphas_cumprod = torch.sqrt(self.alphas_cumprod)
        self.sqrt_one_minus_alphas_cumprod = torch.sqrt(1.0 - self.alphas_cumprod)
        
        # Pre-calcular para el reverse (sampling)
        self.posterior_variance = self.betas * (1.0 - self.alphas_cumprod_prev) / (1.0 - self.alphas_cumprod)
    
    def q_sample(
        self,
        x_0: torch.Tensor,
        t: torch.Tensor,
        noise: Optional[torch.Tensor] = None
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Forward process: agrega ruido a x_0 en el paso t
        x_t = √ᾱ_t · x_0 + √(1-ᾱ_t) · ε
        """
        if noise is None:
            noise = torch.randn_like(x_0)
        
        sqrt_alphas = self.sqrt_alphas_cumprod[t][:, None, None, None]
        sqrt_one_minus = self.sqrt_one_minus_alphas_cumprod[t][:, None, None, None]
        
        x_t = sqrt_alphas * x_0 + sqrt_one_minus * noise
        return x_t, noise
    
    @torch.no_grad()
    def p_sample(
        self,
        model: nn.Module,
        x_t: torch.Tensor,
        t: torch.Tensor,
        t_index: int
    ) -> torch.Tensor:
        """
        Un paso de reverse process: x_t → x_{t-1}
        """
        # Predecir ruido
        pred_noise = model(x_t, t)
        
        # Extraer valores del schedule
        beta_t = self.betas[t_index]
        alpha_t = self.alphas[t_index]
        alpha_cumprod_t = self.alphas_cumprod[t_index]
        alpha_cumprod_prev_t = self.alphas_cumprod_prev[t_index]
        posterior_var_t = self.posterior_variance[t_index]
        
        # Media de la posterior
        pred_x_0 = (x_t - torch.sqrt(1 - alpha_cumprod_t) * pred_noise) / torch.sqrt(alpha_cumprod_t)
        pred_x_0 = torch.clamp(pred_x_0, -1.0, 1.0)
        
        coef_x0 = torch.sqrt(alpha_cumprod_prev_t) * beta_t / (1 - alpha_cumprod_t)
        coef_xt = torch.sqrt(alpha_t) * (1 - alpha_cumprod_prev_t) / (1 - alpha_cumprod_t)
        
        posterior_mean = coef_x0 * pred_x_0 + coef_xt * x_t
        
        # Ruido (excepto en t=0)
        noise = torch.randn_like(x_t) if t_index > 0 else 0.0
        
        return posterior_mean + torch.sqrt(posterior_var_t) * noise
    
    @torch.no_grad()
    def sample(
        self,
        model: nn.Module,
        batch_size: int,
        image_size: Tuple[int, int, int] = (4, 64, 64),
        seed: Optional[int] = None
    ) -> torch.Tensor:
        """
        Generar imágenes desde ruido puro
        """
        if seed is not None:
            torch.manual_seed(seed)
        
        # Empezar con ruido puro
        x = torch.randn(batch_size, *image_size).to(self.device)
        model.eval()
        
        # Iterar de T a 1
        for t_index in reversed(range(self.num_timesteps)):
            t = torch.full((batch_size,), t_index, dtype=torch.long).to(self.device)
            x = self.p_sample(model, x, t, t_index)
            
            # Progreso cada 100 pasos
            if t_index % 100 == 0:
                print(f"  Paso {t_index:4d}/{self.num_timesteps} completado")
        
        return x


# ============================================================
# 6. Función de entrenamiento (esqueleto)
# ============================================================
def train_step(
    model: nn.Module,
    diffusion: DiffusionProcess,
    x_0: torch.Tensor,
    optimizer: torch.optim.Optimizer,
    loss_fn: nn.Module = nn.MSELoss()
) -> Dict[str, float]:
    """Un paso de entrenamiento: predecir el ruido ε"""
    
    model.train()
    optimizer.zero_grad()
    
    batch_size = x_0.shape[0]
    
    # Muestrear pasos de tiempo aleatorios
    t = torch.randint(0, diffusion.num_timesteps, (batch_size,), device=x_0.device)
    
    # Muestrear ruido
    noise = torch.randn_like(x_0)
    
    # Forward process: agregar ruido
    x_t, noise_real = diffusion.q_sample(x_0, t, noise)
    
    # Predecir ruido
    noise_pred = model(x_t, t)
    
    # Loss: MSE entre ruido real y predicho
    loss = loss_fn(noise_pred, noise_real)
    
    # Backprop
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
    optimizer.step()
    
    return {'loss': loss.item()}


# ============================================================
# 7. EJEMPLO DE USO
# ============================================================
def main():
    print("🦜 OSAIA - UNet de Difusión en PyTorch")
    print("=" * 60)
    
    # Dispositivo
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"\\n🖥️  Dispositivo: {device.upper()}")
    if device == 'cuda':
        print(f"🎮 GPU: {torch.cuda.get_device_name(0)}")
        print(f"💾 VRAM: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
    
    # Crear modelo
    print("\\n🧠 Creando modelo UNet...")
    model = DiffusionUNet(
        in_channels=4,
        out_channels=4,
        base_channels=64,
        channel_multipliers=(1, 2, 4, 8),
        num_res_blocks=2,
        time_emb_dim=128,
        attention_levels=(1, 2)
    ).to(device)
    
    # Contar parámetros
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"📊 Total parámetros: {total_params:,}")
    print(f"🔧 Parámetros entrenables: {trainable_params:,}")
    
    # Proceso de difusión
    diffusion = DiffusionProcess(num_timesteps=1000, device=device)
    
    # Prueba rápida de forward
    print("\\n🧪 Ejecutando prueba rápida...")
    batch_size = 2
    dummy_input = torch.randn(batch_size, 4, 64, 64).to(device)
    dummy_t = torch.randint(0, 1000, (batch_size,)).to(device)
    
    with torch.no_grad():
        output = model(dummy_input, dummy_t)
    
    print(f"✅ Entrada: {dummy_input.shape} → Salida: {output.shape}")
    print(f"✅ Formatos coinciden: {dummy_input.shape == output.shape}")
    
    # Optimizer
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4, weight_decay=1e-6)
    
    print("\\n" + "=" * 60)
    print("✨ Modelo listo para entrenamiento y generación")
    print("=" * 60)
    
    return model, diffusion, optimizer


if __name__ == '__main__':
    model, diffusion, optimizer = main()
`;
}

function generateDefaultRust(prompt) {
    return `// ============================================================
// Código Rust generado por OSAIA 🦜🦀
// Solicitud: ${prompt}
// Rust 1.70+ | Edición 2021
// ============================================================

//! Gestor de datos concurrente y seguro en Rust
//! Demuestra: ownership, borrowing, traits, generics, concurrencia

use std::sync::{Arc, Mutex, RwLock};
use std::collections::HashMap;
use std::fmt::Debug;
use std::hash::Hash;
use std::thread;
use std::time::Duration;

// ============================================================
// TRAIT: Entidad almacenable
// ============================================================
pub trait Entidad: Clone + Debug + Send + Sync + 'static {
    type Id: Eq + Hash + Clone + Debug + Send + Sync;
    
    fn id(&self) -> &Self::Id;
    fn nombre(&self) -> &str;
}

// ============================================================
// STRUCT: Usuario
// ============================================================
#[derive(Debug, Clone, PartialEq)]
pub struct Usuario {
    pub id: u32,
    pub nombre: String,
    pub email: String,
    pub edad: u8,
    pub activo: bool,
}

impl Entidad for Usuario {
    type Id = u32;
    
    fn id(&self) -> &Self::Id { &self.id }
    fn nombre(&self) -> &str { &self.nombre }
}

// Implementación manual de Default
impl Default for Usuario {
    fn default() -> Self {
        Self {
            id: 0,
            nombre: String::new(),
            email: String::new(),
            edad: 0,
            activo: true,
        }
    }
}

// ============================================================
// STRUCT: GestorConcurrente<T>
// Thread-safe gracias a RwLock y Arc
// ============================================================
#[derive(Debug)]
pub struct GestorConcurrente<T: Entidad> {
    datos: RwLock<HashMap<<T as Entidad>::Id, T>>,
    contador: Mutex<u64>,
    capacidad_maxima: usize,
}

impl<T: Entidad> GestorConcurrente<T> {
    /// Constructor
    pub fn new(capacidad_maxima: usize) -> Self {
        Self {
            datos: RwLock::new(HashMap::new()),
            contador: Mutex::new(0),
            capacidad_maxima,
        }
    }
    
    /// Agregar entidad (thread-safe)
    pub fn agregar(&self, entidad: T) -> Result<bool, String> {
        let mut datos = self.datos.write()
            .map_err(|e| format!("PoisonError: {}", e))?;
        
        if datos.len() >= self.capacidad_maxima {
            return Err("Capacidad máxima alcanzada".to_string());
        }
        
        if datos.contains_key(entidad.id()) {
            return Ok(false);
        }
        
        datos.insert(entidad.id().clone(), entidad);
        
        // Incrementar contador atómicamente
        if let Ok(mut c) = self.contador.lock() {
            *c += 1;
        }
        
        Ok(true)
    }
    
    /// Obtener por ID (solo lectura, no bloquea escritores)
    pub fn obtener(&self, id: &<T as Entidad>::Id) -> Option<T> {
        let datos = self.datos.read().ok()?;
        datos.get(id).cloned()
    }
    
    /// Buscar por predicado
    pub fn buscar<F>(&self, predicado: F) -> Vec<T>
    where
        F: Fn(&T) -> bool,
    {
        let datos = self.datos.read().unwrap();
        datos.values()
            .filter(|e| predicado(e))
            .cloned()
            .collect()
    }
    
    /// Eliminar
    pub fn eliminar(&self, id: &<T as Entidad>::Id) -> bool {
        let mut datos = self.datos.write().unwrap();
        datos.remove(id).is_some()
    }
    
    /// Cantidad actual
    pub fn cantidad(&self) -> usize {
        self.datos.read().unwrap().len()
    }
    
    /// Total de operaciones
    pub fn total_operaciones(&self) -> u64 {
        *self.contador.lock().unwrap()
    }
    
    /// Obtener todos (snapshot)
    pub fn snapshot(&self) -> Vec<T> {
        self.datos.read().unwrap().values().cloned().collect()
    }
}

// ============================================================
// FUNCIÓN: Procesamiento paralelo
// ============================================================
fn procesar_en_paralelo(
    gestor: Arc<GestorConcurrente<Usuario>>,
    num_hilos: usize,
    items_por_hilo: usize
) {
    let mut hilos = Vec::with_capacity(num_hilos);
    
    for hilo_id in 0..num_hilos {
        let gestor_clon = Arc::clone(&gestor);
        
        let hilo = thread::spawn(move || {
            for i in 0..items_por_hilo {
                let id = (hilo_id * items_por_hilo + i) as u32;
                let usuario = Usuario {
                    id,
                    nombre: format!("Usuario_{}", id),
                    email: format!("usuario{}@osaia.ai", id),
                    edad: 18 + (id % 50) as u8,
                    activo: id % 2 == 0,
                };
                
                match gestor_clon.agregar(usuario) {
                    Ok(true) => { /* OK */ }
                    Ok(false) => eprintln!("⚠️  ID {} ya existe", id),
                    Err(e) => eprintln!("❌ Error hilo {}: {}", hilo_id, e),
                }
            }
            println!("✅ Hilo {} completado", hilo_id);
        });
        
        hilos.push(hilo);
    }
    
    // Esperar a todos los hilos
    for hilo in hilos {
        hilo.join().expect("El hilo falló");
    }
}

// ============================================================
// MAIN
// ============================================================
fn main() {
    println!("🦜 OSAIA - Rust Concurrente");
    println!("{}", "=".repeat(50));
    
    // Crear gestor thread-safe con capacidad para 10,000 usuarios
    let gestor = Arc::new(GestorConcurrente::<Usuario>::new(10_000));
    
    println!("\\n🚀 Lanzando procesamiento paralelo...");
    println!("   4 hilos × 250 usuarios = 1,000 operaciones concurrentes");
    
    let inicio = std::time::Instant::now();
    
    // Procesar en paralelo
    procesar_en_paralelo(Arc::clone(&gestor), 4, 250);
    
    let duracion = inicio.elapsed();
    
    println!("\\n📊 Resultados:");
    println!("   • Usuarios almacenados: {}", gestor.cantidad());
    println!("   • Operaciones totales:  {}", gestor.total_operaciones());
    println!("   • Tiempo transcurrido:  {:?}", duracion);
    
    // Buscar usuarios activos mayores de 30
    let resultados = gestor.buscar(|u| u.activo && u.edad > 30);
    println!("   • Usuarios activos >30: {}", resultados.len());
    
    // Obtener usuario específico
    if let Some(usuario) = gestor.obtener(&42) {
        println!("\\n🔍 Usuario #42:");
        println!("   {:?}", usuario);
    }
    
    println!("\\n✨ ¡Operaciones concurrentes completadas sin data races!");
    println!("   (Gracias al borrow checker de Rust 🦀)");
}

// ============================================================
// TESTS (cargo test)
// ============================================================
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_agregar_y_obtener() {
        let gestor = GestorConcurrente::<Usuario>::new(100);
        let usuario = Usuario {
            id: 1, nombre: "Test".into(), email: "t@t.com".into(),
            edad: 25, activo: true
        };
        
        assert!(gestor.agregar(usuario.clone()).unwrap());
        assert_eq!(gestor.obtener(&1), Some(usuario));
    }
    
    #[test]
    fn test_buscar() {
        let gestor = GestorConcurrente::<Usuario>::new(100);
        gestor.agregar(Usuario { id: 1, nombre: "Ana".into(), email: "a@a.com".into(), edad: 28, activo: true }).unwrap();
        gestor.agregar(Usuario { id: 2, nombre: "Luis".into(), email: "l@l.com".into(), edad: 35, activo: false }).unwrap();
        
        let activos = gestor.buscar(|u| u.activo);
        assert_eq!(activos.len(), 1);
        assert_eq!(activos[0].nombre, "Ana");
    }
    
    #[test]
    fn test_concurrencia() {
        let gestor = Arc::new(GestorConcurrente::<Usuario>::new(1000));
        procesar_en_paralelo(Arc::clone(&gestor), 4, 50);
        assert_eq!(gestor.cantidad(), 200);
    }
}
`;
}

// ===== UTILIDADES =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function typeWriterEffect(element, text) {
    element.textContent = '';
    let i = 0;
    const speed = 2; // ms por carácter
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

function copyCode() {
    const codeElement = document.querySelector('#codeOutput code');
    if (!codeElement) return;
    
    const text = codeElement.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('📋 Código copiado al portapapeles', 'success');
    }).catch(() => {
        showNotification('⚠️ No se pudo copiar', 'warning');
    });
}

function downloadCode() {
    const codeElement = document.querySelector('#codeOutput code');
    if (!codeElement) return;
    
    const text = codeElement.textContent;
    const generator = codeGenerator[currentLanguage];
    const extension = generator ? generator.extension : 'txt';
    const nombre = `osaia_${currentLanguage}_${Date.now()}.${extension}`;
    
    downloadFile(text, nombre, 'text/plain');
    showNotification(`💾 Archivo ${nombre} descargado`, 'success');
}

function downloadFile(contenido, nombre, tipo) {
    const blob = new Blob([contenido], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ===== CONFETTI =====
function triggerConfetti() {
    const colores = ['#00d4ff', '#a855f7', '#ff6b9d', '#00ff88', '#ffd700', '#ff4757'];
    
    for (let i = 0; i < 60; i++) {
        setTimeout(() => {
            const confeti = document.createElement('div');
            confeti.className = 'confetti';
            confeti.style.left = Math.random() * 100 + 'vw';
            confeti.style.background = colores[Math.floor(Math.random() * colores.length)];
            confeti.style.animationDuration = (2 + Math.random() * 2) + 's';
            confeti.style.width = (6 + Math.random() * 8) + 'px';
            confeti.style.height = (6 + Math.random() * 8) + 'px';
            document.body.appendChild(confeti);
            
            setTimeout(() => confeti.remove(), 4000);
        }, i * 25);
    }
}
