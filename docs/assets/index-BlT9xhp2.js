(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))t(s);new MutationObserver(s=>{for(const e of s)if(e.type==="childList")for(const p of e.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&t(p)}).observe(document,{childList:!0,subtree:!0});function i(s){const e={};return s.integrity&&(e.integrity=s.integrity),s.referrerPolicy&&(e.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?e.credentials="include":s.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function t(s){if(s.ep)return;s.ep=!0;const e=i(s);fetch(s.href,e)}})();const u=`<span class="logo-main">██╗    ██╗ ██╗  ██████╗ ██╗  ██╗
██║    ██║ ██║ ██╔════╝ ██║ ██╔╝
██║ █╗ ██║ ██║ ██║      █████╔╝ 
██║███╗██║ ██║ ██║      ██╔═██╗ 
╚███╔███╔╝ ██║ ╚██████╗ ██║  ██╗
 ╚══╝╚══╝  ╚═╝  ╚═════╝ ╚═╝  ╚═╝</span>
<span class="drip">  ║│        │    ║║         │ ║</span>
<span class="drip">  ║│        │    ║║         │ ║</span>
<span class="drip">  │         │     ║           │</span>
<span class="drip">  │         │     ║           │</span>
<span class="drip">            ╵     ╵            </span>`,d=["",'<span class="cyan ascii-logo">'+u+"</span>","",'<span class="dim">────────────────────────────────────────────────────────────</span>',"",'  <span class="green">WICK TERMINAL</span> <span class="dim">v3.0.0</span> <span class="yellow">64 bit</span> <span class="dim">| Educational Mode</span>',"",'  <span class="dim">Port:</span> <span class="white">6379</span>','  <span class="dim">PID:</span> <span class="white">42069</span>','  <span class="dim">Mode:</span> <span class="green">standalone</span>',"",'  <span class="dim">Documentation:</span> <span class="cyan">https://github.com/WickTheThird</span>',"",'<span class="dim">────────────────────────────────────────────────────────────</span>',"",'  <span class="yellow">⚡</span> Type <span class="green">help</span> to see available commands','  <span class="yellow">⚡</span> Type <span class="green">about</span> to learn more','  <span class="yellow">⚡</span> Type <span class="green">clear</span> to reset the terminal',""];document.querySelector("#app").innerHTML=`
  <div class="terminal-container">
    <div class="scanlines"></div>
    
    <div class="terminal-window">
      <div class="terminal-header">
        <div class="terminal-buttons">
          <span class="btn-close"></span>
          <span class="btn-minimize"></span>
          <span class="btn-maximize"></span>
        </div>
        <div class="terminal-title">wick@terminal ~ </div>
        <div class="terminal-status">
          <span class="status-dot"></span>
          <span>connected</span>
        </div>
      </div>
      
      <div class="terminal-body" id="terminal">
        <div class="output" id="output"></div>
        
        <div class="input-line">
          <span class="prompt">wick&gt;</span>
          <input type="text" class="command-input" id="commandInput" autofocus spellcheck="false" />
        </div>
      </div>
    </div>
  </div>
`;const r=document.getElementById("output"),c=document.getElementById("commandInput"),l=document.getElementById("terminal");let o=0;function m(){if(o<d.length){const n=document.createElement("div");n.className="output-line",n.innerHTML=d[o],r.appendChild(n),o++,l.scrollTop=l.scrollHeight,setTimeout(m,30)}}m();c.addEventListener("keydown",n=>{if(n.key==="Enter"){const a=c.value.trim();if(a){const i=document.createElement("div");i.className="output-line",i.innerHTML=`<span class="prompt">wick&gt;</span> ${a}`,r.appendChild(i);const t=document.createElement("div");t.className="output-line dim",t.textContent="(commands coming soon...)",r.appendChild(t),l.scrollTop=l.scrollHeight}c.value=""}});l.addEventListener("click",()=>c.focus());
