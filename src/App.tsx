import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, CircleHelp, Code2, Database, GitBranch, Globe2, Layers3, Menu, Network, Pause, Play, RotateCcw, Server, ShieldCheck, ShoppingBag, Terminal, X, Zap } from 'lucide-react'

type Step = { id: string; short: string; title: string; eyebrow: string; color: string; icon: typeof Code2; description: string; detail: string; receives: string; sends: string; tech: string[] }
const steps: Step[] = [
  { id:'frontend', short:'Front-end', title:'Tudo começa na interface', eyebrow:'01 / NAVEGADOR', color:'blue', icon:Code2, description:'A pessoa clica em “Finalizar compra”. O navegador identifica a ação e prepara os dados que precisam ser enviados.', detail:'HTML estrutura a página, CSS cuida da aparência e JavaScript adiciona comportamento. React, Vue e Angular ajudam a construir interfaces complexas.', receives:'Ação da pessoa: finalizar compra', sends:'Produto, quantidade e contexto do pedido', tech:['HTML','CSS','JavaScript','React'] },
  { id:'request', short:'Requisição HTTP', title:'Os dados entram em trânsito', eyebrow:'02 / REDE', color:'cyan', icon:Network, description:'O navegador envia uma requisição HTTP para um endereço do servidor. HTTPS protege a comunicação durante o transporte.', detail:'Uma requisição pode incluir método, endpoint, cabeçalhos e corpo. POST costuma ser usado para solicitar a criação de um recurso.', receives:'Dados preparados pelo navegador', sends:'POST /api/pedidos', tech:['HTTP','HTTPS','JSON','DNS'] },
  { id:'backend', short:'Back-end', title:'O servidor toma decisões', eyebrow:'03 / PROCESSAMENTO', color:'purple', icon:Server, description:'A aplicação recebe a requisição, encontra a rota, valida os dados e aplica as regras de negócio.', detail:'O back-end também verifica autenticação e permissões quando necessário. Só então coordena as operações necessárias para concluir o pedido.', receives:'Requisição HTTP e dados do pedido', sends:'Operação validada para persistência', tech:['Node.js','Express','Python','FastAPI'] },
  { id:'api', short:'API', title:'Uma linguagem de comunicação', eyebrow:'04 / CONTRATO', color:'cyan', icon:GitBranch, description:'A API define como os componentes podem pedir operações e trocar informações por meio de contratos claros.', detail:'API não é banco de dados. Em uma arquitetura web comum, o navegador conversa com o servidor e o back-end acessa o banco de dados.', receives:'Chamada para POST /api/pedidos', sends:'Pedido de operação à camada de dados', tech:['Endpoints','REST','JSON','HTTP status'] },
  { id:'database', short:'Banco de dados', title:'O pedido ganha um registro', eyebrow:'05 / PERSISTÊNCIA', color:'green', icon:Database, description:'O back-end solicita a gravação do pedido. O banco organiza os dados e confirma o resultado da operação.', detail:'Em bancos relacionais, tabelas, colunas e relacionamentos ajudam a manter os dados organizados. Outros modelos, como documentos, têm estruturas diferentes.', receives:'Dados validados para salvar', sends:'Confirmação e identificador do pedido', tech:['PostgreSQL','MySQL','SQLite','MongoDB'] },
  { id:'response', short:'Resposta', title:'A confirmação volta à tela', eyebrow:'06 / RETORNO', color:'orange', icon:Check, description:'O back-end monta uma resposta HTTP com o resultado. O navegador recebe os dados e atualiza a interface.', detail:'Um status 201 Created indica que um recurso foi criado. Se algo falhar, a resposta pode conter um erro — ou pode nem chegar, se houver falha de conexão.', receives:'Resultado da operação no banco', sends:'201 Created + confirmação em JSON', tech:['HTTP 201','JSON','Tratamento de erros','UI state'] },
]
const technologies = [
 {group:'FRONT-END', name:'React', type:'Biblioteca', desc:'Constrói interfaces com componentes reutilizáveis.', color:'blue'},
 {group:'FRONT-END', name:'Tailwind CSS', type:'Framework CSS', desc:'Ajuda a compor estilos usando classes utilitárias.', color:'cyan'},
 {group:'BACK-END', name:'Express', type:'Framework web', desc:'Organiza rotas e middleware em aplicações Node.js.', color:'purple'},
 {group:'BACK-END', name:'FastAPI', type:'Framework Python', desc:'Cria APIs com validação e documentação automática.', color:'green'},
 {group:'DADOS', name:'PostgreSQL', type:'Banco relacional', desc:'Armazena dados estruturados com relações e SQL.', color:'blue'},
 {group:'INFRAESTRUTURA', name:'Docker', type:'Plataforma de contêineres', desc:'Empacota aplicações e suas dependências.', color:'orange'},
]
const failures = [
 {label:'Servidor indisponível', status:'Sem resposta HTTP', at:2, color:'orange', message:'Não foi possível conectar ao servidor. Tente novamente.', advice:'Verifique disponibilidade do serviço, conectividade, logs e métricas. Se nenhuma resposta HTTP chega, pode ser uma falha de conexão ou timeout.'},
 {label:'Dados inválidos', status:'400 Bad Request', at:2, color:'orange', message:'Confira os dados do pedido e tente novamente.', advice:'Valide os campos no cliente para orientar a pessoa e valide novamente no servidor, pois o cliente não é uma fronteira confiável.'},
 {label:'Acesso negado', status:'403 Forbidden', at:2, color:'purple', message:'Você não tem permissão para realizar esta ação.', advice:'Confira as permissões do usuário e as regras de autorização. Um 401 normalmente indica autenticação ausente ou inválida; 403 indica acesso proibido.'},
 {label:'Recurso não encontrado', status:'404 Not Found', at:3, color:'cyan', message:'O recurso solicitado não foi encontrado.', advice:'Confira a URL, a rota registrada e se o identificador do recurso existe.'},
 {label:'Erro interno', status:'500 Internal Server Error', at:2, color:'orange', message:'O pedido não pôde ser concluído agora. Tente novamente.', advice:'Use logs correlacionados à requisição, monitore exceções e evite expor detalhes internos na mensagem apresentada ao usuário.'},
 {label:'Banco indisponível', status:'503 Service Unavailable', at:4, color:'green', message:'Estamos com uma instabilidade temporária. Tente novamente.', advice:'Confira a conectividade, limites de conexões, credenciais do ambiente e saúde do banco. Registre o erro sem expor segredos.'},
]

function App() {
  const [active, setActive] = useState(0)
  const [running, setRunning] = useState(false)
  const [started, setStarted] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [selectedTech, setSelectedTech] = useState('React')
  const [failure, setFailure] = useState<number | null>(null)
  const [showGlossary, setShowGlossary] = useState(false)
  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setActive(s => { if (s >= steps.length - 1) { setRunning(false); return s }; return s + 1 }), 2700)
    return () => window.clearInterval(timer)
  }, [running])
  const selectStep = (i:number) => { setActive(Math.max(0, Math.min(steps.length - 1, i))); setStarted(true); setFailure(null) }
  const current = steps[active]
  const selectedFailure = failure === null ? null : failures[failure]
  const startSimulation = () => { setActive(0); setFailure(null); setStarted(true); setRunning(true) }
  const goTo = (id:string) => { document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); setMobileNav(false) }
  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#inicio" aria-label="Jornada Web, início"><span className="brand-mark"><Network size={19}/></span><span>JORNADA<span className="brand-light">.WEB</span></span></a>
      <nav className={mobileNav ? 'nav-links nav-open' : 'nav-links'} aria-label="Navegação principal">
        <button onClick={() => goTo('jornada')}>A jornada</button><button onClick={() => goTo('tecnologias')}>Tecnologias</button><button onClick={() => goTo('falhas')}>Laboratório de falhas</button>
      </nav>
      <div className="topbar-right"><span className="status-dot"/> <span className="status-label">LABORATÓRIO INTERATIVO</span><button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Abrir menu">{mobileNav ? <X/> : <Menu/>}</button></div>
    </header>
    <main>
      <section className="hero section-wrap" id="inicio">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line"/> EXPLORANDO A ARQUITETURA WEB <span className="eyebrow-index">01 — 06</span></div>
          <h1>Por trás de<br/>cada <span className="gradient-text">clique.</span></h1>
          <p className="hero-subtitle">Uma jornada visual pelo caminho que seus dados percorrem — da interface ao servidor, do banco de dados de volta à tela.</p>
          <div className="hero-actions"><button className="primary-button" onClick={() => {startSimulation(); goTo('jornada')}}><Play size={16} fill="currentColor"/> Iniciar simulação <ArrowRight size={17}/></button><button className="text-button" onClick={() => goTo('arquitetura')}>Explorar arquitetura <ArrowDown size={15}/></button></div>
          <div className="hero-metrics"><div><strong>06</strong><span>etapas conectadas</span></div><div><strong>01</strong><span>requisição completa</span></div><div><strong>∞</strong><span>coisas para descobrir</span></div></div>
        </div>
        <div className="hero-art" aria-label="Ilustração de uma pessoa usando uma aplicação web conectada a um servidor e banco de dados">
          <div className="art-glow glow-one"/><div className="art-glow glow-two"/>
          <div className="scene-label label-browser"><span className="tiny-dot blue-dot"/> NAVEGADOR <span className="label-line"/></div>
          <div className="desk-scene">
            <div className="window-back"/><div className="monitor"><div className="monitor-top"><i/><i/><i/><span>loja.exemplo.com</span><span className="lock">⌑</span></div><div className="store-ui"><div className="store-nav"><b>nord<span>®</span></b><span>Novidades　Coleções　Sobre</span><ShoppingBag size={13}/></div><div className="store-content"><div className="store-kicker">SÉRIE ESSENCIAL / 04</div><div className="store-title">Feito para<br/><em>o seu ritmo.</em></div><div className="product-art"><div className="product-shadow"/><div className="product-keyboard"><div className="keyboard-keys"/></div></div><div className="store-bottom"><span>Teclado mecânico / grafite</span><b>R$ 149,90</b></div><button className={started && active >= 1 ? 'buy-button buy-done' : 'buy-button'} onClick={() => {startSimulation(); goTo('jornada')}}>{started && active >= 5 ? 'Pedido confirmado ✓' : 'Finalizar compra'} <ArrowUpRight size={12}/></button></div></div></div>
            <div className="monitor-stand"/><div className="desk"/><div className="desk-leg leg-one"/><div className="desk-leg leg-two"/>
            <div className="person"><div className="person-head"/><div className="person-hair"/><div className="person-neck"/><div className="person-body"/><div className="person-arm"/><div className="person-hand"/><div className="person-leg"/><div className="person-chair"/></div>
            <div className="plant"><span/><span/><span/><i/></div><div className="coffee"><i/></div>
          </div>
          <div className="data-path path-one"><span className="path-node"/><span className="data-packet"/><span className="path-node"/></div>
          <div className="floating-code code-request"><div className="code-head"><span className="code-led"/> REQUEST <span className="code-method">POST</span></div><code>/api/pedidos</code><div className="code-row"><span>{'{ produto:'}</span><b> 'teclado'</b></div><div className="code-row"><span>quantidade:</span><b> 1 {'}'}</b></div></div>
          <div className="mini-server"><div className="server-top"/><div className="server-unit"><i/><i/><i/><span/></div><div className="server-unit"><i/><i/><i/><span/></div><div className="server-unit"><i/><i/><i/><span/></div></div>
          <div className="floating-code code-response"><div className="response-check"><Check size={13}/></div><div><b>201 Created</b><span>Pedido confirmado</span></div></div>
          <div className="scene-label label-server"><span className="tiny-dot purple-dot"/> BACK-END <span className="label-line"/></div>
          <div className="hero-art-caption"><span className="caption-index">FIG 01.</span> O clique é só o começo. <span className="caption-muted">Observe o que acontece por trás da interface.</span></div>
        </div>
        <div className="hero-scroll"><span className="scroll-line"/> ROLE PARA EXPLORAR <ArrowDown size={12}/></div>
      </section>

      <section className="journey-section section-wrap" id="jornada">
        <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> A EXPERIÊNCIA, PASSO A PASSO</div><h2>Uma ação. <span className="muted-heading">Muitas camadas.</span></h2></div><div className="heading-aside">Acompanhe uma requisição realista<br/>em uma aplicação de demonstração.</div></div>
        <div className="journey-layout">
          <aside className="step-rail" aria-label="Etapas da simulação">{steps.map((s,i)=>{const Icon=s.icon; return <button key={s.id} className={`rail-step ${active===i?'rail-active':''} ${active>i?'rail-complete':''}`} onClick={()=>selectStep(i)} aria-current={active===i?'step':undefined}><span className="rail-icon"><Icon size={17}/></span><span className="rail-copy"><small>ETAPA 0{i+1}</small><b>{s.short}</b></span>{active>i&&<Check className="rail-check" size={14}/>}</button>})}</aside>
          <div className="simulation-panel">
            <div className="simulation-top"><div className="simulation-title"><span className="live-indicator"/> <span>SIMULAÇÃO DE REQUISIÇÃO</span></div><div className="sim-state">{running?'EM EXECUÇÃO':started?'PAUSADA / MANUAL':'PRONTA PARA INICIAR'}</div></div>
            <div className="flow-canvas">
              <div className="flow-grid"/>
              <div className="flow-node node-client"><div className="node-symbol browser-symbol"><Globe2 size={24}/></div><span>NAVEGADOR</span><small>cliente</small></div>
              <div className="flow-node node-server"><div className="node-symbol server-symbol"><Server size={24}/></div><span>APLICAÇÃO</span><small>servidor</small></div>
              <div className="flow-node node-db"><div className="node-symbol db-symbol"><Database size={24}/></div><span>DADOS</span><small>persistência</small></div>
              <svg className="flow-lines" viewBox="0 0 800 250" preserveAspectRatio="none" aria-hidden="true"><path d="M95 102 H350" className="line-base"/><path d="M95 102 H350" className="line-active line-blue"/><path d="M405 102 H660" className="line-base"/><path d="M405 102 H660" className="line-active line-purple"/><path d="M660 142 H405" className="line-return"/><path d="M350 142 H95" className="line-return"/></svg>
              <div className={`flow-packet packet-request ${active>=1&&active<=4?'packet-visible':''}`} key={`req-${active}`}><span/></div><div className={`flow-packet packet-return ${active===5?'packet-visible':''}`} key={`res-${active}`}><span/></div>
              <div className={`flow-tag tag-request ${active>=1&&active<=4?'tag-lit':''}`}>POST /api/pedidos</div><div className={`flow-tag tag-return ${active===5?'tag-lit':''}`}>201 Created</div>
              <div className="canvas-footer"><span><i className="legend-dot dot-out"/> Requisição</span><span><i className="legend-dot dot-back"/> Resposta</span><span className="https-tag"><ShieldCheck size={12}/> HTTPS</span></div>
            </div>
            <div className="step-detail" key={current.id}>
              <div className={`step-number number-${current.color}`}>{current.eyebrow}</div><h3>{current.title}</h3><p>{current.description}</p><p className="detail-secondary">{current.detail}</p>
              <div className="data-exchange"><div><span>RECEBE</span><p>{current.receives}</p></div><ArrowRight size={16}/><div><span>ENVIA</span><p>{current.sends}</p></div></div>
              <div className="tech-tags">{current.tech.map(t=><span key={t}>{t}</span>)}</div>
            </div>
            <div className="sim-controls"><div className="control-left"><button className="icon-button" onClick={()=>{setRunning(false);selectStep(0)}} aria-label="Reiniciar"><RotateCcw size={16}/></button><button className="icon-button" onClick={()=>selectStep(active-1)} disabled={active===0} aria-label="Etapa anterior"><ArrowLeft size={16}/></button><button className="icon-button" onClick={()=>selectStep(active+1)} disabled={active===steps.length-1} aria-label="Próxima etapa"><ArrowRight size={16}/></button><button className="play-control" onClick={()=>{if(active===steps.length-1){setActive(0);setRunning(true);setStarted(true)}else{setStarted(true);setRunning(!running)}}}>{running?<><Pause size={14} fill="currentColor"/> Pausar</>:<><Play size={14} fill="currentColor"/> {started?'Continuar':'Reproduzir'}</>}</button></div><div className="progress-wrap"><div className="progress-label"><span>PROGRESSO</span><b>{String(active+1).padStart(2,'0')} <i>/ 06</i></b></div><div className="progress-track">{steps.map((s,i)=><button key={s.id} className={i<=active?'progress-segment segment-done':''} onClick={()=>selectStep(i)} aria-label={`Ir para ${s.short}`}/>)}</div></div></div>
          </div>
        </div>
        <div className="insight-strip"><div className="insight-icon"><Zap size={19}/></div><div><b>O detalhe importante</b><p>O navegador normalmente não conversa diretamente com o banco de dados. O servidor aplica as regras e controla o acesso aos dados.</p></div><button onClick={()=>setShowGlossary(!showGlossary)}>{showGlossary?'Fechar glossário':'Entender os termos'} <ArrowRight size={15}/></button></div>
        <AnimatePresence>{showGlossary&&<motion.div className="glossary-panel" initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}><div><b>Endpoint</b><span>Um endereço específico da API, como <code>/api/pedidos</code>.</span></div><div><b>JSON</b><span>Formato textual comum para representar e trocar dados.</span></div><div><b>HTTP status</b><span>Um código que resume o resultado de uma requisição.</span></div><div><b>Persistência</b><span>Guardar dados para que continuem disponíveis depois.</span></div></motion.div>}</AnimatePresence>
      </section>

      <section className="architecture-section section-wrap" id="arquitetura">
        <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> VISÃO DE CONJUNTO</div><h2>A arquitetura <span className="muted-heading">em um olhar.</span></h2></div><p className="heading-aside">Selecione uma camada para entender<br/>seu papel dentro do sistema.</p></div>
        <div className="architecture-map">
          <div className="map-header"><span><span className="map-pulse"/> MAPA DA APLICAÇÃO</span><span className="map-meta">FLUXO SIMPLIFICADO · REST / HTTP</span></div>
          <div className="map-stage">
            <div className="map-person"><div className="person-avatar"><span/></div><b>Pessoa</b><small>interage</small></div>
            <div className="map-connection"><span className="connection-label">clique</span><div className="connection-line blue-line"><i/></div></div>
            <button className={`map-component map-browser ${active===0?'map-selected':''}`} onClick={()=>selectStep(0)}><div className="map-window-icon"><span/><span/><span/><Code2 size={24}/></div><b>Front-end</b><small>Interface no navegador</small><em>HTML · CSS · JS</em></button>
            <div className="map-connection"><span className="connection-label">requisição / resposta</span><div className="connection-line cyan-line"><i/></div></div>
            <button className={`map-component map-api ${active===3?'map-selected':''}`} onClick={()=>selectStep(3)}><div className="api-glyph"><GitBranch size={25}/></div><b>API / HTTP</b><small>Contrato de comunicação</small><em>POST · JSON · 201</em></button>
            <div className="map-connection"><span className="connection-label">regras de negócio</span><div className="connection-line purple-line"><i/></div></div>
            <button className={`map-component map-backend ${active===2?'map-selected':''}`} onClick={()=>selectStep(2)}><div className="rack-glyph"><span/><span/><span/></div><b>Back-end</b><small>Processa a requisição</small><em>Node · Python · Java</em></button>
            <div className="map-connection"><span className="connection-label">consulta / gravação</span><div className="connection-line green-line"><i/></div></div>
            <button className={`map-component map-database ${active===4?'map-selected':''}`} onClick={()=>selectStep(4)}><div className="db-glyph"><Database size={26}/></div><b>Banco de dados</b><small>Guarda os registros</small><em>SQL · documentos</em></button>
          </div>
          <div className="map-bottom"><span><i className="legend-dot dot-out"/> Ida: pedido de operação</span><span><i className="legend-dot dot-back"/> Volta: resultado ao navegador</span><button onClick={()=>{selectStep(5);goTo('jornada')}}>Ver caminho de volta <ArrowRight size={14}/></button></div>
        </div>
        <div className="architecture-note"><Layers3 size={18}/><p><b>Uma arquitetura, várias possibilidades.</b> As tecnologias mostradas são exemplos. Uma aplicação pode usar combinações diferentes conforme seus requisitos, escala e equipe.</p></div>
      </section>

      <section className="tech-section section-wrap" id="tecnologias">
        <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> FERRAMENTAS DO OFÍCIO</div><h2>Peças de um <span className="muted-heading">ecossistema.</span></h2></div><p className="heading-aside">Cada ferramenta tem uma função.<br/>Nenhuma stack precisa de todas elas.</p></div>
        <div className="tech-explorer"><div className="tech-list">{technologies.map((t,i)=><button key={t.name} onClick={()=>setSelectedTech(t.name)} className={`tech-item ${selectedTech===t.name?'tech-selected':''}`}><span className={`tech-logo tech-${t.color}`}>{t.name.slice(0,2).toUpperCase()}</span><span className="tech-name"><b>{t.name}</b><small>{t.group}</small></span><span className="tech-type">{t.type}</span><ArrowUpRight size={15}/></button>)}</div><AnimatePresence mode="wait"><motion.div className="tech-detail" key={selectedTech} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.2}}><div className="tech-detail-top"><span className={`tech-logo tech-${technologies.find(t=>t.name===selectedTech)?.color||'blue'}`}>{selectedTech.slice(0,2).toUpperCase()}</span><span className="tech-category">{technologies.find(t=>t.name===selectedTech)?.group}</span></div><div className="tech-detail-content"><div className="eyebrow">EM FOCO</div><h3>{selectedTech}</h3><span className="type-pill">{technologies.find(t=>t.name===selectedTech)?.type}</span><p>{technologies.find(t=>t.name===selectedTech)?.desc}</p><div className="used-in"><span>ONDE SE ENCAIXA</span><div className="used-bar"><i style={{width:selectedTech==='PostgreSQL'?'100%':selectedTech==='Docker'?'85%':selectedTech==='Express'||selectedTech==='FastAPI'?'72%':'48%'}}/></div><small>{technologies.find(t=>t.name===selectedTech)?.group==='FRONT-END'?'Interface do navegador':technologies.find(t=>t.name===selectedTech)?.group==='BACK-END'?'Aplicação no servidor':technologies.find(t=>t.name===selectedTech)?.group==='DADOS'?'Camada de persistência':'Ambiente de execução e entrega'}</small></div></div><div className="tech-detail-foot"><CircleHelp size={15}/> A tecnologia é uma opção, não uma obrigação.</div></motion.div></AnimatePresence></div>
      </section>

      <section className="errors-section section-wrap" id="falhas">
        <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line orange-line"/> MODO DE INVESTIGAÇÃO</div><h2>Quando algo <span className="muted-heading">sai do fluxo.</span></h2></div><p className="heading-aside">Sistemas também falham. Entender onde<br/>e como é parte do trabalho.</p></div>
        <div className="error-lab"><div className="error-sidebar"><div className="error-sidebar-head"><Terminal size={17}/><span>SIMULADOR DE FALHAS</span></div><p>Escolha um cenário para observar onde o fluxo é interrompido.</p>{failures.map((f,i)=><button key={f.label} className={`failure-choice ${failure===i?'failure-selected':''}`} onClick={()=>setFailure(i)}><span className={`failure-dot failure-${f.color}`}/><span>{f.label}</span><ArrowRight size={14}/></button>)}<button className="reset-failure" onClick={()=>setFailure(null)}><RotateCcw size={13}/> Limpar simulação</button></div>
          <div className="error-output">{selectedFailure ? <motion.div key={selectedFailure.label} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="failure-result"><div className="failure-status"><span className={`failure-dot failure-${selectedFailure.color}`}/> CENÁRIO ATIVO <b>{selectedFailure.status}</b></div><div className="failure-flow">{['Navegador','API / servidor','Banco de dados'].map((label,i)=><div key={label} className={`failure-flow-node ${i===selectedFailure.at?'node-failed':''} ${i<selectedFailure.at?'node-passed':''}`}><span>{i===0?<Globe2 size={18}/>:i===1?<Server size={18}/>:<Database size={18}/>}</span><b>{label}</b>{i===selectedFailure.at&&<em>FALHA</em>}</div>)}</div><div className="failure-message"><div className="failure-message-icon"><X size={17}/></div><div><span>MENSAGEM NA INTERFACE</span><p>“{selectedFailure.message}”</p></div></div><div className="debug-advice"><b><ShieldCheck size={15}/> Como investigar</b><p>{selectedFailure.advice}</p></div></motion.div> : <div className="error-empty"><div className="empty-icon"><CircleHelp size={26}/></div><h3>Simule um cenário.</h3><p>Selecione uma falha na lista ao lado para ver o ponto de interrupção, a mensagem que chega à interface e algumas pistas de investigação.</p><div className="empty-terminal"><span>$</span> aguardando cenário<span className="terminal-cursor">_</span></div></div>}</div>
        </div>
      </section>

      <section className="closing section-wrap"><div className="closing-orbit orbit-a"/><div className="closing-orbit orbit-b"/><div className="closing-copy"><div className="eyebrow"><span className="eyebrow-line"/> FIM DO PERCURSO. INÍCIO DO ENTENDIMENTO.</div><h2>Agora você sabe<br/>o que existe <span className="gradient-text">por trás.</span></h2><p>Um clique simples pode atravessar várias camadas. Quando cada uma tem uma responsabilidade clara, fica mais fácil construir, investigar e evoluir aplicações.</p><button className="primary-button" onClick={()=>{setActive(0);setFailure(null);setStarted(false);setRunning(false);goTo('jornada')}}><RotateCcw size={15}/> Refazer a jornada <ArrowRight size={16}/></button></div><div className="closing-visual"><div className="closing-ring ring-outer"/><div className="closing-ring ring-inner"/><div className="closing-center"><Check size={29}/></div><span className="orbit-label orbit-label-one">FRONT-END</span><span className="orbit-label orbit-label-two">API</span><span className="orbit-label orbit-label-three">BACK-END</span><span className="orbit-label orbit-label-four">DATABASE</span><div className="orbit-point point-a"/><div className="orbit-point point-b"/><div className="orbit-point point-c"/></div></section>
    </main>
    <footer className="footer"><a className="brand" href="#inicio"><span className="brand-mark"><Network size={17}/></span><span>JORNADA<span className="brand-light">.WEB</span></span></a><span>UM LABORATÓRIO VISUAL DE ARQUITETURA WEB</span><span className="footer-right">FEITO PARA CURIOSOS <span>✳</span> 2026</span></footer>
  </div>
}
export default App
