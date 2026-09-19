/**
 * SDD-L08/L09: the three catalogues used to live in one 300-line module that every page imported.
 * Splitting them per locale is the seam L09-T9 needs to load only the active one, and it is what
 * makes the survey copy (SDD-L08-T7) tractable — that alone is ~60 strings per language.
 */

const es = {
    'blog.categories': 'Temas',
    'blog.tags': 'Etiquetas',
    'blog.readtime': '{readTime, plural, one {# minuto de tiempo de lectura} other {# minutos de tiempo de lectura}}',
    'blog.breadcrumb': 'Notas',
    language: 'Español',
    'home.seo.title': 'Xabier Lameiro | Software Architect · Next.js y React',
    'home.seo.description':
        'Software Architect con más de 8 años de experiencia trabajando en el sector de la banca online, actualmente especializado en Nextjs y React. Apasionado de la tecnología y la programación, me gusta aprender cosas nuevas y compartir conocimientos con la comunidad. ',
    'home.breadcrumb': 'Código',
    'settings.seo.title':
        'Configuración de preferencias de idioma, tema y región personalizada para una aplicación web',
    'settings.seo.description':
        'Pagina web de configuración de preferencias de usuario para su experiencia en la web, permite cambiar el idioma, el tema y la región',
    'settings.title': 'Preferencias del sistema',
    'settings.desc': 'Software Architect · Next.js y React',
    'settings.lang': 'Idioma y Región',
    'settings.langAlt': 'Icono de Idioma y Región',
    'settings.lang.preferred': 'Idiomas preferidos:',
    'settings.lang.description':
        'Las preferencias de Idioma y Región controlan el idioma que ves en los menús y diálogos, y los formatos de fecha, horas y monedas',
    'settings.search': 'Buscar',
    'settings.avatar': 'Imagen de avatar',
    'settings.breadcrumb': 'Preferencias del sistema',
    'comments.seo.title': 'Comentarios de la aplicación web',
    'comments.seo.description':
        'Página web de comentarios de la aplicación web, permite a los usuarios dejar comentarios sobre el contenido de la página',
    'comments.breadcrumb': 'Terminal',
    'legal.title': 'Documentos legales',
    'legal.breadcrumb': 'Legales',
    'legal.cookies-policy': 'Política de Cookies',
    'legal.legal-notice': 'Aviso Legal',
    'legal.privacy-policy': 'Política de Privacidad',
    'consent.title': 'Cookies',
    'search.label': 'Buscar',
    'blog.toggleCategories': 'Mostrar categorías y etiquetas',
    'blog.togglePosts': 'Mostrar entradas de esta categoría',
    'nav.social': 'Redes sociales',
    'nav.applications': 'Aplicaciones',
    'nav.taxonomy': 'Categorías y etiquetas',
    'nav.posts': 'Entradas de esta categoría',
    'nav.legal': 'Documentos legales',
    'controls.close': 'Cerrar ventana',
    'controls.minimise': 'Minimizar ventana',
    'controls.maximise': 'Maximizar ventana',
    'consent.message':
        'Este sitio querría usar cookies analíticas para medir cómo se lee. Solo se activan si las aceptas. Más detalle en la',
    'consent.accept': 'Aceptar',
    'consent.reject': 'Rechazar',
    'legal.search-placeholder': 'Buscar en legales',
    'weather.tooltip': 'Haz clic encima para obtener actualizaciones del tiempo y las noticias',
    'countdown.caption': 'Fecha importante',
    'starCounter.label': 'Dale una estrella a este repositorio en GitHub',
    'starCounter.tooltip': '¡Venga, dame una estrella!',
    'starCounter.error': 'Error al obtener el número de estrellas',
    'starCounter.loading': 'Cargando... estrellas',
    'viewCounter.error': 'Error al obtener el número de visitas',
    'viewCounter.loading': 'Cargando... visitas',
    'viewCounter.tooltipAll': 'Número total de visitas a la web desde Google analytics',
    'viewCounter.tooltipPage': 'Número de visitas a la página desde Google analytics',
    'viewCounter.users.error': 'Error al obtener el número de usuarios',
    'viewCounter.users.loading': 'Cargando... usuarios',
    'viewCounter.users.tooltip': 'Número de usuarios desde Google analytics',
    'cryptoPrice.error': 'Error al obtener el precio de los Ripple coins',
    'cryptoPrice.loading': 'Cargando... precio',
    'cryptoPrice.tooltip': 'Precio de la moneda Ripple hoy, porcentaje {todayPercentage}',
    'heating.error': 'Error al obtener la temperatura',
    'heating.loading': 'Cargando... temperatura',
    'heating.tooltip': 'Temperatura fuera {outsideTemp}º y dentro {zoneMeasuredTemp}º de mi casa',
    'indexedCounter.error': 'Error al obtener el número de páginas indexadas',
    'indexedCounter.loading': 'Cargando... páginas indexadas',
    'indexedCounter.tooltip': '{num, plural, one {# página indexada en Google} other {# páginas indexadas en Google}}',
    'news.error': 'Error al obtener las noticias',
    'news.empty': 'No hay noticias recientes',
    'news.loading': 'Cargando... noticias',
    'weather.error': 'Error al obtener el tiempo',
    'weather.loading': 'Cargando... tiempo',
    'weather.precipitation': 'Precipitación {precipitation}',
    'weather.humidity': 'Humedad {humidity}',
    'weather.windSpeed': 'Viento {windSpeed}',
    'countdown.years': 'años',
    'countdown.months': 'meses',
    'countdown.days': 'días',
    'countdown.hours': 'horas',
    'countdown.minutes': 'minutos',
    'countdown.seconds': 'segundos',
    'settings.dark': 'Tema (Oscuro)',
    'settings.light': 'Tema (Claro)',
    'deploymentstatus.tooltip':
        'Estado : {status} El usuario {username} ha desplegado en el entorno de {environment} a fecha {createdAt}',
    'rendermanager.error': 'Ha ocurrido un error, estamos trabajando en ello',
    'rendermanager.error.status': 'El servicio ha respondido con un error. Puede que funcione si lo intentas en un momento',
    'rendermanager.error.shape': 'El servicio ha respondido algo inesperado, así que este dato no se muestra',
    'rendermanager.loading': 'Obteniendo los datos...',
    'error.404.title': 'Página no encontrada',
    'error.404.message': 'Esta dirección no lleva a ninguna parte. Puede que se haya renombrado o eliminado.',
    'error.500.title': 'Error del servidor',
    'error.500.message': 'Algo ha fallado por mi parte al cargar esta página. No es cosa tuya.',
    'error.boundary.title': 'Algo ha ido mal',
    'error.boundary.message': 'Esta parte de la página no se ha podido mostrar. Recargar suele arreglarlo.',
    'error.home': 'Ir a la página de inicio',
    'dock.home': 'Inicio',
    'dock.blog': 'Notas',
    'dock.terminal': 'Terminal',
    'dock.legal': 'Documentos legales',
    'dock.settings': 'Preferencias del sistema',
    'dock.nextLeak': 'next-leak',
    /*
     * /next-leak. Copy only: route names, figures, retainer chains, issue rows and the verdict words
     * are CLI output and live untranslated in constants/nextLeak.ts.
     */
    'nextLeak.breadcrumb': 'next-leak',
    'nextLeak.seo.title': 'next-leak: ¿tiene tu app de Next.js una fuga de memoria?',
    'nextLeak.seo.description':
        'Un CLI que mide las fugas de memoria de Next.js ruta a ruta: un veredicto a partir del heap tras un GC forzado y el objeto que lo retiene.',
    'nextLeak.pitch':
        'Averigua si tu app de Next.js tiene de verdad una fuga de memoria: cuánta, en qué ruta y de quién es la culpa.',
    'nextLeak.copy': 'Copiar',
    'nextLeak.copied': 'Copiado',
    'nextLeak.copyLabel': 'Copiar el comando {command}',
    'nextLeak.sections': 'Secciones',
    'nextLeak.nav.overview': 'Resumen',
    'nextLeak.nav.run': 'Ejemplo real',
    'nextLeak.nav.build': 'Modo build',
    'nextLeak.nav.verified': 'Verificado',
    'nextLeak.nav.limits': 'Límites',
    'nextLeak.nav.links': 'Enlaces',
    'nextLeak.overview.title': 'Qué responde',
    'nextLeak.overview.answer1':
        'No tienes una fuga: el pico es transitorio y se vacía en reposo. Es el caso más común.',
    'nextLeak.overview.answer2': 'Algo se está llenando, no fugando: una caché acotada camino de su techo.',
    'nextLeak.overview.answer3':
        'La fuga está en tu código o en una dependencia, con el fichero fuente cuando es posible.',
    'nextLeak.overview.answer4': 'Parece del propio framework, con un borrador de issue listo para abrir.',
    'nextLeak.overview.start': 'Empezar',
    'nextLeak.overview.startText':
        'Compila tu app con <code>output: "standalone"</code> y ejecuta esto desde su directorio:',
    'nextLeak.overview.how': 'Cómo mide',
    'nextLeak.overview.howText': 'Cada ruta se mide en un proceso nuevo:',
    'nextLeak.overview.shape':
        'El veredicto sale de la forma de la curva tras el GC forzado, no de dónde está el heap: 40 MB y 400 MB no dicen nada por sí solos.',
    'nextLeak.overview.verdicts': 'Veredictos',
    'nextLeak.verdict.stable':
        'Ningún crecimiento que esta ejecución pudiera detectar. No prueba que no haya fuga: el veredicto prefiere perder una fuga a inventarla.',
    'nextLeak.verdict.leak':
        'El heap retenido sigue creciendo en cada ciclo. Nombra al culpable cuando los source maps lo resuelven.',
    'nextLeak.verdict.saturating':
        'Cada ciclo creció, pero menos que el anterior: un almacén acotado que se queda sin claves nuevas.',
    'nextLeak.verdict.inconclusive': 'La evidencia no decide. La ruta se vuelve a medir con el doble de ciclos.',
    'nextLeak.verdict.failed':
        'La ruta dio errores bajo carga: más de un 1% de respuestas que no son 2xx detiene la medición.',
    'nextLeak.overview.falsePositives':
        'En unas {routes} rutas sanas de apps en producción (PPR, MDX, Auth.js, Sentry, i18n) no dio ningún falso positivo.',
    'nextLeak.table.route': 'Ruta',
    'nextLeak.table.verdict': 'Veredicto',
    'nextLeak.table.slope': 'Pendiente',
    'nextLeak.table.heap': 'Heap',
    'nextLeak.table.retainer': 'Retenedor',
    'nextLeak.run.detail': '{route} — reproducción de {issue}, corregido en Next {version}',
    'nextLeak.run.chart': 'Heap tras GC forzado, por ciclo',
    'nextLeak.run.cycle': 'ciclo {n} · {mb} MB',
    'nextLeak.run.cycles': 'Heap por ciclo',
    'nextLeak.run.stableRetainer': 'Las rutas estables no se comparan salvo con <code>--diff-all</code>.',
    'nextLeak.run.leakAside':
        'Una ruta sana devuelve entre el 20 y el 30% de lo que crece. Esta no devuelve nada: esa es la forma de escalera.',
    'nextLeak.run.stableAside':
        'El primer ciclo es calentamiento y queda fuera del veredicto. Después, la curva es plana.',
    'nextLeak.status':
        '{routes, plural, one {# ruta} other {# rutas}} · {leaks, plural, one {# fuga} other {# fugas}} · heap tras GC forzado, por ciclo',
    'nextLeak.checked': 'README revisado el {date}',
    'nextLeak.build.title': 'Medir el build, no el servidor',
    'nextLeak.build.text':
        'Un sitio grande puede quedarse sin heap mientras prerenderiza, antes de que exista un servidor que medir. Este comando ejecuta tu build sin modificarlo y muestrea la memoria residente de cada worker de generación estática. No necesita un build previo ni salida standalone.',
    'nextLeak.build.evidence': 'En la reproducción de {issue}, {pages, number} páginas prerenderizadas:',
    'nextLeak.build.leaking':
        'Sin heap tras {first, number} y {second, number} de {pages, number} páginas, en dos ejecuciones.',
    'nextLeak.build.healthy': 'Termina con {perPage} por página.',
    'nextLeak.build.fixed': 'Corregido en {version} con el mismo arreglo que {issue}. Aún sin volver a medir aquí.',
    'nextLeak.build.parent':
        'El proceso principal del build se informa, no se juzga. En esa reproducción bajó de {from} a {to} mientras los workers subían, así que sumarlos anularía el hallazgo.',
    'nextLeak.build.attribute':
        '<code>--attribute</code> además nombra qué retiene el worker. Es opcional y lento: el worker escribe todo su heap en disco.',
    'nextLeak.verified.title': 'Verificado con issues reales de Next.js',
    'nextLeak.verified.checked': 'Estado de las issues revisado el {date}.',
    'nextLeak.verified.issue': 'Issue',
    'nextLeak.verified.what': 'Qué es',
    'nextLeak.verified.measured': 'Medido',
    'nextLeak.verified.state': 'Estado',
    'nextLeak.state.fixed': 'corregida en {version}',
    'nextLeak.state.closed': 'cerrada',
    'nextLeak.state.open': 'abierta',
    'nextLeak.state.fixProposed': 'arreglo propuesto en {link}',
    'nextLeak.verified.proof':
        'En {issue} encontró la fuga, {found} en {cycles} ciclos. Con el workaround del hilo aplicado ({workaround}), misma app y mismos parámetros: {after}, plano.',
    'nextLeak.verified.kept':
        'Las corregidas siguen en la lista a propósito: muestran que las mediciones coincidieron con lo que resultaron ser los arreglos.',
    'nextLeak.verified.full': 'La tabla completa está en el README',
    'nextLeak.limits.title': 'Alcance y límites',
    'nextLeak.limits.supported':
        'El comando por defecto necesita App Router, <code>output: "standalone"</code>, Node 22 o posterior, y Linux o macOS. Pages Router, los builds sin standalone y Windows se rechazan con un mensaje claro.',
    'nextLeak.limits.stable':
        '<code>stable</code> no prueba que no haya fuga. Ejecuta antes <code>--self-check</code>: planta una fuga de 8 KB por petición y demuestra que el arnés la ve donde lo estás ejecutando.',
    'nextLeak.limits.heapCap':
        'Cada proceso medido corre con un límite de heap de 512 MB, para que una fuga llegue al techo en minutos. Las apps con más memoria de trabajo necesitan <code>--max-old-space</code>.',
    'nextLeak.limits.duration':
        'Una app de 60 rutas con los valores por defecto tarda horas. Acota con <code>--routes</code> mientras iteras.',
    'nextLeak.limits.attribution':
        'Nombrar el fichero requiere un build de Turbopack con source maps de servidor, lo normal desde Next 15. En builds de webpack los hallazgos quedan sin atribuir; la medición no depende de ello.',
    'nextLeak.limits.flip':
        'Las rutas al límite pueden alternar entre <code>stable</code> y <code>leak</code> de una ejecución a otra. Más ciclos lo resuelven.',
    'nextLeak.limits.environment':
        'La app se ejecuta con su entorno real: las rutas que llaman a servicios externos los llamarán bajo carga.',
    'nextLeak.links.repository': 'Código fuente, README e issues',
    'nextLeak.links.npm': 'El paquete en npm',
    'nextLeak.links.post': 'El artículo que explica el método',
    'nextLeak.links.report': '¿Un veredicto incorrecto? Abre una issue',
    'countdown.label': 'Tiempo restante hasta el {date}',
};

export default es;
