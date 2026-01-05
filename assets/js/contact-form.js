document.addEventListener('DOMContentLoaded', function(){
  const form = document.querySelector('.contact-form');
  if(!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const name = form.name?.value||'';
    const email = form.email?.value||'';
    const message = form.message?.value||'';
    if(!email||!message){ alert('Please provide email and message'); return; }
    // Simulate submit
    alert('Thanks, ' + (name||'there') + '! Your message has been received.');
    form.reset();
  });
});
