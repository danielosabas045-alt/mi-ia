# Registro de cambios — OSAIA AI

## 2026-11-20 — Alojamiento de OSAIA AI Web en Render

- Se creó el servicio gratuito independiente `osaia-ai-web` en Render, enlazado a `danielosabas045-alt/mi-ia` (main); no se modificó EMA.
- El primer despliegue del backend informó estado `live`, pero su ruta `/` devolvía 404 por diseño: solo atendía `/health` y `/api/chat`.
- Se añadió publicación segura de la interfaz y archivos públicos por lista explícita en el mismo servicio Node; ningún archivo de servidor, pruebas o secretos se expone como estático.
- Se aceptó el origen conocido de Render para las peticiones del navegador y se añadió una prueba que cubre página principal, recursos estáticos, rutas privadas, CORS y ausencia de credenciales del proveedor.
- En Ajustes de la web se sugiere la ruta de chat del propio Render sin activarla automáticamente: se requiere consentimiento explícito antes de transmitir conversaciones.
- La compilación ahora ejecuta comprobación de sintaxis y pruebas automatizadas; un fallo debe impedir publicar una nueva compilación.
- Pendiente: confirmar HTTP público tras el nuevo despliegue, configurar `OPENAI_API_KEY` de manera privada y probar respuestas reales. No existe APK Android firmada y comprobada.
- Commits: `809bded5f1129fc5bbaa63e4295dd1525c1b9b49`, `12e7482c4985ea3d39aeb729c9b57c4ee5c6b6f2`, `b85be6b4e0e9408fde2a33862b23ed323d5aa0a6`, `f4194d80108558d06de692c9fcad9c3dee5e320d`.

## 2026-11-20 — Revisión semanal de privacidad

- La exportación JSON ahora solicita confirmación explícita e informa que el archivo contiene conversaciones privadas sin cifrar.
- Verificación de sintaxis JavaScript mediante compilación de la función antes de publicar el cambio; no sustituye una prueba de navegador.
- Commit: `4c2069800f99493112ba81a38c61d8228c47c7c9`.
- Render sigue requiriendo autorización; web pública, chat con IA real y APK firmada no verificados.

## 2026-11-20 — Validación de respuestas del proveedor

- El backend rechaza respuestas del proveedor cuyo tipo no sea JSON, así como respuestas mayores de 128 KiB, incluso si el proveedor no declara Content-Length.
- Lectura por fragmentos con límite de memoria y errores controlados para JSON inválido.
- Añadida prueba de regresión para tipo incorrecto, tamaño excesivo y respuesta válida.
- Commits: `3e1c420f4fc7e8b42b22bcd31e0629fb7fdaf945` y `d988384453668e1dc7d5d978acf7e8c7e3a90393`.
- Pruebas de ejecución/CI pendientes de confirmar; no se ha verificado despliegue web ni APK nueva. Render solicita autorización.

## 2026-11-17 — Privacidad del proveedor

- Solicitudes de chat con `store: false` y rechazo de redirecciones HTTP del proveedor; no garantiza retención cero.
- Prueba de regresión con proveedor simulado añadida; ejecución CI pendiente de verificar.
- Commit de backend: `5f8eb84e69f129121d17fe2642958ce7c9ac4220`.

## 2026-11-16 — Cancelación de solicitudes

- El backend cancela la petición al proveedor cuando se desconecta el cliente, combinando la señal de desconexión con el tiempo máximo de 30 segundos.
- Evita iniciar llamadas tras una desconexión detectada y libera el turno de concurrencia al finalizar. No garantiza evitar cobros ya iniciados.
- Commit: `d11f991eeeeefe3e4be2ccd6b50454f9a65d90b4`. Pruebas de ejecución pendientes.

## 2026-11-15 — Protección de consumo y memoria

- Cuota global de 200 llamadas al proveedor por día UTC y por proceso, reiniciada al reiniciar el servidor; no equivale a un límite monetario ni persistente.
- Límite estricto de 2000 entradas en el limitador IP para evitar crecimiento sin control.
- Prueba de regresión de cuota diaria con proveedor simulado; ejecución pendiente de verificar.
- Sin APK ni despliegue público verificados.

## 2026-11-14 — Límites HTTP

- Tiempo máximo de recepción de solicitud de 15 segundos y cabeceras de 10 segundos; keep-alive de 5 segundos.
- Rechazo temprano de cuerpos declarados mayores de 48 KiB antes de ocupar un turno de IA.
- Prueba de regresión añadida con proveedor simulado; ejecución CI pendiente de verificar.
- Sin APK nueva ni despliegue público verificados.

## 2026-11-13 — Integración semanal

- El flujo de pruebas y publicación ahora se activa también cuando cambia `server/**`, evitando omitir comprobaciones en cambios exclusivos del backend.
- Commit de integración: `321df5b902fdc76de2b25e8c9321b036944b50f2`.
- Ejecución CI, URL pública, proveedor real y APK nueva todavía no verificados. Render requiere autorización.

## 2026-11-13 — Seguridad del backend

- Cuota global de 30 llamadas por minuto y máximo de 3 solicitudes simultáneas por proceso; no sustituye autenticación ni cuotas persistentes.
- Rechazo de tipos de contenido no JSON y manejo de JSON nulo.
- Prueba de regresión con proveedor simulado añadida; ejecución CI pendiente de verificar.
- Sin despliegue público ni APK verificados.

## 2026-11-12 — Web 0.3.1

- Bloqueo de cambios de servidor durante respuestas activas para evitar mezclar orígenes de historial.
- Confirmación explícita al cambiar de backend y antes de dictar audio.
- Límite de 128 KiB para respuestas remotas y validación del tipo JSON; límite de texto también aplicado al dictado.
- Caché estática excluye URLs con parámetros.
- Cinco comprobaciones estáticas de presencia de cambios aprobadas; pruebas de ejecución y despliegue pendientes.
- Sin APK nueva ni backend público verificado.

## 2026-11-11 — Web 0.3.0 (código publicado en GitHub)

### Mejoras reales
- Añadido manifiesto de aplicación web progresiva (PWA) y un ícono vectorial original.
- Añadido service worker que guarda **únicamente archivos estáticos públicos** para permitir cargar la interfaz y ejecutar herramientas locales cuando no haya internet, después de una primera visita con conexión.
- El worker no intercepta ni almacena solicitudes al backend de IA, conversaciones o respuestas.
- Se detectan nuevas versiones al volver a la pestaña y se avisa que hay que recargar para verlas.
- El flujo de GitHub Pages ahora incluye manifiesto, worker e ícono.
- Nueva prueba automatizada para comprobar que el caché no intercepte solicitudes externas, POST ni rutas de API.
- Respaldo previo en la rama `backup/pre-pwa-2026-11-11`.

### Comprobaciones y limitaciones
- 9 verificaciones estáticas y de sintaxis pasaron durante esta actualización.
- **Pendiente:** confirmar el resultado de las pruebas completas en GitHub Actions y el despliegue público; no se pudo verificar la URL pública desde este entorno.
- **Pendiente:** activar GitHub Pages si sigue deshabilitado.
- **Pendiente:** IA generativa real (requiere backend y credenciales seguras) y APK Android compilada.
- La instalación como PWA depende del navegador y sus requisitos; el ícono SVG puede no ser suficiente para todos los dispositivos.

## 2026-11-10 — Web 0.2.0 (código en GitHub)

### Interfaz y funciones
- Nueva interfaz de chat adaptable a móvil y escritorio, con menú lateral y estado real de conexión.
- Historial de conversaciones guardado localmente, creación, selección, eliminación y limpieza.
- Exportación de conversaciones en JSON y copia de mensajes.
- Comandos locales funcionales: /ayuda, /contar, /mayusculas, /minusculas, /invertir, /json y /fecha.
- Dictado por voz si el navegador admite SpeechRecognition y lectura de respuestas con SpeechSynthesis.
- Configuración de URL HTTPS para un backend de IA propio, sin incrustar claves API.
- Errores de red y tiempos de espera explícitos; botón para detener solicitudes.

### Seguridad y privacidad
- Política de seguridad de contenido (CSP), sin scripts ni manejadores de eventos en línea.
- Renderizado de mensajes con textContent para evitar ejecutar HTML de usuarios.
- Fetch sin cookies ni referencia de navegación y con validación HTTPS.
- Los comandos locales y las conversaciones dirigidas a otro backend no se envían al backend configurado.
- Backend Node separado con CORS restringido, validación de mensajes, límite de tamaño y limitador básico por IP.
- Ninguna clave privada incluida en el repositorio.

### Pruebas y despliegue
- Añadidas pruebas automáticas de sintaxis, referencias de la interfaz, seguridad y backend sin clave.
- Añadido flujo GitHub Actions para comprobar y desplegar los archivos estáticos con Pages.
- Comprobación manual del código mediante análisis sintáctico y pruebas de lógica local: aprobadas.
- **Pendiente:** confirmar ejecución exitosa del flujo CI y verificar que GitHub Pages responda sin 404.
- **Pendiente:** desplegar y probar el backend real con credenciales seguras; no se ha conectado IA generativa.
- **Pendiente:** pruebas de navegador y APK Android.

## 2026-11-09 — Android 6.0.1 (paquete local previo)

Se preparó un parche de mantenimiento de Android v6.0.1 con validación de payloads de 14 MB y redacción de claves en errores. El código Android completo y la APK de esa versión **no están publicados aquí**; consultar OSAIA-MANTENIMIENTO-2026-11-09.md.
