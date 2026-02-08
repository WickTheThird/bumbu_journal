(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))a(e);new MutationObserver(e=>{for(const s of e)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function i(e){const s={};return e.integrity&&(s.integrity=e.integrity),e.referrerPolicy&&(s.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?s.credentials="include":e.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(e){if(e.ep)return;e.ep=!0;const s=i(e);fetch(e.href,s)}})();const u=`
 __        __  ___   ____   _  __
 \\ \\      / / |_ _| / ___| | |/ /
  \\ \\ /\\ / /   | | | |     | ' / 
   \\ V  V /    | | | |___  | . \\ 
    \\_/\\_/    |___| \\____| |_|\\_\\
`,d=["",'<span class="cyan">'+u+"</span>","",'<span class="dim">────────────────────────────────────────────────────────────</span>',"",'  <span class="green">WICK TERMINAL</span> <span class="dim">v3.0.0</span> <span class="yellow">64 bit</span> <span class="dim">| Educational Mode</span>',"",'  <span class="dim">Port:</span> <span class="white">6379</span>','  <span class="dim">PID:</span> <span class="white">42069</span>','  <span class="dim">Mode:</span> <span class="green">standalone</span>',"",'  <span class="dim">Documentation:</span> <span class="cyan">https://github.com/WickTheThird</span>',"",'<span class="dim">────────────────────────────────────────────────────────────</span>',"",'  <span class="yellow">⚡</span> Type <span class="green">help</span> to see available commands','  <span class="yellow">⚡</span> Type <span class="green">about</span> to learn more','  <span class="yellow">⚡</span> Type <span class="green">clear</span> to reset the terminal',""];document.querySelector("#app").innerHTML=`
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
`;const r=document.getElementById("output"),c=document.getElementById("commandInput"),l=document.getElementById("terminal");let p=0;function m(){if(p<d.length){const n=document.createElement("div");n.className="output-line",n.innerHTML=d[p],r.appendChild(n),p++,l.scrollTop=l.scrollHeight,setTimeout(m,30)}}m();c.addEventListener("keydown",n=>{if(n.key==="Enter"){const t=c.value.trim();if(t){const i=document.createElement("div");i.className="output-line",i.innerHTML=`<span class="prompt">wick&gt;</span> ${t}`,r.appendChild(i);const a=document.createElement("div");a.className="output-line dim",a.textContent="(commands coming soon...)",r.appendChild(a),l.scrollTop=l.scrollHeight}c.value=""}});l.addEventListener("click",()=>c.focus());
