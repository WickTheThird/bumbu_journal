(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))c(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const t of a.addedNodes)t.tagName==="LINK"&&t.rel==="modulepreload"&&c(t)}).observe(document,{childList:!0,subtree:!0});function n(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function c(s){if(s.ep)return;s.ep=!0;const a=n(s);fetch(s.href,a)}})();const o=`
██╗    ██╗██╗ ██████╗██╗  ██╗    ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗     
██║    ██║██║██╔════╝██║ ██╔╝    ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║     
██║ █╗ ██║██║██║     █████╔╝        ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║     
██║███╗██║██║██║     ██╔═██╗        ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║     
╚███╔███╔╝██║╚██████╗██║  ██╗       ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗
 ╚══╝╚══╝ ╚═╝ ╚═════╝╚═╝  ╚═╝       ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
`,d=`
     )
    (
   .-'-.
   |   |
   |   |
   |   |
   |   |
 __|   |__
/  '---'  \\
'---------'
`;document.querySelector("#app").innerHTML=`
  <div class="terminal-container">
    <!-- Scanline overlay -->
    <div class="scanlines"></div>
    
    <!-- CRT flicker -->
    <div class="crt-flicker"></div>
    
    <!-- Main terminal window -->
    <div class="terminal-window">
      <!-- Header bar -->
      <div class="terminal-header">
        <div class="terminal-buttons">
          <span class="btn-close"></span>
          <span class="btn-minimize"></span>
          <span class="btn-maximize"></span>
        </div>
        <div class="terminal-title">WICK_TERMINAL v3.0 // SECURE CONNECTION</div>
        <div class="terminal-status">
          <span class="status-dot"></span>
          <span>ONLINE</span>
        </div>
      </div>
      
      <!-- Terminal body -->
      <div class="terminal-body">
        <!-- ASCII Logo -->
        <pre class="ascii-logo">${o}</pre>
        
        <!-- System info panel -->
        <div class="system-panel">
          <div class="panel-section">
            <pre class="candle-art">${d}</pre>
          </div>
          <div class="panel-section info-section">
            <div class="info-line"><span class="label">SYSTEM</span><span class="value">WICK_OS v3.0.0</span></div>
            <div class="info-line"><span class="label">STATUS</span><span class="value status-active">OPERATIONAL</span></div>
            <div class="info-line"><span class="label">UPTIME</span><span class="value" id="uptime">00:00:00</span></div>
            <div class="info-line"><span class="label">MEMORY</span><span class="value">2.4 TB / 4.0 TB</span></div>
            <div class="info-line"><span class="label">NETWORK</span><span class="value">ENCRYPTED</span></div>
            <div class="info-line"><span class="label">LOCATION</span><span class="value">CLASSIFIED</span></div>
          </div>
        </div>
        
        <!-- Command output area -->
        <div class="output-area" id="output">
          <div class="output-line"><span class="timestamp">[00:00:00]</span> System initialized...</div>
          <div class="output-line"><span class="timestamp">[00:00:01]</span> Loading modules...</div>
          <div class="output-line"><span class="timestamp">[00:00:02]</span> Establishing secure connection...</div>
          <div class="output-line success"><span class="timestamp">[00:00:03]</span> Connection established. Welcome back.</div>
        </div>
        
        <!-- Command input -->
        <div class="input-area">
          <span class="prompt">wick@terminal:~$</span>
          <input type="text" class="command-input" id="commandInput" placeholder="Enter command..." autofocus />
          <span class="cursor"></span>
        </div>
      </div>
      
      <!-- Footer with stats -->
      <div class="terminal-footer">
        <div class="footer-item">CPU: <span class="highlight">23%</span></div>
        <div class="footer-item">MEM: <span class="highlight">61%</span></div>
        <div class="footer-item">NET: <span class="highlight">↑ 1.2 MB/s</span></div>
        <div class="footer-item">TEMP: <span class="highlight">42°C</span></div>
      </div>
    </div>
  </div>
`;let i=0;setInterval(()=>{i++;const l=String(Math.floor(i/3600)).padStart(2,"0"),e=String(Math.floor(i%3600/60)).padStart(2,"0"),n=String(i%60).padStart(2,"0");document.getElementById("uptime").textContent=`${l}:${e}:${n}`},1e3);
