/* ==========================================================================
   Wallora Tech — script.js
   Nenhuma automação real de criação de sites. Apenas comportamento de interface.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ------------------------------------------------------------------
     1. Ano automático no rodapé
     ------------------------------------------------------------------ */
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------
     2. Header: sombra/fundo sólido ao rolar a página
     ------------------------------------------------------------------ */
  var header = document.getElementById('header');
  function handleHeaderScroll() {
    if (window.scrollY > 12) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  handleHeaderScroll();
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  /* ------------------------------------------------------------------
     3. Menu mobile (abrir/fechar)
     ------------------------------------------------------------------ */
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');

  function closeNav() {
    nav.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  /* ------------------------------------------------------------------
     4. Animação de revelação ao rolar (fade + subida suave)
     ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------------
     5. Badge da demonstração do hero
     ------------------------------------------------------------------ */
  var aiBadgeText = document.getElementById('aiBadgeText');
  var exampleBusinesses = [
    'Padaria Bom Pão',
    'Barbearia Vintage',
    'Loja Estilo Urbano',
    'Studio Fotografia Luz',
    'Salão Bela Época',
    'Pizzaria da Esquina'
  ];
  var badgeIndex = 0;

  if (aiBadgeText) {
    setInterval(function () {
      badgeIndex = (badgeIndex + 1) % exampleBusinesses.length;
      aiBadgeText.style.opacity = '0';

      setTimeout(function () {
        aiBadgeText.textContent = 'gerando site para "' + exampleBusinesses[badgeIndex] + '"';
        aiBadgeText.style.opacity = '1';
      }, 250);
    }, 3200);

    aiBadgeText.style.transition = 'opacity 0.25s ease';
  }

  /* ------------------------------------------------------------------
     6. Formulário "Solicite seu site"
     Validação no navegador + envio real para o Formspree via fetch().
     ------------------------------------------------------------------ */
  var form = document.getElementById('requestForm');
  var successMessage = document.getElementById('successMessage');
  var newRequestBtn = document.getElementById('newRequestBtn');
  var formError = document.getElementById('formError');
  var submitBtn = form ? form.querySelector('button[type="submit"], input[type="submit"]') : null;

  var FORMSPREE_ENDPOINT = 'https://formspree.io/f/xljrngzr';

  function validateField(field) {
    var wrapper = field.closest('.field');
    if (!wrapper) return true;

    var isValid = field.checkValidity();
    wrapper.classList.toggle('has-error', !isValid);
    return isValid;
  }

  function hideFormError() {
    if (formError) {
      formError.classList.remove('is-visible');
    }
  }

  function showFormError() {
    if (formError) {
      formError.classList.add('is-visible');
      formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.classList.toggle('is-loading', isSubmitting);
  }

  if (form) {
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        var wrapper = field.closest('.field');
        if (wrapper && wrapper.classList.contains('has-error')) {
          validateField(field);
        }
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      hideFormError();

      var requiredFields = form.querySelectorAll('[required]');
      var allValid = true;

      requiredFields.forEach(function (field) {
        if (!validateField(field)) {
          allValid = false;
        }
      });

      if (!allValid) {
        var firstError = form.querySelector('.field.has-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      var formData = new FormData(form);
      setSubmitting(true);

      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
        .then(function (response) {
          if (response.ok) {
            form.style.display = 'none';
            successMessage.classList.add('is-visible');
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            return response.json().then(function () {
              showFormError();
            });
          }
        })
        .catch(function () {
          showFormError();
        })
        .finally(function () {
          setSubmitting(false);
        });
    });
  }

  if (newRequestBtn) {
    newRequestBtn.addEventListener('click', function () {
      form.reset();
      form.querySelectorAll('.field.has-error').forEach(function (wrapper) {
        wrapper.classList.remove('has-error');
      });

      hideFormError();
      successMessage.classList.remove('is-visible');
      form.style.display = '';
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

}); 
