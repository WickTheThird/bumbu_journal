(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))t(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&t(c)}).observe(document,{childList:!0,subtree:!0});function i(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function t(s){if(s.ep)return;s.ep=!0;const n=i(s);fetch(s.href,n)}})();const u=`<span class="logo-main">██╗    ██╗ ██╗  ██████╗ ██╗  ██╗
██║    ██║ ██║ ██╔════╝ ██║ ██╔╝
██║ █╗ ██║ ██║ ██║      █████╔╝ 
██║███╗██║ ██║ ██║      ██╔═██╗ 
╚███╔███╔╝ ██║ ╚██████╗ ██║  ██╗
 ╚══╝╚══╝  ╚═╝  ╚═════╝ ╚═╝  ╚═╝</span>
<span class="drip-line"><span class="drip d1">│</span>    <span class="drip d2">│</span>      <span class="drip d3">║</span>         <span class="drip d4">│</span>    <span class="drip d5">│</span></span>
<span class="drip-line"><span class="drip d1">│</span>         <span class="drip d3">║</span>              <span class="drip d5">│</span></span>
<span class="drip-line"><span class="drip d1">▼</span>         <span class="drip d3">▼</span>              <span class="drip d5">▼</span></span>`,r=["",'<span class="cyan ascii-logo">'+u+"</span>","",'<span class="dim">────────────────────────────────────────────────────────────</span>',"",'  <span class="green">WICK TERMINAL</span> <span class="dim">v3.0.0</span> <span class="yellow">64 bit</span> <span class="dim">| Educational Mode</span>',"",'  <span class="dim">Port:</span> <span class="white">6379</span>','  <span class="dim">PID:</span> <span class="white">42069</span>','  <span class="dim">Mode:</span> <span class="green">standalone</span>',"",'  <span class="dim">Documentation:</span> <span class="cyan">https://github.com/WickTheThird</span>',"",'<span class="dim">────────────────────────────────────────────────────────────</span>',"",'  <span class="yellow">⚡</span> Type <span class="green">help</span> to see available commands','  <span class="yellow">⚡</span> Type <span class="green">about</span> to learn more','  <span class="yellow">⚡</span> Type <span class="green">clear</span> to reset the terminal',""];document.querySelector("#app").innerHTML=`
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
`;const d=document.getElementById("output"),l=document.getElementById("commandInput"),p=document.getElementById("terminal");let o=0;function m(){if(o<r.length){const e=document.createElement("div");e.className="output-line",e.innerHTML=r[o],d.appendChild(e),o++,p.scrollTop=p.scrollHeight,setTimeout(m,30)}}m();l.addEventListener("keydown",e=>{if(e.key==="Enter"){const a=l.value.trim();if(a){const i=document.createElement("div");i.className="output-line",i.innerHTML=`<span class="prompt">wick&gt;</span> ${a}`,d.appendChild(i);const t=document.createElement("div");t.className="output-line dim",t.textContent="(commands coming soon...)",d.appendChild(t),p.scrollTop=p.scrollHeight}l.value=""}});p.addEventListener("click",()=>l.focus());
