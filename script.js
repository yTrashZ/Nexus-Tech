/* ==========================================================================
   Tech Nexus — script.js
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
    var textEl = submitBtn.querySelector('.btn__text');
    if (textEl) {
      textEl.textContent = isSubmitting ? 'Enviando...' : 'Enviar solicitação';
    }
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

  /* ------------------------------------------------------------------
     7. Pré-seleção de plano ao clicar em "Escolher [Plano]"
     ------------------------------------------------------------------ */
  document.querySelectorAll('[data-plan-select]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var planoSelect = document.getElementById('plano');
      if (planoSelect) {
        planoSelect.value = btn.getAttribute('data-plan-select');
      }
    });
  });
/* ------------------------------------------------------------------
     9. Aviso de cookies (LGPD)
     ------------------------------------------------------------------ */
  var cookieBanner = document.getElementById('cookieBanner');
  var cookieAccept = document.getElementById('cookieAccept');

  if (cookieBanner && !localStorage.getItem('cookiesAceitos')) {
    cookieBanner.classList.add('is-visible');
  }

  if (cookieAccept) {
    cookieAccept.addEventListener('click', function () {
      localStorage.setItem('cookiesAceitos', 'sim');
      cookieBanner.classList.remove('is-visible');
    });
  }
  /* ------------------------------------------------------------------
     8. Formulário "Deixe seu depoimento"
     Mesmo padrão do formulário principal, com endpoint compartilhado.
     ------------------------------------------------------------------ */
  var testimonialForm = document.getElementById('testimonialForm');
  var testimonialSuccess = document.getElementById('testimonialSuccess');
  var testimonialError = document.getElementById('testimonialError');
  var newTestimonialBtn = document.getElementById('newTestimonialBtn');
  var testimonialSubmitBtn = testimonialForm ? testimonialForm.querySelector('button[type="submit"]') : null;

  function hideTestimonialError() {
    if (testimonialError) testimonialError.classList.remove('is-visible');
  }

  function showTestimonialError() {
    if (testimonialError) {
      testimonialError.classList.add('is-visible');
      testimonialError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function setTestimonialSubmitting(isSubmitting) {
    if (!testimonialSubmitBtn) return;
    testimonialSubmitBtn.disabled = isSubmitting;
    testimonialSubmitBtn.classList.toggle('is-loading', isSubmitting);
    testimonialSubmitBtn.textContent = isSubmitting ? 'Enviando...' : 'Enviar depoimento';
  }

  if (testimonialForm) {
    testimonialForm.querySelectorAll('input, textarea').forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        var wrapper = field.closest('.field');
        if (wrapper && wrapper.classList.contains('has-error')) {
          validateField(field);
        }
      });
    });

    testimonialForm.addEventListener('submit', function (event) {
      event.preventDefault();
      hideTestimonialError();

      var requiredFields = testimonialForm.querySelectorAll('[required]');
      var allValid = true;

      requiredFields.forEach(function (field) {
        if (!validateField(field)) {
          allValid = false;
        }
      });

      if (!allValid) {
        var firstError = testimonialForm.querySelector('.field.has-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      var testimonialData = new FormData(testimonialForm);
      setTestimonialSubmitting(true);

      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: testimonialData,
        headers: {
          'Accept': 'application/json'
        }
      })
        .then(function (response) {
          if (response.ok) {
            testimonialForm.style.display = 'none';
            testimonialSuccess.classList.add('is-visible');
            testimonialSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            return response.json().then(function () {
              showTestimonialError();
            });
          }
        })
        .catch(function () {
          showTestimonialError();
        })
        .finally(function () {
          setTestimonialSubmitting(false);
        });
    });
  }

  if (newTestimonialBtn) {
    newTestimonialBtn.addEventListener('click', function () {
      testimonialForm.reset();
      testimonialForm.querySelectorAll('.field.has-error').forEach(function (wrapper) {
        wrapper.classList.remove('has-error');
      });

      hideTestimonialError();
      testimonialSuccess.classList.remove('is-visible');
      testimonialForm.style.display = '';
      testimonialForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* ------------------------------------------------------------------
     10. FAQ (accordion)
     ------------------------------------------------------------------ */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var question = item.querySelector('.faq-item__question');
    var answer = item.querySelector('.faq-item__answer');

    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      document.querySelectorAll('.faq-item.is-open').forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove('is-open');
          openItem.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
          openItem.querySelector('.faq-item__answer').style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('is-open');
        question.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('is-open');
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ------------------------------------------------------------------
     11. Modal de prévia dos modelos
     ------------------------------------------------------------------ */
  var MODELOS_INFO = {
    restaurante: {
      titulo: 'Restaurante',
      tag: 'Estilo acolhedor',
      desc: 'Um site pensado para quem quer mostrar o cardápio, criar vontade de visitar e facilitar pedidos ou reservas.',
      itens: ['Cardápio com fotos em destaque', 'Botão direto de reserva ou pedido pelo WhatsApp', 'Seção "sobre" com a história do restaurante', 'Localização e horário de funcionamento']
    },
    barbearia: {
      titulo: 'Barbearia',
      tag: 'Estilo urbano',
      desc: 'Visual moderno para valorizar o trabalho, mostrar os cortes e facilitar o agendamento.',
      itens: ['Galeria de cortes e trabalhos realizados', 'Agendamento em destaque via WhatsApp', 'Lista de serviços e preços', 'Localização e horário de funcionamento']
    },
    loja: {
      titulo: 'Loja',
      tag: 'Estilo vitrine',
      desc: 'Uma vitrine digital organizada por categoria, com foco em levar o visitante a comprar.',
      itens: ['Produtos organizados por categoria', 'Chamadas para venda em destaque', 'Botão de contato/compra pelo WhatsApp', 'Visual adaptado para celular']
    },
    portfolio: {
      titulo: 'Portfólio',
      tag: 'Estilo autoral',
      desc: 'Apresentação profissional de trabalhos e serviços, com foco em transmitir credibilidade.',
      itens: ['Galeria de trabalhos realizados', 'Seção sobre você ou sua equipe', 'Lista de serviços prestados', 'Formas de contato em destaque']
    },
    profissional: {
      titulo: 'Profissional / autônomo',
      tag: 'Estilo direto',
      desc: 'Um site simples e direto para quem presta serviços e precisa de presença online confiável.',
      itens: ['Apresentação pessoal e área de atuação', 'Lista de serviços prestados', 'Formas de contato e agenda', 'Visual limpo e profissional']
    },
    empresa: {
      titulo: 'Empresa',
      tag: 'Estilo corporativo',
      desc: 'Presença institucional para empresas que precisam transmitir confiança e organização.',
      itens: ['Apresentação institucional da empresa', 'Áreas de atuação e diferenciais', 'Canais de contato corporativo', 'Visual sóbrio e profissional']
    }
  };

  var modelModal = document.getElementById('modelModal');
  var modelModalOverlay = document.getElementById('modelModalOverlay');
  var modelModalClose = document.getElementById('modelModalClose');
  var modelModalTitle = document.getElementById('modelModalTitle');
  var modelModalTag = document.getElementById('modelModalTag');
  var modelModalDesc = document.getElementById('modelModalDesc');
  var modelModalList = document.getElementById('modelModalList');
  var modelModalPreview = document.getElementById('modelModalPreview');

  function openModelModal(key) {
    var info = MODELOS_INFO[key];
    if (!info || !modelModal) return;

    modelModalTitle.textContent = info.titulo;
    modelModalTag.textContent = info.tag;
    modelModalDesc.textContent = info.desc;

    modelModalList.innerHTML = '';
    info.itens.forEach(function (item) {
      var li = document.createElement('li');
      li.textContent = item;
      modelModalList.appendChild(li);
    });

    modelModalPreview.className = 'model-modal__preview model-card__preview model-card--' + key;

    modelModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModelModal() {
    if (!modelModal) return;
    modelModal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.model-card__cta').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openModelModal(btn.getAttribute('data-model'));
    });
  });

  if (modelModalClose) modelModalClose.addEventListener('click', closeModelModal);
  if (modelModalOverlay) modelModalOverlay.addEventListener('click', closeModelModal);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeModelModal();
  });

});
