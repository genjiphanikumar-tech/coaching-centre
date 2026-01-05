// Admin interactivity: modal, charts, simple actions
(function(){
  // Modal injection
  function createModal(){
    if(document.getElementById('admin-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'admin-modal';
    modal.innerHTML = `
      <div class="modal-backdrop" tabindex="-1">
        <div class="modal-panel">
          <button class="modal-close" aria-label="Close">×</button>
          <h3>New Course</h3>
          <div class="modal-body">
            <label class="label">Course Title</label>
            <input class="input" id="new-course-title">
            <label class="label" style="margin-top:8px">Category</label>
            <input class="input" id="new-course-category">
            <div style="margin-top:12px"><button class="btn" id="save-course">Save</button> <button class="btn ghost" id="cancel-course">Cancel</button></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.modal-close').addEventListener('click',closeModal);
    modal.querySelector('#cancel-course').addEventListener('click',closeModal);
    modal.querySelector('#save-course').addEventListener('click',()=>{
      const t=document.getElementById('new-course-title').value||'Untitled';
      alert('Course saved: '+t);
      closeModal();
    });
  }
  function openModal(){ createModal(); document.getElementById('admin-modal').classList.add('open'); document.getElementById('admin-modal').querySelector('input')?.focus(); }
  function closeModal(){ const m=document.getElementById('admin-modal'); if(m) m.classList.remove('open'); }

  // Archive confirmation
  function bindArchive(){
    document.querySelectorAll('.btn.ghost').forEach(b=>{
      b.addEventListener('click', (e)=>{
        e.preventDefault();
        if(confirm('Are you sure you want to archive this item?')){
          // simple visual feedback
          const tr = b.closest('tr'); if(tr) tr.style.opacity=0.6;
          alert('Item archived');
        }
      });
    });
  }

  // charts: using Chart.js if available
  function renderCharts(){
    const placeholders = document.querySelectorAll('.placeholder');
    if(!placeholders.length) return;
    // sparkline in first placeholder
    try{
      const spark = placeholders[0];
      const canvas = document.createElement('canvas'); canvas.style.width='100%'; canvas.style.height='50px';
      spark.innerHTML=''; spark.appendChild(canvas);
      const labels = Array.from({length:12},(_,i)=>`M${i+1}`);
      const data = Array.from({length:12},()=>Math.round(50+Math.random()*100));
      if(window.Chart){
        new Chart(canvas.getContext('2d'),{type:'line',data:{labels, datasets:[{label:'Revenue',data, borderColor:'#2b7ed6', backgroundColor:'rgba(43,126,214,0.12)', tension:0.35, fill:true}]}, options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, elements:{point:{radius:0}}}});
      } else {
        // fallback: simple bar boxes
        canvas.getContext('2d').fillStyle = '#e6f2ff'; canvas.getContext('2d').fillRect(0,0,canvas.width,canvas.height);
      }
    }catch(e){console.warn('sparkline failed',e)}

    // uptime / chart in second placeholder
    if(placeholders[1]){
      const p = placeholders[1]; const c = document.createElement('canvas'); c.style.width='100%'; c.style.height='160px'; p.innerHTML=''; p.appendChild(c);
      const labels=['Errors','Warnings','OK']; const data=[Math.round(Math.random()*20), Math.round(Math.random()*50), Math.round(100-Math.random()*30)];
      if(window.Chart){
        new Chart(c.getContext('2d'),{type:'doughnut',data:{labels, datasets:[{data, backgroundColor:['#ff7a7a','#ffcd57','#7bd389']}]}, options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom'}}}});
      }
    }
  }

  // initialize on DOM ready
  function init(){
    document.addEventListener('click', (e)=>{
      if(e.target && e.target.matches('.btn') && e.target.textContent.trim()==='New Course'){
        e.preventDefault(); openModal();
      }
    });
    bindArchive();
    // try rendering charts after a short delay to ensure Chart.js (CDN) has loaded
    setTimeout(renderCharts, 300);
  }

  // expose for manual calls
  window.adminInit = init;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
