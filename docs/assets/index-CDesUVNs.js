(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))i(t);new MutationObserver(t=>{for(const l of t)if(l.type==="childList")for(const m of l.addedNodes)m.tagName==="LINK"&&m.rel==="modulepreload"&&i(m)}).observe(document,{childList:!0,subtree:!0});function e(t){const l={};return t.integrity&&(l.integrity=t.integrity),t.referrerPolicy&&(l.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?l.credentials="include":t.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function i(t){if(t.ep)return;t.ep=!0;const l=e(t);fetch(t.href,l)}})();const b=`<span class="logo-main">██╗    ██╗ ██╗  ██████╗ ██╗  ██╗
██║    ██║ ██║ ██╔════╝ ██║ ██╔╝
██║ █╗ ██║ ██║ ██║      █████╔╝ 
██║███╗██║ ██║ ██║      ██╔═██╗ 
╚███╔███╔╝ ██║ ╚██████╗ ██║  ██╗
 ╚══╝╚══╝  ╚═╝  ╚═════╝ ╚═╝  ╚═╝</span>
<span class="drip">  ║│        │    ║║         │ ║</span>
<span class="drip">  ║│        │    ║║         │ ║</span>
<span class="drip">  │         │     ║           │</span>
<span class="drip">  │         │     ║           │</span>
<span class="drip">            ╵     ╵            </span>`,n={name:"Filip Bumbu",alias:"WickTheThird",title:"Full Stack Developer & Freelancer",location:"Ireland 🇮🇪",email:"contact@filipbumbu.dev",github:"https://github.com/WickTheThird",linkedin:"https://www.linkedin.com/in/filip-bumbu-410741262/",status:"Available for hire ✓"};let r=[];const k=[{category:"Languages",items:["Python","JavaScript","TypeScript","Java","C++"]},{category:"Frontend",items:["React","Vue","Tailwind","HTML/CSS"]},{category:"Backend",items:["FastAPI","Node.js","Express","Django"]},{category:"Database",items:["PostgreSQL","MongoDB","Redis","Elasticsearch"]},{category:"DevOps",items:["Docker","Jenkins","Kubernetes","AWS"]},{category:"Monitoring",items:["Grafana","Prometheus","Datadog"]},{category:"Tools",items:["Git","Linux","Kafka","RabbitMQ"]}],d={help:()=>`
<span class="cyan">Available Commands:</span>

  <span class="green">about</span>          Who am I? My story and profile
  <span class="green">skills</span>         Technical skills & expertise
  <span class="green">proj</span>           List my GitHub projects
  <span class="green">open</span> <span class="dim">[name]</span>   Open a project (e.g., open bumbu_journal)
  <span class="green">contact</span>        Ways to reach me
  <span class="green">social</span>         Social media links
  <span class="green">hire</span>           Freelance availability & rates
  <span class="green">whoami</span>         Quick intro
  <span class="green">clear</span>          Clear commands (keep welcome)
  <span class="green">empty</span>          Clear everything
  <span class="green">help</span>           Show this message

<span class="dim">Tip: Click on any link to open it!</span>
`,about:()=>`
<span class="cyan">┌─────────────────────────────────────────────────────────┐</span>
<span class="cyan">│</span>  <span class="green">About Me</span>                                              <span class="cyan">│</span>
<span class="cyan">└─────────────────────────────────────────────────────────┘</span>

  Hey! I'm <span class="green">${n.name}</span>, aka <span class="cyan">${n.alias}</span>.

  I'm a passionate <span class="yellow">${n.title}</span> based in ${n.location}.
  
  I love building things that live on the internet — whether 
  that's websites, applications, or anything in between.
  
  When I'm not coding, you'll find me exploring new technologies,
  contributing to open source, or hunting for the perfect cup 
  of coffee ☕

  <span class="dim">Currently:</span> <span class="green">${n.status}</span>

<span class="dim">  Type 'skills' to see my tech stack, or 'contact' to reach out!</span>
`,whoami:()=>`
<span class="green">${n.name}</span> <span class="dim">(@${n.alias})</span>
${n.title}
📍 ${n.location}
<span class="green">${n.status}</span>
`,skills:()=>{let a=`
<span class="cyan">┌─────────────────────────────────────────────────────────┐</span>
<span class="cyan">│</span>  <span class="green">Technical Skills</span>                                      <span class="cyan">│</span>
<span class="cyan">└─────────────────────────────────────────────────────────┘</span>
`;return k.forEach(s=>{a+=`
  <span class="yellow">${s.category}</span>
  <span class="dim">└─</span> ${s.items.map(e=>`<span class="white">${e}</span>`).join(" • ")}
`}),a+=`
<span class="dim">  ...and always learning more!</span>
`,a},proj:async()=>{if(r.length===0){o('<span class="dim">Fetching projects from GitHub...</span>');try{r=await(await fetch("https://api.github.com/users/WickTheThird/repos?sort=updated&per_page=10")).json()}catch{return'<span class="red">Error fetching projects. Try again later.</span>'}}let a=`
<span class="cyan">┌─────────────────────────────────────────────────────────┐</span>
<span class="cyan">│</span>  <span class="green">GitHub Projects</span>                                       <span class="cyan">│</span>
<span class="cyan">└─────────────────────────────────────────────────────────┘</span>
`;return r.forEach((s,e)=>{const i=s.stargazers_count>0?` ⭐ ${s.stargazers_count}`:"",t=s.language?`<span class="yellow">[${s.language}]</span>`:"";a+=`
  <span class="green">${String(e+1).padStart(2,"0")}.</span> <a href="${s.html_url}" target="_blank" class="project-link">${s.name}</a> ${t}${i}
      <span class="dim">${s.description||"No description"}</span>
`}),a+=`
<span class="dim">  Type 'open [name]' to visit a project</span>
`,a},ls:()=>d.proj(),open:a=>{const s=a.join(" ").toLowerCase();if(!s)return'<span class="yellow">Usage: open [project-name]</span>';const e=r.find(i=>i.name.toLowerCase().includes(s));return e?(window.open(e.html_url,"_blank"),`<span class="green">Opening ${e.name}...</span>`):(window.open(`https://github.com/WickTheThird/${s}`,"_blank"),`<span class="green">Opening github.com/WickTheThird/${s}...</span>`)},contact:()=>`
<span class="cyan">┌─────────────────────────────────────────────────────────┐</span>
<span class="cyan">│</span>  <span class="green">Get In Touch</span>                                          <span class="cyan">│</span>
<span class="cyan">└─────────────────────────────────────────────────────────┘</span>

  <span class="yellow">📧 Email</span>
     <a href="mailto:${n.email}" class="link">${n.email}</a>

  <span class="yellow">💼 LinkedIn</span>
     <a href="${n.linkedin}" target="_blank" class="link">linkedin.com/in/filip-bumbu</a>

  <span class="yellow">🐙 GitHub</span>
     <a href="${n.github}" target="_blank" class="link">github.com/WickTheThird</a>

<span class="dim">  I typically respond within 24 hours!</span>
`,social:()=>`
<span class="cyan">Social Links</span>

  <span class="white">GitHub</span>     <a href="${n.github}" target="_blank" class="link">github.com/WickTheThird</a>
  <span class="white">LinkedIn</span>   <a href="${n.linkedin}" target="_blank" class="link">linkedin.com/in/filip-bumbu</a>

<span class="dim">  Click any link to open!</span>
`,hire:()=>`
<span class="cyan">┌─────────────────────────────────────────────────────────┐</span>
<span class="cyan">│</span>  <span class="green">🚀 Hire Me</span>                                            <span class="cyan">│</span>
<span class="cyan">└─────────────────────────────────────────────────────────┘</span>

  <span class="green">Status:</span> ${n.status}

  <span class="yellow">What I Can Do For You:</span>
  
  • Full-stack web development
  • Custom web applications
  • API design & development
  • Database architecture
  • Code review & consulting
  • Bug fixes & maintenance

  <span class="yellow">Let's Work Together:</span>
  
  📧 <a href="mailto:${n.email}" class="link">${n.email}</a>
  💼 <a href="${n.linkedin}" target="_blank" class="link">Connect on LinkedIn</a>

<span class="dim">  Serious inquiries only. Let's build something great!</span>
`,clear:()=>{const a=y.querySelectorAll(".output-line"),s=h.length;for(let e=a.length-1;e>=s;e--)a[e].remove();return null},empty:()=>(y.innerHTML="",null),github:()=>(window.open(n.github,"_blank"),'<span class="green">Opening GitHub profile...</span>'),linkedin:()=>(window.open(n.linkedin,"_blank"),'<span class="green">Opening LinkedIn profile...</span>'),echo:a=>a.join(" "),date:()=>new Date().toLocaleString(),pwd:()=>"/home/wick",neofetch:()=>`
<span class="cyan">${n.alias}</span>@<span class="cyan">portfolio</span>
──────────────────────
<span class="yellow">OS:</span> WickOS v3.0
<span class="yellow">Host:</span> GitHub Pages
<span class="yellow">Shell:</span> wick-terminal
<span class="yellow">Theme:</span> Neon Graffiti
<span class="yellow">Status:</span> <span class="green">${n.status}</span>
`},h=["",'<span class="ascii-logo">'+b+"</span>","",'<span class="dim">────────────────────────────────────────────────────────────</span>',"",`  <span class="green">WICK TERMINAL</span> <span class="dim">v3.0.0</span>  <span class="yellow">│</span>  <span class="white">${n.name}</span>  <span class="yellow">│</span>  <span class="dim">${n.title}</span>`,"",`  <span class="green">${n.status}</span>`,"",'<span class="dim">────────────────────────────────────────────────────────────</span>',"",'  <span class="yellow">⚡</span> Type <span class="green">help</span> to see available commands','  <span class="yellow">⚡</span> Type <span class="green">about</span> to learn more about me','  <span class="yellow">⚡</span> Type <span class="green">proj</span> to see my work',""];document.querySelector("#app").innerHTML=`
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
`;const y=document.getElementById("output"),c=document.getElementById("commandInput"),f=document.getElementById("terminal");function o(a){const s=document.createElement("div");s.className="output-line",s.innerHTML=a,y.appendChild(s),f.scrollTop=f.scrollHeight}let g=0;function w(){g<h.length&&(o(h[g]),g++,setTimeout(w,25))}w();const u=[];let p=-1;c.addEventListener("keydown",async a=>{if(a.key==="Enter"){const s=c.value.trim();if(s){u.unshift(s),p=-1,o(`<span class="prompt">wick@portfolio:~$</span> ${s}`);const[e,...i]=s.toLowerCase().split(" ");if(d[e]){const t=await d[e](i);t&&o(t)}else o(`<span class="red">Command not found: ${e}</span>
<span class="dim">Type 'help' for available commands</span>`)}c.value=""}else if(a.key==="ArrowUp")a.preventDefault(),p<u.length-1&&(p++,c.value=u[p]);else if(a.key==="ArrowDown")a.preventDefault(),p>0?(p--,c.value=u[p]):(p=-1,c.value="");else if(a.key==="Tab"){a.preventDefault();const s=c.value.toLowerCase(),e=Object.keys(d).find(i=>i.startsWith(s));e&&(c.value=e)}});f.addEventListener("click",()=>c.focus());document.addEventListener("keydown",a=>{!a.ctrlKey&&!a.metaKey&&!a.altKey&&c.focus()});
