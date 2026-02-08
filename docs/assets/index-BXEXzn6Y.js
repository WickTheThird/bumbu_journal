(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))i(e);new MutationObserver(e=>{for(const l of e)if(l.type==="childList")for(const m of l.addedNodes)m.tagName==="LINK"&&m.rel==="modulepreload"&&i(m)}).observe(document,{childList:!0,subtree:!0});function t(e){const l={};return e.integrity&&(l.integrity=e.integrity),e.referrerPolicy&&(l.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?l.credentials="include":e.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function i(e){if(e.ep)return;e.ep=!0;const l=t(e);fetch(e.href,l)}})();const w=`<span class="logo-main">██╗    ██╗ ██╗  ██████╗ ██╗  ██╗
██║    ██║ ██║ ██╔════╝ ██║ ██╔╝
██║ █╗ ██║ ██║ ██║      █████╔╝ 
██║███╗██║ ██║ ██║      ██╔═██╗ 
╚███╔███╔╝ ██║ ╚██████╗ ██║  ██╗
 ╚══╝╚══╝  ╚═╝  ╚═════╝ ╚═╝  ╚═╝</span>
<span class="drip">  ║│        │    ║║         │ ║</span>
<span class="drip">  ║│        │    ║║         │ ║</span>
<span class="drip">  │         │     ║           │</span>
<span class="drip">  │         │     ║           │</span>
<span class="drip">            ╵     ╵            </span>`,a={name:"Filip Bumbu",alias:"WickTheThird",title:"Full Stack Developer & Freelancer",location:"Ireland 🇮🇪",email:"contact@filipbumbu.dev",github:"https://github.com/WickTheThird",linkedin:"https://www.linkedin.com/in/filip-bumbu-410741262/",status:"Available for hire ✓"};let r=[];const k=[{category:"Languages",items:["Python","JavaScript","TypeScript","Java","C++"]},{category:"Frontend",items:["React","Vue","Tailwind","HTML/CSS"]},{category:"Backend",items:["FastAPI","Node.js","Express","Django"]},{category:"Database",items:["PostgreSQL","MongoDB","Redis","Elasticsearch"]},{category:"DevOps",items:["Docker","Jenkins","Kubernetes","AWS"]},{category:"Monitoring",items:["Grafana","Prometheus","Datadog"]},{category:"Tools",items:["Git","Linux","Kafka","RabbitMQ"]}],d={help:()=>`
<span class="cyan">Available Commands:</span>

  <span class="green">about</span>          Who am I? My story and profile
  <span class="green">skills</span>         Technical skills & expertise
  <span class="green">proj</span>           List my GitHub projects
  <span class="green">open</span> <span class="dim">[name]</span>   Open a project (e.g., open bumbu_journal)
  <span class="green">contact</span>        Ways to reach me
  <span class="green">social</span>         Social media links
  <span class="green">hire</span>           Freelance availability & rates
  <span class="green">whoami</span>         Quick intro
  <span class="green">clear</span>          Clear the terminal
  <span class="green">help</span>           Show this message

<span class="dim">Tip: Click on any link to open it!</span>
`,about:()=>`
<span class="cyan">┌─────────────────────────────────────────────────────────┐</span>
<span class="cyan">│</span>  <span class="green">About Me</span>                                              <span class="cyan">│</span>
<span class="cyan">└─────────────────────────────────────────────────────────┘</span>

  Hey! I'm <span class="green">${a.name}</span>, aka <span class="cyan">${a.alias}</span>.

  I'm a passionate <span class="yellow">${a.title}</span> based in ${a.location}.
  
  I love building things that live on the internet — whether 
  that's websites, applications, or anything in between.
  
  When I'm not coding, you'll find me exploring new technologies,
  contributing to open source, or hunting for the perfect cup 
  of coffee ☕

  <span class="dim">Currently:</span> <span class="green">${a.status}</span>

<span class="dim">  Type 'skills' to see my tech stack, or 'contact' to reach out!</span>
`,whoami:()=>`
<span class="green">${a.name}</span> <span class="dim">(@${a.alias})</span>
${a.title}
📍 ${a.location}
<span class="green">${a.status}</span>
`,skills:()=>{let n=`
<span class="cyan">┌─────────────────────────────────────────────────────────┐</span>
<span class="cyan">│</span>  <span class="green">Technical Skills</span>                                      <span class="cyan">│</span>
<span class="cyan">└─────────────────────────────────────────────────────────┘</span>
`;return k.forEach(s=>{n+=`
  <span class="yellow">${s.category}</span>
  <span class="dim">└─</span> ${s.items.map(t=>`<span class="white">${t}</span>`).join(" • ")}
`}),n+=`
<span class="dim">  ...and always learning more!</span>
`,n},proj:async()=>{if(r.length===0){o('<span class="dim">Fetching projects from GitHub...</span>');try{r=await(await fetch("https://api.github.com/users/WickTheThird/repos?sort=updated&per_page=10")).json()}catch{return'<span class="red">Error fetching projects. Try again later.</span>'}}let n=`
<span class="cyan">┌─────────────────────────────────────────────────────────┐</span>
<span class="cyan">│</span>  <span class="green">GitHub Projects</span>                                       <span class="cyan">│</span>
<span class="cyan">└─────────────────────────────────────────────────────────┘</span>
`;return r.forEach((s,t)=>{const i=s.stargazers_count>0?` ⭐ ${s.stargazers_count}`:"",e=s.language?`<span class="yellow">[${s.language}]</span>`:"";n+=`
  <span class="green">${String(t+1).padStart(2,"0")}.</span> <a href="${s.html_url}" target="_blank" class="project-link">${s.name}</a> ${e}${i}
      <span class="dim">${s.description||"No description"}</span>
`}),n+=`
<span class="dim">  Type 'open [name]' to visit a project</span>
`,n},ls:()=>d.proj(),open:n=>{const s=n.join(" ").toLowerCase();if(!s)return'<span class="yellow">Usage: open [project-name]</span>';const t=r.find(i=>i.name.toLowerCase().includes(s));return t?(window.open(t.html_url,"_blank"),`<span class="green">Opening ${t.name}...</span>`):(window.open(`https://github.com/WickTheThird/${s}`,"_blank"),`<span class="green">Opening github.com/WickTheThird/${s}...</span>`)},contact:()=>`
<span class="cyan">┌─────────────────────────────────────────────────────────┐</span>
<span class="cyan">│</span>  <span class="green">Get In Touch</span>                                          <span class="cyan">│</span>
<span class="cyan">└─────────────────────────────────────────────────────────┘</span>

  <span class="yellow">📧 Email</span>
     <a href="mailto:${a.email}" class="link">${a.email}</a>

  <span class="yellow">💼 LinkedIn</span>
     <a href="${a.linkedin}" target="_blank" class="link">linkedin.com/in/filip-bumbu</a>

  <span class="yellow">🐙 GitHub</span>
     <a href="${a.github}" target="_blank" class="link">github.com/WickTheThird</a>

<span class="dim">  I typically respond within 24 hours!</span>
`,social:()=>`
<span class="cyan">Social Links</span>

  <span class="white">GitHub</span>     <a href="${a.github}" target="_blank" class="link">github.com/WickTheThird</a>
  <span class="white">LinkedIn</span>   <a href="${a.linkedin}" target="_blank" class="link">linkedin.com/in/filip-bumbu</a>

<span class="dim">  Click any link to open!</span>
`,hire:()=>`
<span class="cyan">┌─────────────────────────────────────────────────────────┐</span>
<span class="cyan">│</span>  <span class="green">🚀 Hire Me</span>                                            <span class="cyan">│</span>
<span class="cyan">└─────────────────────────────────────────────────────────┘</span>

  <span class="green">Status:</span> ${a.status}

  <span class="yellow">What I Can Do For You:</span>
  
  • Full-stack web development
  • Custom web applications
  • API design & development
  • Database architecture
  • Code review & consulting
  • Bug fixes & maintenance

  <span class="yellow">Let's Work Together:</span>
  
  📧 <a href="mailto:${a.email}" class="link">${a.email}</a>
  💼 <a href="${a.linkedin}" target="_blank" class="link">Connect on LinkedIn</a>

<span class="dim">  Serious inquiries only. Let's build something great!</span>
`,clear:()=>(f.innerHTML="",null),github:()=>(window.open(a.github,"_blank"),'<span class="green">Opening GitHub profile...</span>'),linkedin:()=>(window.open(a.linkedin,"_blank"),'<span class="green">Opening LinkedIn profile...</span>'),echo:n=>n.join(" "),date:()=>new Date().toLocaleString(),pwd:()=>"/home/wick",neofetch:()=>`
<span class="cyan">${a.alias}</span>@<span class="cyan">portfolio</span>
──────────────────────
<span class="yellow">OS:</span> WickOS v3.0
<span class="yellow">Host:</span> GitHub Pages
<span class="yellow">Shell:</span> wick-terminal
<span class="yellow">Theme:</span> Neon Graffiti
<span class="yellow">Status:</span> <span class="green">${a.status}</span>
`},y=["",'<span class="ascii-logo">'+w+"</span>","",'<span class="dim">────────────────────────────────────────────────────────────</span>',"",`  <span class="green">WICK TERMINAL</span> <span class="dim">v3.0.0</span>  <span class="yellow">│</span>  <span class="white">${a.name}</span>  <span class="yellow">│</span>  <span class="dim">${a.title}</span>`,"",`  <span class="green">${a.status}</span>`,"",'<span class="dim">────────────────────────────────────────────────────────────</span>',"",'  <span class="yellow">⚡</span> Type <span class="green">help</span> to see available commands','  <span class="yellow">⚡</span> Type <span class="green">about</span> to learn more about me','  <span class="yellow">⚡</span> Type <span class="green">proj</span> to see my work',""];document.querySelector("#app").innerHTML=`
  <div class="terminal-container">
    <div class="scanlines"></div>
    
    <div class="terminal-window">
      <div class="terminal-header">
        <div class="terminal-buttons">
          <span class="btn-close"></span>
          <span class="btn-minimize"></span>
          <span class="btn-maximize"></span>
        </div>
        <div class="terminal-title">wick@portfolio ~ </div>
        <div class="terminal-status">
          <span class="status-dot"></span>
          <span>online</span>
        </div>
      </div>
      
      <div class="terminal-body" id="terminal">
        <div class="output" id="output"></div>
        
        <div class="input-line">
          <span class="prompt">wick@portfolio:~$</span>
          <input type="text" class="command-input" id="commandInput" autofocus spellcheck="false" autocomplete="off" />
        </div>
      </div>
    </div>
  </div>
`;const f=document.getElementById("output"),p=document.getElementById("commandInput"),h=document.getElementById("terminal");function o(n){const s=document.createElement("div");s.className="output-line",s.innerHTML=n,f.appendChild(s),h.scrollTop=h.scrollHeight}let g=0;function b(){g<y.length&&(o(y[g]),g++,setTimeout(b,25))}b();const u=[];let c=-1;p.addEventListener("keydown",async n=>{if(n.key==="Enter"){const s=p.value.trim();if(s){u.unshift(s),c=-1,o(`<span class="prompt">wick@portfolio:~$</span> ${s}`);const[t,...i]=s.toLowerCase().split(" ");if(d[t]){const e=await d[t](i);e&&o(e)}else o(`<span class="red">Command not found: ${t}</span>
<span class="dim">Type 'help' for available commands</span>`)}p.value=""}else if(n.key==="ArrowUp")n.preventDefault(),c<u.length-1&&(c++,p.value=u[c]);else if(n.key==="ArrowDown")n.preventDefault(),c>0?(c--,p.value=u[c]):(c=-1,p.value="");else if(n.key==="Tab"){n.preventDefault();const s=p.value.toLowerCase(),t=Object.keys(d).find(i=>i.startsWith(s));t&&(p.value=t)}});h.addEventListener("click",()=>p.focus());document.addEventListener("keydown",n=>{!n.ctrlKey&&!n.metaKey&&!n.altKey&&p.focus()});
