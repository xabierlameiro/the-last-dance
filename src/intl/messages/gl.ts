/**
 * SDD-L08/L09: the three catalogues used to live in one 300-line module that every page imported.
 * Splitting them per locale is the seam L09-T9 needs to load only the active one, and it is what
 * makes the survey copy (SDD-L08-T7) tractable — that alone is ~60 strings per language.
 */

const gl = {
    'blog.categories': 'Temas',
    'blog.tags': 'Etiquetas',
    'blog.readtime': '{readTime, plural, one {# minuto de tempo de lectura} other {# minutos de tempo de lectura}}',
    'blog.breadcrumb': 'Notas',
    language: 'Galego',
    'home.seo.title': 'Xabier Lameiro | Software Architect · Next.js e React',
    'home.breadcrumb': 'Código',
    'home.seo.description':
        'Software Architect con máis de 8 anos de experiencia traballando no sector da banca online, actualmente especializado en Nextjs e React. Apasionado da tecnoloxía e a programación, gustame aprender cousas novas e compartir coñecemento coa comunidade. ',
    'settings.seo.title':
        'Configuración de preferencias de idioma, tema e rexión personalizada para unha aplicación web',
    'settings.seo.description':
        'Páxina web de configuración de preferencias de usuario para a súa experiencia na web, permite cambiar o idioma, o tema e a rexión',
    'settings.title': 'Preferencias do sistema',
    'settings.desc': 'Software Architect · Next.js e React',
    'settings.lang': 'Idioma e Rexión',
    'settings.langAlt': 'Icono de Idioma e Rexión',
    'settings.lang.preferred': 'Idiomas preferidos:',
    'settings.lang.description':
        'As preferencias de Idioma e Rexión controlan o idioma que ves nos menús e diálogos, e os formatos de data, horas e moedas',
    'settings.search': 'Buscar',
    'settings.avatar': 'Imaxe de avatar',
    'settings.breadcrumb': 'Preferencias do sistema',
    'comments.seo.title': 'Comentarios da aplicación web',
    'comments.seo.description':
        'Páxina web de comentarios da aplicación web, permite aos usuarios deixar comentarios sobre o contido da páxina',
    'comments.breadcrumb': 'Terminal',
    'legal.title': 'Documentos legais',
    'legal.breadcrumb': 'Legales',
    'legal.cookies-policy': 'Política de Cookies',
    'legal.legal-notice': 'Aviso Legal',
    'legal.privacy-policy': 'Política de Privacidade',
    'consent.title': 'Cookies',
    'search.label': 'Buscar',
    'blog.toggleCategories': 'Amosar categorías e etiquetas',
    'blog.togglePosts': 'Amosar entradas desta categoría',
    'nav.social': 'Redes sociais',
    'nav.applications': 'Aplicacións',
    'nav.taxonomy': 'Categorías e etiquetas',
    'nav.posts': 'Entradas desta categoría',
    'nav.legal': 'Documentos legais',
    'controls.close': 'Pechar xanela',
    'controls.minimise': 'Minimizar xanela',
    'controls.maximise': 'Maximizar xanela',
    'consent.message':
        'Este sitio quereria usar cookies analíticas para medir como se le. Só se activan se as aceptas. Máis detalle na',
    'consent.accept': 'Aceptar',
    'consent.reject': 'Rexeitar',
    'legal.search-placeholder': 'Buscar en legales',
    'weather.tooltip': 'Fai clic enriba para obter actualizacións do tempo e as novas',
    'countdown.caption': 'Data importante',
    'starCounter.label': 'Dálle unha estrela a este repositorio en GitHub',
    'starCounter.tooltip': '¡Vén, dámelle unha estrela!',
    'starCounter.error': 'Erro ao obter o número de estrelas',
    'starCounter.loading': 'Cargando... estrelas',
    'githubStars.open': 'Estado do repositorio',
    'githubStars.repo': 'xabierlameiro/the-last-dance',
    'githubStars.tagline': 'O código desta web. Feito á vista de todos.',
    'githubStars.stars': 'estrelas',
    'githubStars.forks': 'forks',
    'githubStars.watchers': 'seguindo',
    'githubStars.issues': 'issues',
    'githubStars.updated': 'Último commit {when}',
    'githubStars.cta': 'Dar unha estrela',
    'starPrompt.title': 'the-last-dance',
    'starPrompt.message': 'Servíuche de algo? Unha estrela axuda a que outros o atopen.',
    'starPrompt.accept': 'Dar estrela',
    'starPrompt.dismiss': 'Agora non',
    'starPrompt.close': 'Descartar',
    'viewCounter.error': 'Erro ao obter o número de visitas',
    'viewCounter.loading': 'Cargando... visitas',
    'viewCounter.tooltipAll': 'Número total de visitas á web desde Google analytics',
    'viewCounter.tooltipPage': 'Número de visitas á páxina desde Google analytics',
    'viewCounter.users.error': 'Erro ao obter o número de usuarios',
    'viewCounter.users.loading': 'Cargando... usuarios',
    'viewCounter.users.tooltip': 'Número de usuarios desde Google analytics',
    'cryptoPrice.error': 'Erro ao obter o prezo dos Ripple coins',
    'cryptoPrice.loading': 'Cargando... prezo',
    'cryptoPrice.tooltip': 'Prezo da moeda Ripple hoxe, porcentaxe {todayPercentage}',
    'heating.error': 'Erro ao obter a temperatura',
    'heating.loading': 'Cargando... temperatura',
    'heating.tooltip': 'Temperatura fóra {outsideTemp}º e dentro {zoneMeasuredTemp}º da miña casa',
    'indexedCounter.error': 'Erro ao obter o número de páxinas indexadas',
    'indexedCounter.loading': 'Cargando... páxinas indexadas',
    'indexedCounter.tooltip': '{num, plural, one {# páxina indexada en Google} other {# páxinas indexadas en Google}}',
    'news.error': 'Erro ao obter as novas',
    'news.empty': 'Non hai novas recentes',
    'news.loading': 'Cargando... novas',
    'weather.error': 'Erro ao obter o tempo',
    'weather.loading': 'Cargando... tempo',
    'weather.precipitation': 'Precipitación {precipitation}',
    'weather.humidity': 'Humedade {humidity}',
    'weather.windSpeed': 'Vento {windSpeed}',
    'countdown.years': 'anos',
    'countdown.months': 'meses',
    'countdown.days': 'días',
    'countdown.hours': 'horas',
    'countdown.minutes': 'minutos',
    'countdown.seconds': 'segundos',
    'settings.dark': 'Tema (Escuro)',
    'settings.light': 'Tema (Claro)',
    'deploymentstatus.tooltip':
        'Estado : {status} O usuario {username} ha desplegado no entorno de {environment} a data {createdAt}',
    'rendermanager.error': 'Ocurriu un erro, estamos traballando niso',
    'rendermanager.error.status': 'O servizo respondeu cun erro. Pode que funcione se o tentas nun momento',
    'rendermanager.error.shape': 'O servizo respondeu algo inesperado, así que este dato non se amosa',
    'rendermanager.loading': 'Obtendo os datos...',
    'error.404.title': 'Páxina non atopada',
    'error.404.message': 'Esta dirección non leva a ningures. Pode que se renomease ou se eliminase.',
    'error.500.title': 'Erro do servidor',
    'error.500.message': 'Algo fallou pola miña parte ao cargar esta páxina. Non é cousa túa.',
    'error.boundary.title': 'Algo foi mal',
    'error.boundary.message': 'Esta parte da páxina non se puido amosar. Recargar adoita arranxalo.',
    'error.home': 'Ir á páxina de inicio',
    'dock.home': 'Inicio',
    'dock.blog': 'Notas',
    'dock.terminal': 'Terminal',
    'dock.legal': 'Documentos legais',
    'dock.settings': 'Preferencias do sistema',
    'dock.legal.short': 'Legal',
    'dock.settings.short': 'Axustes',
    'dock.nextLeak': 'next-leak',
    'dock.nextCoverage': 'next-coverage',
    'dock.tools': 'Tools',
    /*
     * /next-leak. Copy only: route names, figures, retainer chains, issue rows and the verdict words
     * are CLI output and live untranslated in constants/nextLeak.ts.
     */
    'nextLeak.breadcrumb': 'next-leak',
    'nextLeak.seo.title': 'next-leak: ten a túa app de Next.js unha fuga de memoria?',
    'nextLeak.seo.description':
        'Un CLI que mide as fugas de memoria de Next.js ruta a ruta: un veredicto a partir do heap tras un GC forzado e o obxecto que o retén.',
    'nextLeak.pitch':
        'Descobre se a túa app de Next.js ten de verdade unha fuga de memoria: canta, en que ruta e de quen é a culpa.',
    'nextLeak.copy': 'Copiar',
    'nextLeak.copied': 'Copiado',
    'nextLeak.copyLabel': 'Copiar o comando {command}',
    'nextLeak.sections': 'Seccións',
    'nextLeak.nav.overview': 'Resumo',
    'nextLeak.nav.run': 'Exemplo real',
    'nextLeak.nav.build': 'Modo build',
    'nextLeak.nav.verified': 'Verificado',
    'nextLeak.nav.limits': 'Límites',
    'nextLeak.nav.links': 'Ligazóns',
    'nextLeak.overview.title': 'Que responde',
    'nextLeak.overview.answer1': 'Non tes unha fuga: o pico é transitorio e baléirase en repouso. É o caso máis común.',
    'nextLeak.overview.answer2': 'Algo estase a encher, non a fugar: unha caché limitada camiño do seu teito.',
    'nextLeak.overview.answer3': 'A fuga está no teu código ou nunha dependencia, co ficheiro fonte cando é posible.',
    'nextLeak.overview.answer4': 'Parece do propio framework, cun borrador de issue listo para abrir.',
    'nextLeak.overview.start': 'Comezar',
    'nextLeak.overview.startText':
        'Compila a túa app con <code>output: "standalone"</code> e executa isto desde o seu directorio:',
    'nextLeak.overview.how': 'Como mide',
    'nextLeak.overview.howText': 'Cada ruta mídese nun proceso novo:',
    'nextLeak.overview.shape':
        'O veredicto sae da forma da curva tras o GC forzado, non de onde está o heap: 40 MB e 400 MB non din nada por si sós.',
    'nextLeak.overview.verdicts': 'Veredictos',
    'nextLeak.verdict.stable':
        'Ningún crecemento que esta execución puidese detectar. Non proba que non haxa fuga: o veredicto prefire perder unha fuga a inventala.',
    'nextLeak.verdict.leak':
        'O heap retido segue a medrar en cada ciclo. Nomea o culpable cando os source maps o resolven.',
    'nextLeak.verdict.saturating':
        'Cada ciclo medrou, pero menos que o anterior: un almacén limitado que se queda sen claves novas.',
    'nextLeak.verdict.inconclusive': 'A evidencia non decide. A ruta vólvese medir co dobre de ciclos.',
    'nextLeak.verdict.failed':
        'A ruta deu erros baixo carga: máis dun 1% de respostas que non son 2xx detén a medición.',
    'nextLeak.overview.falsePositives':
        'En arredor de {routes} rutas sas de apps en produción (PPR, MDX, Auth.js, Sentry, i18n) non deu ningún falso positivo.',
    'nextLeak.table.route': 'Ruta',
    'nextLeak.table.verdict': 'Veredicto',
    'nextLeak.table.slope': 'Pendente',
    'nextLeak.table.heap': 'Heap',
    'nextLeak.table.retainer': 'Retedor',
    'nextLeak.run.detail': '{route} — reprodución de {issue}, corrixido en Next {version}',
    'nextLeak.run.chart': 'Heap tras GC forzado, por ciclo',
    'nextLeak.run.cycle': 'ciclo {n} · {mb} MB',
    'nextLeak.run.cycles': 'Heap por ciclo',
    'nextLeak.run.stableRetainer': 'As rutas estables non se comparan salvo con <code>--diff-all</code>.',
    'nextLeak.run.leakAside':
        'Unha ruta sa devolve entre o 20 e o 30% do que medra. Esta non devolve nada: esa é a forma de escaleira.',
    'nextLeak.run.stableAside': 'O primeiro ciclo é quecemento e queda fóra do veredicto. Despois, a curva é plana.',
    'nextLeak.status':
        '{routes, plural, one {# ruta} other {# rutas}} · {leaks, plural, one {# fuga} other {# fugas}} · heap tras GC forzado, por ciclo',
    'nextLeak.checked': 'README revisado o {date}',
    'nextLeak.build.title': 'Medir o build, non o servidor',
    'nextLeak.build.text':
        'Un sitio grande pode quedar sen heap mentres prerenderiza, antes de que exista un servidor que medir. Este comando executa o teu build sen modificalo e mostrea a memoria residente de cada worker de xeración estática. Non precisa un build previo nin saída standalone.',
    'nextLeak.build.evidence': 'Na reprodución de {issue}, {pages, number} páxinas prerenderizadas:',
    'nextLeak.build.leaking':
        'Sen heap tras {first, number} e {second, number} de {pages, number} páxinas, en dúas execucións.',
    'nextLeak.build.healthy': 'Remata con {perPage} por páxina.',
    'nextLeak.build.fixed': 'Corrixido en {version} co mesmo arranxo que {issue}. Aínda sen volver medir aquí.',
    'nextLeak.build.parent':
        'O proceso principal do build infórmase, non se xulga. Nesa reprodución baixou de {from} a {to} mentres os workers subían, así que sumalos anularía o achado.',
    'nextLeak.build.attribute':
        '<code>--attribute</code> ademais nomea que retén o worker. É opcional e lento: o worker escribe todo o seu heap en disco.',
    'nextLeak.verified.title': 'Verificado con issues reais de Next.js',
    'nextLeak.verified.checked': 'Estado das issues revisado o {date}.',
    'nextLeak.verified.issue': 'Issue',
    'nextLeak.verified.what': 'Que é',
    'nextLeak.verified.measured': 'Medido',
    'nextLeak.verified.state': 'Estado',
    'nextLeak.state.fixed': 'corrixida en {version}',
    'nextLeak.state.closed': 'pechada',
    'nextLeak.state.open': 'aberta',
    'nextLeak.state.fixProposed': 'arranxo proposto en {link}',
    'nextLeak.verified.proof':
        'En {issue} atopou a fuga, {found} en {cycles} ciclos. Co workaround do fío aplicado ({workaround}), mesma app e mesmos parámetros: {after}, plano.',
    'nextLeak.verified.kept':
        'As corrixidas seguen na lista a propósito: amosan que as medicións coincidiron co que resultaron ser os arranxos.',
    'nextLeak.verified.full': 'A táboa completa está no README',
    'nextLeak.limits.title': 'Alcance e límites',
    'nextLeak.limits.supported':
        'O comando por defecto precisa App Router, <code>output: "standalone"</code>, Node 22 ou posterior, e Linux ou macOS. Pages Router, os builds sen standalone e Windows rexéitanse cunha mensaxe clara.',
    'nextLeak.limits.stable':
        '<code>stable</code> non proba que non haxa fuga. Executa antes <code>--self-check</code>: planta unha fuga de 8 KB por petición e demostra que o arnés a ve onde o estás a executar.',
    'nextLeak.limits.heapCap':
        'Cada proceso medido corre cun límite de heap de 512 MB, para que unha fuga chegue ao teito en minutos. As apps con máis memoria de traballo precisan <code>--max-old-space</code>.',
    'nextLeak.limits.duration':
        'Unha app de 60 rutas cos valores por defecto tarda horas. Acota con <code>--routes</code> mentres iteras.',
    'nextLeak.limits.attribution':
        'Nomear o ficheiro require un build de Turbopack con source maps de servidor, o habitual desde Next 15. En builds de webpack os achados quedan sen atribuír; a medición non depende diso.',
    'nextLeak.limits.flip':
        'As rutas no límite poden alternar entre <code>stable</code> e <code>leak</code> dunha execución a outra. Máis ciclos resólveno.',
    'nextLeak.limits.environment':
        'A app execútase co seu contorno real: as rutas que chaman a servizos externos chamaranos baixo carga.',
    'nextLeak.links.repository': 'Código fonte, README e issues',
    'nextLeak.links.npm': 'O paquete en npm',
    'nextLeak.links.npmx': 'Tamaño de instalación, dependencias e descargas',
    'nextLeak.links.post': 'O artigo que explica o método',
    'nextLeak.links.sibling': 'A outra ferramenta: que APIs de Next.js usa a túa app?',
    'nextLeak.links.report': 'Un veredicto incorrecto? Abre unha issue',
    'nextCoverage.breadcrumb': 'next-coverage',
    'nextCoverage.seo.title': 'next-coverage: que APIs de Next.js usa a túa app',
    'nextCoverage.seo.description':
        'Un CLI que le un proxecto con App Router de Next.js e di que APIs do framework usa, cales lle aplicarían e cales non puido xulgar.',
    'nextCoverage.pitch':
        'Mira que APIs de Next.js usa o teu proxecto, cales lle aplicarían e por que as demais quedan fóra.',
    'nextCoverage.copy': 'Copiar',
    'nextCoverage.copied': 'Copiado',
    'nextCoverage.copyLabel': 'Copiar o comando {command}',
    'nextCoverage.sections': 'Seccións',
    'nextCoverage.nav.overview': 'Resumo',
    'nextCoverage.nav.run': 'Corrida de exemplo',
    'nextCoverage.nav.buckets': 'Os catro grupos',
    'nextCoverage.nav.presets': 'Modos',
    'nextCoverage.nav.limits': 'Alcance e límites',
    'nextCoverage.nav.links': 'Ligazóns',
    'nextCoverage.bucket.used': 'Úsase',
    'nextCoverage.bucket.used.what': 'a API está no proxecto',
    'nextCoverage.bucket.wouldApply': 'Aplicaría',
    'nextCoverage.bucket.wouldApply.what': 'as condicións están no código e a API non',
    'nextCoverage.bucket.notApplicable': 'Non aplica',
    'nextCoverage.bucket.notApplicable.what': 'descartada, co motivo impreso',
    'nextCoverage.bucket.notEvaluated': 'Sen avaliar',
    'nextCoverage.bucket.notEvaluated.what': 'sen xuízo, desglosado por que',
    'nextCoverage.overview.lead':
        'Le un proxecto con App Router e reparte en catro grupos todas as APIs do framework que coñece. Non hai nota nin porcentaxe: <code>29 de 151</code> non é unha cualificación, e os catro recontos son a resposta.',
    'nextCoverage.overview.note':
        '<code>Aplicaría</code> é unha oportunidade, non un defecto. Esta ferramenta nunca di que o teu código estea mal.',
    'nextCoverage.overview.reads':
        'Le ficheiros fonte. Non constrúe a túa app, non a executa e non envía nada a ningures. Se atopa un build de produción, tamén o le e contrasta os dous.',
    'nextCoverage.run.meta': '{seconds} s · {entries, number} entradas examinadas',
    'nextCoverage.run.lead':
        'Executado contra {project} en {commit}, sobre Next.js {version}. Todo o de abaixo está copiado desa corrida.',
    'nextCoverage.run.findings': '{count, plural, one {O achado} other {Os # achados}}',
    'nextCoverage.run.andMore': 'e {count, number} máis',
    'nextCoverage.run.docs': 'Documentación de Next.js para esta API',
    'nextCoverage.run.checkTitle': 'Comprobado a man',
    'nextCoverage.run.checkMeaning':
        'Cambia o produto destacado e a portada actualízase ao instante, mentres a listaxe pode seguir servindo o anterior ata que caduque o perfil <code>minutes</code>.',
    'nextCoverage.run.checkFair':
        'Con <code>cacheLife("minutes")</code> pode ser perfectamente deliberado. A ferramenta repórtao como unha observación e esta páxina tamén.',
    'nextCoverage.run.weight': 'Peso en cliente',
    'nextCoverage.run.modules': '{count, plural, one {# módulo} other {# módulos}}',
    'nextCoverage.run.weightMore': 'E {count, number} rutas máis, todas máis lixeiras ca estas.',
    'nextCoverage.buckets.opportunity':
        'Só un grupo che pide algo. <code>Aplicaría</code> significa que as condicións que a API precisa xa están no código e a API non: merece unha ollada, nunca é un bug. O vermello da paleta resérvase para unha contradición de verdade, e esta corrida non ten ningunha.',
    'nextCoverage.buckets.silence': 'O que se nega a xulgar',
    'nextCoverage.buckets.silenceLead':
        'O número interesante é o máis grande: {count, number} entradas que non avaliou, desglosadas en vez de tragadas.',
    'nextCoverage.buckets.silenceNote':
        'Absterse quere dicir que a evidencia non daba para responder nin unha cousa nin a outra. Unha ferramenta que nunca se abstén está adiviñando.',
    'nextCoverage.presets.default':
        'A corrida por defecto imprime o que pode argumentar: aquí {count, plural, one {# achado} other {# achados}}. Execútase sen flags.',
    'nextCoverage.presets.strict':
        '<code>--strict</code> baixa o listón e engade as suxestións opcionais: {count, number} achados sobre o mesmo proxecto, no mesmo segundo.',
    'nextCoverage.presets.withheld':
        '{count, number} suxestións opcionais retidas por defecto, e o informe dío en cada corrida en vez de escondelas. <code>--findings</code> imprime a lista; <code>--json</code> dá o informe enteiro.',
    'nextCoverage.presets.constraints': '{count, number} restricións documentadas comprobadas, ningunha contradita.',
    'nextCoverage.presets.same':
        'Os dous modos len exactamente os mesmos ficheiros. <code>--strict</code> cambia o que se reporta, nunca o que se analiza.',
    'nextCoverage.limits.reads': 'Le ficheiros. Non constrúe, non executa, non instala e non envía nada.',
    'nextCoverage.limits.requirements': '{requirements}. Os proxectos con Pages Router quedan fóra.',
    'nextCoverage.limits.build':
        'O contraste co build e o peso en cliente precisan un build de produción en <code>.next</code>. Sen el dío, en vez de adiviñar.',
    'nextCoverage.limits.version':
        'Vai pola versión {version}. En <code>0.x</code> a saída do CLI e a forma do JSON poden cambiar entre menores, así que a corrida desta páxina leva a súa data.',
    'nextCoverage.limits.notLinter':
        'Non é un linter. Non di nada sobre se o teu código é correcto, só sobre que parte do framework estás a usar.',
    'nextCoverage.links.repository': 'Código fonte, README e issues',
    'nextCoverage.links.npm': 'O paquete en npm',
    'nextCoverage.links.npmx': 'Tamaño de instalación, dependencias e descargas',
    'nextCoverage.links.sibling': 'A outra ferramenta: a túa app ten fugas de memoria?',
    'nextCoverage.links.report': 'Non estás de acordo cun grupo? Abre unha issue',
    'nextCoverage.status':
        '{used, number} de {evaluated, number} APIs avaliadas en uso · {findings, plural, one {# achado} other {# achados}}',
    'nextCoverage.checked': 'Executado o {date}',
    'countdown.label': 'Tempo restante ata o {date}',
};

export default gl;
