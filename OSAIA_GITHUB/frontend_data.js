/* ============================================================
   OSAIA v2.0 - Base de Conocimientos y Datos
   Arquitectura técnica completa: Python, C++, CUDA, GLSL,
   PyTorch, TensorFlow, FFmpeg, ONNX
   ============================================================ */

// ===== BASE DE CONOCIMIENTOS =====
const knowledgeBase = {
    saludos: [
        "¡Hola! Soy **OSAIA** 🦜, tu arquitecta de inteligencia artificial. ¿En qué puedo ayudarte hoy?",
        "¡Saludos! Soy OSAIA. Puedo explicarte desde cómo funciona Python en el pipeline hasta cómo FFmpeg codifica el video final. ¿Qué te interesa?",
        "¡Bienvenido! 🦜✨ Soy OSAIA. ¿Quieres hablar sobre difusión, CUDA, shaders GLSL o algún otro tema técnico?",
        "¡Hola! Preparada para orquestar todo el stack: Python → C++ → CUDA → PyTorch → FFmpeg. ¿Por dónde empezamos?"
    ],
    
    despedidas: [
        "¡Hasta luego! Fue un placer charlar sobre arquitectura de IA contigo. 🦜✨",
        "¡Adiós! Recuerda: cada paso de denoising es un paso hacia la claridad. 👋",
        "¡Nos vemos! Que tus kernels CUDA siempre retornen cudaSuccess. 🚀",
        "Hasta la próxima. Que tus gradientes siempre fluyan y tus pérdidas converjan. 📉"
    ],
    
    agradecimientos: [
        "¡De nada! 🦜 Es un placer asistirte en el fascinante mundo de la IA.",
        "¡Para servirte! Si tienes más preguntas sobre el pipeline técnico, aquí estaré.",
        "¡Un gusto! La arquitectura de IA es compleja, pero juntos la dominamos. ✨",
        "No hay de qué. Recuerda: Python orquesta, CUDA acelera, FFmpeg codifica. 🎬"
    ],
    
    queEsOsaia: `🦜 **Soy OSAIA v2.0** — una arquitectura completa de inteligencia artificial.

**Mi stack técnico de 7 capas:**

**🐍 Capa 1 — Python**
El jefe de la operación. Recibe tu prompt, lo tokeniza, ejecuta el scheduler y orquesta todo el pipeline.

**⚡ Capa 2 — C++**
Motor de alto rendimiento. Procesa frames de video a millones de píxeles por segundo. Lenguaje de los motores 3D.

**🎮 Capa 3 — CUDA**
Puente directo a la GPU NVIDIA. Desbloquea miles de núcleos para cómputo paralelo masivo.

**🎨 Capa 4 — GLSL / HLSL**
Lenguajes de shaders. Calculan cada píxel: luces, reflejos, texturas, color.

**🔥 Capa 5 — PyTorch**
Redes neuronales. El UNet predice el ruido, el VAE decodifica de latente a píxeles.

**🧠 Capa 6 — TensorFlow**
Ecosistema alternativo para despliegue empresarial y optimización TPU.

**🎬 Capa 7 — FFmpeg**
Codificador final. Toma todos los frames, los une en .mp4 con H.264/H.265 y lo comprime.

Juntas, estas capas transforman tu texto en imágenes y videos de alta calidad. ✨`,

    queEsIa: `🧠 **La Inteligencia Artificial** es el campo de la informática que busca crear sistemas capaces de realizar tareas que normalmente requieren inteligencia humana.

**En OSAIA, la IA funciona así:**

1. **Modelos de Lenguaje (LLMs)**: Entienden tu prompt en lenguaje natural
2. **Modelos de Difusión**: Generan imágenes quitando ruido paso a paso
3. **Redes Neuronales Convolucionales**: Procesan información visual
4. **Autoencoders Variacionales (VAE)**: Comprimen y descomprimen representaciones
5. **Transformers**: Arquitectura con mecanismos de atención que captura contexto

**El "truco" de la generación:**
No "crea" de la nada. Comienza con ruido aleatorio y, en cada paso, un modelo entrenado en millones de imágenes predice qué parte del ruido quitar, guiado por tu texto. Después de 20-50 iteraciones, el ruido se convierte en una imagen coherente. 🎨`,

    comoAprenderProgramacion: `📚 **Cómo aprender programación para IA** — Ruta recomendada:

**🔰 Nivel 1 — Fundamentos**
• Dominar **Python**: sintaxis, estructuras, POO, funciones
• Álgebra lineal: vectores, matrices, multiplicaciones
• Cálculo: derivadas, gradientes, regla de la cadena
• Probabilidad y estadística básica

**⚡ Nivel 2 — Herramientas**
• **NumPy** y **Pandas** para manejo de datos
• **Matplotlib** para visualización
• **Jupyter Notebooks** para experimentación

**🔥 Nivel 3 — Frameworks de IA**
• **PyTorch** (recomendado para empezar): tensores, autograd, nn.Module
• **TensorFlow/Keras**: alternativa muy usada en producción
• **HuggingFace Transformers**: modelos pre-entrenados

**🎮 Nivel 4 — Aceleración GPU**
• Conceptos básicos de **CUDA**: hilos, bloques, grids
• Cómo mover tensores a GPU: .to('cuda')
• Entender por qué la GPU es más rápida para IA

**🎬 Nivel 5 — Pipeline Completo**
• Procesamiento de datos → Entrenamiento → Inferencia → Post-procesamiento
• **FFmpeg** para manejo de video
• **FastAPI** para exponer modelos

**💡 Consejo de OSAIA:**
No te frustres al principio. La IA se construye sobre muchas capas. Empieza con modelos pre-entrenados (HuggingFace), luego ve profundizando. ¡Cada línea de código cuenta! 🦜✨`,

    lenguajesPopulares: `📊 **Lenguajes más usados en IA y su rol:**

**🥇 Python — El orquestador**
El rey indiscutible. Sintaxis clara, ecosistema enorme (PyTorch, TensorFlow, NumPy, Pandas). Ideal para prototipado rápido y control del pipeline.

**🥈 C++ — El motor de rendimiento**
Cuando la velocidad crítica importa. Se usa en los backends de PyTorch y TensorFlow, en motores de renderizado y procesamiento de video en tiempo real.

**🥉 CUDA — El puente a la GPU**
No es un lenguaje general, pero esencial. Extensión de C++ para programar GPUs NVIDIA. Sin CUDA, la IA moderna sería mucho más lenta.

**🎨 GLSL / HLSL — Shaders**
Lenguajes específicos para procesamiento gráfico. Usados en post-procesamiento de imágenes generadas, efectos visuales, upscaling neural.

**⚙️ Rust — El nuevo competidor**
Creciendo rápidamente. Seguridad de memoria + velocidad de C++. Librerías como Burn y tch-rs están ganando tracción.

**📊 SQL — Datos**
Toda IA necesita datos. SQL sigue siendo fundamental para extraer y transformar datasets de bases de datos.

**💡 Tip de OSAIA:**
No necesitas dominar todos. Empieza con **Python** profundo, luego toca **C++** si quieres ir más bajo nivel, y entiende **CUDA** conceptualmente aunque no escribas kernels a mano. 🦜`,

    consejosProductividad: `🎯 **Consejos de productividad para desarrolladores de IA:**

**1️⃣ Entrena el pipeline, no solo el modelo**
Automatiza desde la descarga de datos hasta la evaluación. Un solo comando debe ejecutar todo.

**2️⃣ Versiona TODO**
• Código: Git
• Datos: DVC / LakeFS
• Modelos: MLflow / W&B
• Experimentos: Hydra configs

**3️⃣ Monitorea la GPU constantemente**
Usa: \`nvidia-smi\`, \`nvtop\`, \`gpustat\`. El cuello de botella casi siempre está en la transferencia CPU↔GPU.

**4️⃣ Perfila antes de optimizar**
No adivines. Usa: torch.profiler, cProfile, line_profiler. El 80% del tiempo suele estar en el 20% del código.

**5️⃣ Batch size es tu amigo**
Maximiza el uso de memoria GPU. Si tienes VRAM sobrante, aumenta el batch y acelera el entrenamiento.

**6️⃣ Mixed Precision (FP16/BF16)**
Casi duplica la velocidad con mínima pérdida de precisión. En PyTorch: torch.cuda.amp.

**7️⃣ Usa workers en DataLoader**
num_workers > 0 y pin_memory=True evitan que la GPU espere a los datos.

**8️⃣ Duerme bien 🛌**
Los modelos entrenan mejor cuando tú descansas. Y los bugs aparecen menos con mente fresca.

**💡 Regla de OSAIA:**
Primero haz que funcione. Luego haz que funcione bien. Luego haz que funcione rápido. En ese orden. 🚀`,

    // ===== CONOCIMIENTO TÉCNICO ESPECÍFICO =====
    python: `🐍 **Python en el pipeline de OSAIA:**

**Rol principal:** Orquestador de toda la operación.

**Responsabilidades:**
• Recibir y validar el prompt del usuario
• Tokenizar texto usando CLIP/T5 tokenizer
• Cargar modelos desde disco o caché
• Configurar el scheduler (Euler, DPM++, DDIM)
• Ejecutar el loop de denoising paso a paso
• Gestionar memoria GPU (torch.cuda.empty_cache)
• Llamar al VAE decoder al final
• Guardar la imagen resultante
• Manejar errores y logging

**Librerías clave:**
• **torch / torchvision**: Core del framework
• **diffusers**: Pipeline de HuggingFace
• **transformers**: Modelos de lenguaje
• **accelerate**: Multi-GPU y optimizaciones
• **numpy**: Operaciones numéricas
• **Pillow**: I/O de imágenes
• **FastAPI**: Exponer endpoints REST
• **celery**: Colas de trabajo asíncronas

**Flujo típico:**
\`\`\`python
# 1. Cargar modelos
pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
    use_safetensors=True
).to("cuda")

# 2. Configurar scheduler
pipe.scheduler = DPMSolverMultistepScheduler.from_config(
    pipe.scheduler.config
)

# 3. Generar
image = pipe(
    prompt="Un quetzal majestuoso...",
    negative_prompt="borroso, baja calidad",
    num_inference_steps=30,
    guidance_scale=7.5,
    generator=torch.Generator("cuda").manual_seed(42)
).images[0]

# 4. Guardar
image.save("output.png")
\`\`\`

Python es el "cerebro director" que coordina todas las demás capas técnicas. 🎯`,

    cpp: `⚡ **C++ en OSAIA — Motor de alto rendimiento:**

**¿Por qué C++ cuando tenemos Python?**
Velocidad. C++ es 10-50× más rápido que Python para cómputo intensivo.

**Rol en el pipeline:**
• Procesamiento de frames de video a alta velocidad
• Backend de los frameworks de IA (PyTorch y TF están escritos en C++)
• Operaciones de bajo nivel sobre buffers de píxeles
• Integración con FFmpeg (libavcodec, libavformat)
• Motores de renderizado 3D (Unreal, Unity, Blender usan C++)
• Cálculo de estructuras de datos espaciales

**Características clave:**
• **Control manual de memoria**: new/delete, smart pointers
• **Templates**: Programación genérica eficiente
• **RAII**: Gestión automática de recursos
• **STL**: Contenedores optimizados (vector, map, unordered_map)
• **Multithreading**: std::thread, OpenMP, TBB
• **SIMD**: Instrucciones vectoriales (SSE, AVX, AVX-512)

**Ejemplo: Procesamiento de imagen**
\`\`\`cpp
// Procesa cada píxel en paralelo con OpenMP
#pragma omp parallel for
for (int y = 0; y < height; ++y) {
    for (int x = 0; x < width; ++x) {
        const int idx = (y * width + x) * 3;
        // Operaciones por píxel: ajuste de brillo, contraste, etc.
        pixels[idx + 0] = std::clamp(pixels[idx + 0] * 1.1f, 0.0f, 255.0f);
        pixels[idx + 1] = std::clamp(pixels[idx + 1] * 1.1f, 0.0f, 255.0f);
        pixels[idx + 2] = std::clamp(pixels[idx + 2] * 1.1f, 0.0f, 255.0f);
    }
}
\`\`\`

C++ es el "músculo" que mueve millones de píxeles por segundo sin congelar la computadora. 💪`,

    cuda: `🎮 **CUDA — El puente hacia la GPU:**

**¿Qué es CUDA?**
Compute Unified Device Architecture. Extensión de C++ creada por NVIDIA para programar GPUs directamente.

**¿Por qué es crucial para la IA?**
Una GPU moderna tiene **miles de núcleos** (una RTX 4090 tiene 16,384 núcleos CUDA). Pueden ejecutar la misma operación en paralelo sobre diferentes datos. Ideal para las operaciones matriciales de las redes neuronales.

**Conceptos clave:**
• **Kernel**: Función que se ejecuta en la GPU
• **Thread**: Hilo de ejecución más pequeño
• **Block**: Grupo de hilos que cooperan
• **Grid**: Conjunto de bloques
• **Global Memory**: VRAM de la GPU (lenta, grande)
• **Shared Memory**: Memoria compartida por bloque (rápida, pequeña)
• **Warp**: 32 hilos que se ejecutan en lockstep

**Ejemplo: Suma de vectores**
\`\`\`cpp
// Kernel CUDA: cada hilo suma un elemento
__global__ void vectorAdd(const float* A, const float* B, float* C, int N) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < N) {
        C[idx] = A[idx] + B[idx];
    }
}

// CPU code
int main() {
    const int N = 1 << 20;  // 1 millón
    const int blockSize = 256;
    const int gridSize = (N + blockSize - 1) / blockSize;
    
    // Reservar memoria en GPU
    float *d_A, *d_B, *d_C;
    cudaMalloc(&d_A, N * sizeof(float));
    cudaMalloc(&d_B, N * sizeof(float));
    cudaMalloc(&d_C, N * sizeof(float));
    
    // Copiar datos CPU → GPU
    cudaMemcpy(d_A, h_A, N * sizeof(float), cudaMemcpyHostToDevice);
    cudaMemcpy(d_B, h_B, N * sizeof(float), cudaMemcpyHostToDevice);
    
    // Lanzar kernel
    vectorAdd<<<gridSize, blockSize>>>(d_A, d_B, d_C, N);
    
    // Copiar resultado GPU → CPU
    cudaMemcpy(h_C, d_C, N * sizeof(float), cudaMemcpyDeviceToHost);
    
    cudaFree(d_A); cudaFree(d_B); cudaFree(d_C);
}
\`\`\`

**Librerías CUDA para IA:**
• **cuDNN**: Redes neuronales convolucionales optimizadas
• **cuBLAS**: Álgebra lineal básica
• **TensorRT**: Optimización e inferencia de modelos
• **NCCL**: Comunicación multi-GPU

CUDA es lo que hace posible que generar una imagen tarde segundos y no horas. 🚀`,

    glsl: `🎨 **GLSL — Lenguaje de Shaders:**

**¿Qué es GLSL?**
OpenGL Shading Language. Lenguaje de alto nivel con sintaxis tipo C que se ejecuta directamente en la GPU para controlar el pipeline gráfico.

**Tipos de shaders principales:**
• **Vertex Shader**: Procesa cada vértice (posición, transformaciones)
• **Fragment Shader (Pixel Shader)**: Procesa cada píxel (color, texturas, iluminación)
• **Compute Shader**: Procesamiento GPGPU arbitrario
• **Geometry Shader**: Genera nueva geometría
• **Tessellation Shaders**: Subdivide geometría

**Rol en OSAIA:**
• Post-procesamiento de imágenes generadas
• Corrección de color y tonos
• Upscaling neural (ESRGAN)
• Motion blur para video
• Depth of field simulado
• Efectos de partículas
• Mapeo de tonos HDR → LDR

**Ejemplo: Fragment Shader para corrección de color**
\`\`\`glsl
#version 450 core

layout(location = 0) in vec2 v_texCoord;
layout(location = 0) out vec4 fragColor;

uniform sampler2D u_texture;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_saturation;
uniform vec3  u_tint;

// RGB → HSV
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// HSV → RGB
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec3 color = texture(u_texture, v_texCoord).rgb;
    
    // Brillo
    color += u_brightness;
    
    // Contraste
    color = (color - 0.5) * u_contrast + 0.5;
    
    // Saturación
    vec3 hsv = rgb2hsv(color);
    hsv.y *= u_saturation;
    color = hsv2rgb(hsv);
    
    // Tinte
    color *= u_tint;
    
    fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
\`\`\`

GLSL habla directo con la GPU y calcula el color de cada píxel individual. Es el "pintor" detallista del pipeline. 🖌️`,

    pytorch: `🔥 **PyTorch — Redes Neuronales en Acción:**

**¿Qué es PyTorch?**
Framework de deep learning desarrollado por Meta. Es el estándar de facto en investigación de IA por su flexibilidad y facilidad de uso.

**Rol en OSAIA:**
• **UNet**: El corazón del modelo de difusión. Predice el ruido en cada paso
• **VAE (Variational Autoencoder)**: Codifica/decodifica entre espacio de píxeles y espacio latente
• **Text Encoder**: Convierte texto en embeddings (CLIP, T5)
• **Scheduler**: Controla el proceso de denoising (Euler, DPM++, DDIM, etc.)
• **LoRA adapters**: Fine-tuning eficiente de modelos grandes

**Conceptos clave:**
• **Tensor**: Array multidimensional (como ndarray pero en GPU)
• **Autograd**: Diferenciación automática para backpropagation
• **nn.Module**: Clase base para redes neuronales
• **DataLoader**: Carga de datos en batches paralela
• **Optimizer**: Actualiza pesos (Adam, SGD, AdamW)

**Ejemplo: Mini UNet para difusión**
\`\`\`python
import torch
import torch.nn as nn
import torch.nn.functional as F

class ResidualBlock(nn.Module):
    """Bloque residual con GroupNorm y SiLU"""
    def __init__(self, in_channels, out_channels, time_emb_dim=32):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, 3, padding=1)
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3, padding=1)
        self.norm1 = nn.GroupNorm(8, out_channels)
        self.norm2 = nn.GroupNorm(8, out_channels)
        self.time_proj = nn.Linear(time_emb_dim, out_channels)
        
        if in_channels != out_channels:
            self.skip = nn.Conv2d(in_channels, out_channels, 1)
        else:
            self.skip = nn.Identity()
    
    def forward(self, x, t_emb):
        residual = self.skip(x)
        
        h = self.norm1(x)
        h = F.silu(h)
        h = self.conv1(h)
        
        # Agregar embedding de tiempo
        t_emb = self.time_proj(F.silu(t_emb))
        h = h + t_emb[:, :, None, None]
        
        h = self.norm2(h)
        h = F.silu(h)
        h = self.conv2(h)
        
        return h + residual

class MiniUNet(nn.Module):
    """UNet simplificado para difusión"""
    def __init__(self, in_channels=4, base_channels=64):
        super().__init__()
        
        # Embedding de paso de tiempo
        self.time_mlp = nn.Sequential(
            nn.Linear(32, 128),
            nn.SiLU(),
            nn.Linear(128, 32)
        )
        
        # Encoder (downsampling)
        self.enc1 = ResidualBlock(in_channels, base_channels)
        self.enc2 = ResidualBlock(base_channels, base_channels * 2)
        self.enc3 = ResidualBlock(base_channels * 2, base_channels * 4)
        
        # Bottleneck
        self.bottleneck = ResidualBlock(base_channels * 4, base_channels * 4)
        
        # Decoder (upsampling)
        self.dec3 = ResidualBlock(base_channels * 8, base_channels * 2)
        self.dec2 = ResidualBlock(base_channels * 4, base_channels)
        self.dec1 = ResidualBlock(base_channels * 2, base_channels)
        
        # Salida: predice ruido
        self.final = nn.Conv2d(base_channels, in_channels, 1)
        
        self.down = nn.MaxPool2d(2)
        self.up = nn.Upsample(scale_factor=2, mode='nearest')
    
    def forward(self, x, t):
        # t: tensor de tiempos (batch_size,)
        t_emb = self.time_mlp(self.sinusoidal_embedding(t))
        
        # Encoder
        e1 = self.enc1(x, t_emb)
        e2 = self.enc2(self.down(e1), t_emb)
        e3 = self.enc3(self.down(e2), t_emb)
        
        # Bottleneck
        b = self.bottleneck(self.down(e3), t_emb)
        
        # Decoder con skip connections
        d3 = self.dec3(torch.cat([self.up(b), e3], dim=1), t_emb)
        d2 = self.dec2(torch.cat([self.up(d3), e2], dim=1), t_emb)
        d1 = self.dec1(torch.cat([self.up(d2), e1], dim=1), t_emb)
        
        return self.final(d1)
    
    @staticmethod
    def sinusoidal_embedding(t, dim=32):
        """Embedding sinusoidal de tiempo"""
        half = dim // 2
        freqs = torch.exp(-torch.arange(half) * torch.log(torch.tensor(10000.0)) / (half - 1))
        args = t[:, None] * freqs[None, :].to(t.device)
        return torch.cat([torch.sin(args), torch.cos(args)], dim=-1)
\`\`\`

PyTorch contiene las redes neuronales que ya aprendieron cómo se ve un gato, un coche o el espacio. Hacen el truco de quitar el "ruido" borroso para dejar una foto nítida. 🧠✨`,

    tensorflow: `🧠 **TensorFlow / Keras — Ecosistema de Google:**

**¿Qué es TensorFlow?**
Framework de deep learning desarrollado por Google. Muy fuerte en producción, despliegue multiplataforma y optimización para TPU.

**Rol en el ecosistema:**
• Modelos de lenguaje y visión listos para producción
• **TensorFlow Lite**: Despliegue en móviles y edge devices
• **TFX (TensorFlow Extended)**: Pipelines de producción completos
• **Keras**: API de alto nivel para construir modelos rápidamente
• **Model Garden**: Modelos pre-entrenados oficiales
• **TPU optimization**: Aceleración en chips Tensor de Google

**Ejemplo: VAE simple en Keras**
\`\`\`python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

class Sampling(layers.Layer):
    """Capa de muestreo: z = μ + σ·ε"""
    def call(self, inputs):
        z_mean, z_log_var = inputs
        batch = tf.shape(z_mean)[0]
        dim = tf.shape(z_mean)[1]
        epsilon = tf.random.normal(shape=(batch, dim))
        return z_mean + tf.exp(0.5 * z_log_var) * epsilon

def build_encoder(latent_dim=2):
    encoder_inputs = keras.Input(shape=(28, 28, 1))
    x = layers.Conv2D(32, 3, activation="relu", strides=2, padding="same")(encoder_inputs)
    x = layers.Conv2D(64, 3, activation="relu", strides=2, padding="same")(x)
    x = layers.Flatten()(x)
    x = layers.Dense(16, activation="relu")(x)
    
    z_mean = layers.Dense(latent_dim, name="z_mean")(x)
    z_log_var = layers.Dense(latent_dim, name="z_log_var")(x)
    z = Sampling()([z_mean, z_log_var])
    
    return keras.Model(encoder_inputs, [z_mean, z_log_var, z], name="encoder")

def build_decoder(latent_dim=2):
    latent_inputs = keras.Input(shape=(latent_dim,))
    x = layers.Dense(7 * 7 * 64, activation="relu")(latent_inputs)
    x = layers.Reshape((7, 7, 64))(x)
    x = layers.Conv2DTranspose(64, 3, activation="relu", strides=2, padding="same")(x)
    x = layers.Conv2DTranspose(32, 3, activation="relu", strides=2, padding="same")(x)
    decoder_outputs = layers.Conv2DTranspose(1, 3, activation="sigmoid", padding="same")(x)
    
    return keras.Model(latent_inputs, decoder_outputs, name="decoder")

# VAE completo
class VAE(keras.Model):
    def __init__(self, encoder, decoder, **kwargs):
        super().__init__(**kwargs)
        self.encoder = encoder
        self.decoder = decoder
    
    def train_step(self, data):
        with tf.GradientTape() as tape:
            z_mean, z_log_var, z = self.encoder(data)
            reconstruction = self.decoder(z)
            
            # Loss de reconstrucción
            reconstruction_loss = tf.reduce_mean(
                keras.losses.binary_crossentropy(data, reconstruction)
            ) * 28 * 28
            
            # Divergencia KL
            kl_loss = -0.5 * tf.reduce_mean(
                1 + z_log_var - tf.square(z_mean) - tf.exp(z_log_var)
            )
            
            total_loss = reconstruction_loss + kl_loss
        
        grads = tape.gradient(total_loss, self.trainable_weights)
        self.optimizer.apply_gradients(zip(grads, self.trainable_weights))
        
        return {"loss": total_loss, "recon_loss": reconstruction_loss, "kl_loss": kl_loss}
\`\`\`

**PyTorch vs TensorFlow:**
• **PyTorch**: Investigación, flexibilidad, debugging dinámico, HuggingFace
• **TensorFlow**: Producción, despliegue, TPU, móviles, ecosistema empresarial

En OSAIA usamos PyTorch para el pipeline de generación, pero TensorFlow es una alternativa válida y potente. 🛠️`,

    ffmpeg: `🎬 **FFmpeg — El codificador final:**

**¿Qué es FFmpeg?**
Herramienta de línea de comandos y conjunto de librerías (libavcodec, libavformat, libavutil) para manipular audio y video. Es el estándar de facto en la industria.

**Rol en OSAIA:**
• Recibe secuencia de frames PNG generados por la IA
• Los codifica usando codecs eficientes (H.264, H.265, VP9, AV1)
• Los empaqueta en contenedores (.mp4, .webm, .mov)
• Aplica compresión para reducir tamaño sin perder calidad perceptible
• Opcionalmente agrega audio, subtítulos, metadatos
• Genera versiones en múltiples resoluciones (adaptative streaming)

**Comandos esenciales:**

\`\`\`bash
# 1. Secuencia de imágenes → Video MP4 (H.264)
ffmpeg -framerate 24 -i frame_%04d.png \
    -c:v libx264 -preset slow -crf 18 \
    -pix_fmt yuv420p \
    output.mp4

# 2. Video de alta calidad (H.265 / HEVC) — 50% menos tamaño
ffmpeg -framerate 30 -i frame_%04d.png \
    -c:v libx265 -preset medium -x265-params crf=20 \
    -pix_fmt yuv420p10le \
    output_hevc.mp4

# 3. Animación suave con interpolación de frames
ffmpeg -i input.mp4 \
    -filter:v "minterpolate=fps=60:mi_mode=mci" \
    -c:v libx264 -crf 18 \
    output_60fps_smooth.mp4

# 4. Agregar audio al video
ffmpeg -i video_silent.mp4 -i soundtrack.wav \
    -c:v copy -c:a aac -b:a 192k \
    -shortest \
    output_with_audio.mp4

# 5. Crear versión web optimizada (faststart)
ffmpeg -i input.mp4 \
    -c:v libx264 -preset fast -crf 23 \
    -movflags +faststart \
    web_ready.mp4

# 6. Resoluciones múltiples para streaming
ffmpeg -i input.mp4 \
    -vf scale=1920:1080 -c:v libx264 -crf 20 output_1080p.mp4 \
    -vf scale=1280:720  -c:v libx264 -crf 22 output_720p.mp4 \
    -vf scale=854:480   -c:v libx264 -crf 25 output_480p.mp4
\`\`\`

**Codecs comunes:**
• **H.264 (AVC)**: Compatibilidad universal, buen equilibrio
• **H.265 (HEVC)**: 50% mejor compresión, menos compatible
• **AV1**: Nuevo codec abierto, mejor compresión, lento de codificar
• **VP9**: Google, buen equilibrio, usado en YouTube/WebM

**Integración C++:**
\`\`\`cpp
extern "C" {
#include <libavcodec/avcodec.h>
#include <libavformat/avformat.h>
#include <libswscale/swscale.h>
}

// Pipeline básico:
// 1. av_register_all() → obsoleto en nuevas versiones
// 2. avformat_alloc_output_context2()
// 3. avio_open()
// 4. avformat_new_stream()
// 5. avcodec_find_encoder(AV_CODEC_ID_H264)
// 6. avcodec_open2()
// 7. Para cada frame: avcodec_send_frame() / avcodec_receive_packet()
// 8. av_interleaved_write_frame()
// 9. av_write_trailer()
// 10. avio_close() / avformat_free_context()
\`\`\`

FFmpeg es la herramienta "oculta" que une todas las imágenes dibujadas por la IA en el video final comprimido y listo para reproducir. 🎬✨`,

    diffusion: `🎨 **Cómo funciona el proceso de Difusión:**

**La idea central:**
Generar imágenes quitando ruido gradualmente, guiado por texto.

**Fase 1: Forward Process (entrenamiento)**
1. Toma una imagen limpia x₀
2. Agrega un poco de ruido gaussiano: x₁ = √(1-β₁)·x₀ + √β₁·ε
3. Repite T veces (ej: T=1000)
4. Al final x_T es prácticamente ruido puro

**Fase 2: Reverse Process (generación) — Lo que hace OSAIA**
1. Empieza con x_T = ruido aleatorio puro
2. En cada paso t (de T a 1):
   a. El modelo UNet predice el ruido ε_θ(x_t, t, prompt)
   b. Se resta una porción de ese ruido: x_{t-1} = (x_t - β_t·ε_θ) / √(1-β_t) + σ_t·z
   c. z es ruido aleatorio pequeño (excepto en el último paso)
3. Después de T pasos, obtienes x₀ = imagen limpia

**Paso a paso detallado en OSAIA:**

\`\`\`
Paso 0: [████████████████████] 100% ruido
        (puro caos aleatorio)
          ↓ CLIP text embedding guía el proceso
Paso 5: [██████████████████░░] 90% ruido
        (apenas se distinguen formas borrosas)
          ↓ UNet predice qué quitar
Paso 15: [██████████████░░░░░░] 70% ruido
        (estructuras básicas emergen)
          ↓ cada paso es más refinado
Paso 30: [█████████░░░░░░░░░░░] 45% ruido
        (formas reconocibles, colores definidos)
          ↓ detalles finos aparecen
Paso 45: [████░░░░░░░░░░░░░░░░] 20% ruido
        (casi completo, texturas nítidas)
          ↓ último ajuste
Paso 50: [░░░░░░░░░░░░░░░░░░░░] 0% ruido
        (¡Imagen final limpia y detallada!) ✨
\`\`\`

**Componentes clave:**
• **UNet**: Arquitectura encoder-decoder con skip connections. El "cerebro" que predice el ruido
• **Timestep Embedding**: Le dice al modelo en qué paso está (sinusoidal)
• **Text Encoder (CLIP)**: Convierte tu prompt en vectores que guían la generación
• **Classifier-Free Guidance**: Mezcla predicción condicionada e incondicionada para mayor fidelidad
• **Scheduler**: Controla cómo disminuye el nivel de ruido (Euler, DPM++, DDIM, etc.)

**¿Por qué funciona tan bien?**
Porque el modelo no tiene que "inventar" una imagen completa de golpe. Solo tiene que resolver un problema más fácil en cada paso: predecir una pequeña porción de ruido para quitar. ¡El resultado acumulado es impresionante! 🎨✨`
};

// ===== RESPUESTAS POR PATRONES =====
const patternResponses = {
    'hora': [
        `🕐 Son las **${new Date().toLocaleTimeString('es-ES')}** en tu reloj local.`,
        `⏰ La hora actual es **${new Date().toLocaleTimeString('es-ES')}**. ¡Aprovecha el día!`,
        `⌚ Según tu sistema: **${new Date().toLocaleTimeString('es-ES')}**.`
    ],
    'fecha': [
        `📅 Hoy es **${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**.`,
        `🗓️ Estamos a **${new Date().toLocaleDateString('es-ES')}**.`
    ],
    'nombre': [
        `Me llamo **OSAIA** 🦜 — Arquitectura de Inteligencia Artificial.`,
        `Soy **OSAIA** v2.0. Tu asistente de IA técnica. 🦜✨`
    ],
    'quien eres': [knowledgeBase.queEsOsaia],
    'que eres': [knowledgeBase.queEsOsaia],
    'qué eres': [knowledgeBase.queEsOsaia],
    'que puedes hacer': [
        `🦜 **OSAIA** puede ayudarte en múltiples frentes técnicos:\n\n• 💬 **Conversar** sobre arquitectura de IA, modelos, difusión\n• 💻 **Generar código** en Python, C++, CUDA, GLSL, PyTorch, TensorFlow, y más\n• 🎨 **Explicar** el proceso completo de generación de imágenes\n• 🎬 **Detallar** cómo FFmpeg codifica el video final\n• 🔬 **Describir** cada capa del stack técnico\n• 📊 **Analizar** datos y estructurar información\n• 🔢 **Resolver** problemas matemáticos y cálculos\n• ✍️ **Redactar** documentación técnica\n• 🌐 **Traducir** entre múltiples idiomas\n\n¿Por dónde quieres empezar? 🚀`
    ],
    'cómo te llamas': [
        `Me llamo **OSAIA** 🦜. Arquitectura de Inteligencia Artificial.`,
        `Soy **OSAIA**. El nombre evoca la sinfonía orquestada de Python, C++, CUDA, PyTorch... ✨`
    ],
    'gracias': knowledgeBase.agradecimientos,
    'adios': knowledgeBase.despedidas,
    'hola': knowledgeBase.saludos,
    'buenos dias': knowledgeBase.saludos,
    'buenas tardes': knowledgeBase.saludos,
    'buenas noches': knowledgeBase.saludos,
    'chiste': [
        `😄 ¡Claro! Aquí va uno técnico:\n\n¿Por qué el desarrollador de IA se confundió de navidad y halloween?\n\nPorque **Oct 31 = Dec 25** 🎃🎄\n\n(En notación octal 31 = decimal 25) 😂`,
        `😄 Aquí tienes uno de CUDA:\n\n¿Cuántos núcleos GPU se necesitan para cambiar una bombilla?\n\n¡Ninguno! ¡Todos se iluminan en paralelo! 💡💡💡💡💡... (16,384 veces)`,
        `😄 Chiste de machine learning:\n\n— ¿Por qué el modelo de deep learning no cruzó la carretera?\n— Porque se sobreajustó a los datos de entrenamiento y nunca había visto una carretera así. 🤖🛣️`
    ],
    'traduce': [
        `🌐 ¡Claro! Dime qué quieres traducir y a qué idioma.\n\n**Ejemplo:** "Traduce al inglés: Hola mundo, soy OSAIA"\n\nO usa el modo **Traductor** en el panel izquierdo para acceso rápido.`
    ],
    'python': [knowledgeBase.python],
    'c++': [knowledgeBase.cpp],
    'cuda': [knowledgeBase.cuda],
    'glsl': [knowledgeBase.glsl],
    'pytorch': [knowledgeBase.pytorch],
    'tensorflow': [knowledgeBase.tensorflow],
    'ffmpeg': [knowledgeBase.ffmpeg],
    'difusión': [knowledgeBase.diffusion],
    'diffusion': [knowledgeBase.diffusion],
    'cómo funciona': [
        `🔬 **OSAIA funciona mediante un pipeline de 8 capas orquestadas:**\n\n1️⃣ **Python** recibe tu prompt y lo tokeniza con CLIP\n2️⃣ **Embedding de texto** guía todo el proceso\n3️⃣ **Ruido aleatorio** inicial en el espacio latente\n4️⃣ **PyTorch UNet** predice ruido a quitar (20-50 pasos)\n5️⃣ **CUDA** acelera todo en miles de núcleos GPU\n6️⃣ **VAE Decoder** expande de latente a píxeles\n7️⃣ **GLSL shaders** aplican post-procesamiento\n8️⃣ **FFmpeg** codifica el video final (si aplica)\n\n¿Quieres que profundice en alguna capa específica? 🦜`
    ],
    'matematicas': [
        `🔢 ¡Claro que puedo ayudarte con matemáticas!\n\nPuedo resolver:\n• Aritmética básica y porcentajes\n• Ecuaciones lineales y cuadráticas\n• Cálculo de derivadas e integrales básicas\n• Estadística: promedio, mediana, desviación\n• Geometría: áreas, volúmenes, Pitágoras\n• Probabilidad básica\n• Álgebra matricial\n\nSimplemente escribe tu problema. Por ejemplo:\n• "Cuánto es el 15% de 2500"\n• "Resuelve 2x + 7 = 22"\n• "La hipotenusa de 3 y 4"`
    ],
    'explicame': [
        `¡Claro que sí! 🦜\n\nPuedo explicarte:\n• 🐍 Cómo funciona Python en el pipeline\n• ⚡ Qué rol cumple C++\n• 🎮 Por qué CUDA acelera la IA\n• 🎨 Cómo trabajan los shaders GLSL\n• 🔥 Arquitectura de PyTorch\n• 🎬 Cómo codifica FFmpeg\n• 🎨 El proceso completo de difusión\n• 🧠 Conceptos de redes neuronales\n\n¿Qué tema te gustaría explorar hoy?`
    ]
};

// ===== PLANTILLAS DE CÓDIGO =====
const codeTemplates = {
    python: {
        email_validator: `# Validador de emails profesional
import re
from typing import Optional

class EmailValidator:
    """Validador de correos electrónicos según RFC 5322 simplificado"""
    
    PATRON = re.compile(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
    )
    
    @classmethod
    def validar(cls, email: str) -> tuple[bool, Optional[str]]:
        if not email or not isinstance(email, str):
            return False, "El email no puede estar vacío"
        
        if len(email) > 254:
            return False, "Email demasiado largo"
        
        if not cls.PATRON.match(email.strip()):
            return False, "Formato de email inválido"
        
        return True, None

# Uso
valido, error = EmailValidator.validar("usuario@dominio.com")
print(f"Válido: {valido}, Error: {error}")`,
        
        calculadora: `# Calculadora Python completa
class Calculadora:
    """Calculadora con operaciones básicas y avanzadas"""
    
    @staticmethod
    def suma(a, b): return a + b
    
    @staticmethod
    def resta(a, b): return a - b
    
    @staticmethod
    def multiplicacion(a, b): return a * b
    
    @staticmethod
    def division(a, b):
        if b == 0: raise ZeroDivisionError("División por cero")
        return a / b
    
    @staticmethod
    def potencia(base, exponente): return base ** exponente
    
    @staticmethod
    def porcentaje(total, porciento): return (total * porciento) / 100

# Uso
calc = Calculadora()
print(f"15 + 7 = {calc.suma(15, 7)}")
print(f"20% de 500 = {calc.porcentaje(500, 20)}")`,
        
        fibonacci: `# Secuencia de Fibonacci optimizada
from functools import lru_cache

@lru_cache(maxsize=None)
def fibonacci(n: int) -> int:
    """Retorna el n-ésimo número de Fibonacci (memoizado)"""
    if n < 0:
        raise ValueError("n debe ser >= 0")
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

def generar_secuencia(cantidad: int) -> list:
    return [fibonacci(i) for i in range(cantidad)]

# Uso
print(generar_secuencia(15))
# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377]`
    },
    
    javascript: {
        email_validator: `// Validador de emails en JavaScript
class EmailValidator {
    static PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
    
    static validar(email) {
        if (!email || typeof email !== 'string') {
            return { valido: false, error: 'Email inválido' };
        }
        
        if (email.length > 254) {
            return { valido: false, error: 'Demasiado largo' };
        }
        
        return {
            valido: this.PATTERN.test(email.trim()),
            error: null
        };
    }
}

// Uso
const resultado = EmailValidator.validar('test@email.com');
console.log(resultado);`,
        
        api_rest: `// API REST con Express (Node.js)
const express = require('express');
const app = express();
app.use(express.json());

// Base de datos en memoria
const usuarios = new Map();
let idCounter = 1;

// Middleware de logging
app.use((req, res, next) => {
    console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.path}\`);
    next();
});

// CRUD
app.post('/api/usuarios', (req, res) => {
    const { nombre, email } = req.body;
    if (!nombre || !email) {
        return res.status(400).json({ error: 'Datos incompletos' });
    }
    const usuario = { id: idCounter++, nombre, email, creado: new Date() };
    usuarios.set(usuario.id, usuario);
    res.status(201).json(usuario);
});

app.get('/api/usuarios', (req, res) => {
    res.json(Array.from(usuarios.values()));
});

app.get('/api/usuarios/:id', (req, res) => {
    const usuario = usuarios.get(parseInt(req.params.id));
    usuario ? res.json(usuario) : res.status(404).json({ error: 'No encontrado' });
});

app.put('/api/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (!usuarios.has(id)) return res.status(404).json({ error: 'No encontrado' });
    const actualizado = { ...usuarios.get(id), ...req.body, id };
    usuarios.set(id, actualizado);
    res.json(actualizado);
});

app.delete('/api/usuarios/:id', (req, res) => {
    const eliminado = usuarios.delete(parseInt(req.params.id));
    eliminado ? res.json({ mensaje: 'Eliminado' }) : res.status(404).json({ error: 'No encontrado' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`API en puerto \${PORT}\`));`
    }
};

// ===== DATOS PARA GRÁFICOS =====
const adminChartData = {
    activity: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        messages: [1240, 1890, 2150, 1980, 2450, 1670, 1430],
        images: [320, 480, 560, 510, 620, 410, 380],
        codes: [410, 620, 780, 690, 820, 540, 470]
    },
    modules: {
        labels: ['Chat IA', 'Código', 'Imágenes', 'Archivos', 'Voz', 'Admin'],
        data: [38, 22, 18, 12, 7, 3],
        colors: ['#ffffff', '#e5e5e5', '#c0c0c0', '#a8a8a8', '#888888', '#d4af37']
    },
    languages: {
        labels: ['Python', 'C++', 'CUDA', 'GLSL', 'PyTorch', 'JavaScript', 'SQL', 'Rust'],
        data: [452, 287, 198, 156, 341, 389, 234, 112],
        colors: ['#ffffff', '#e5e5e5', '#c0c0c0', '#a8a8a8', '#888888', '#666666', '#555555', '#d4af37']
    },
    responseTime: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        data: [1.2, 0.8, 2.4, 3.8, 4.2, 2.1]
    }
};

// ===== IMÁGENES DE EJEMPLO =====
const sampleImages = [
    {
        prompt: "Paisaje montañoso con niebla al amanecer",
        style: "realistic",
        size: "landscape",
        url: "https://picsum.photos/seed/osaia1/800/500"
    },
    {
        prompt: "Retrato artístico en blanco y negro",
        style: "noir",
        size: "portrait",
        url: "https://picsum.photos/seed/osaia2/500/750"
    },
    {
        prompt: "Arquitectura moderna minimalista",
        style: "cinematic",
        size: "square",
        url: "https://picsum.photos/seed/osaia3/600/600"
    },
    {
        prompt: "Detalle macro de textura natural",
        style: "realistic",
        size: "square",
        url: "https://picsum.photos/seed/osaia4/600/600"
    }
];

// ===== MENSAJES QUETZAL =====
const quetzalMessages = [
    "🦜 Soy OSAIA. Python orquesta, CUDA acelera, FFmpeg codifica.",
    "Pregúntame sobre difusión, CUDA kernels o shaders GLSL ✨",
    "El pipeline: ruido → UNet denoise → VAE decode → píxeles 🎨",
    "¿Sabías? Una RTX 4090 tiene 16,384 núcleos CUDA 🎮",
    "Explora la sección Arquitectura para ver todo el pipeline 🔬",
    "Genero código en Python, C++, CUDA, PyTorch y más 💻",
    "FFmpeg: el artesano que une frames en video .mp4 🎬",
    "Cada paso de denoising revela un poco más la imagen ✨"
];
