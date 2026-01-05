// Small dashboard helpers
(function(){
  window.dashboard = {
    formatCurrency: function(v){ return '₹ ' + v; },
    init: function(){ /* placeholder */ }
  };
  if(document.readyState!=='loading') dashboard.init(); else document.addEventListener('DOMContentLoaded', dashboard.init);
})();
