/* Panificadora Ferreira's — comportamento da pagina.
   Sem dependencias externas: menos bytes e nenhuma requisicao extra. */
(function () {
  'use strict';

  var semMovimento = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Animacoes de entrada --------------------------------------------
     Um unico IntersectionObserver para toda a pagina. Cada elemento e
     desobservado assim que aparece, entao o custo tende a zero apos a
     primeira rolagem.                                                    */
  function iniciarRevelacoes() {
    var alvos = document.querySelectorAll('[data-reveal]');
    if (!alvos.length) return;

    if (semMovimento || !('IntersectionObserver' in window)) {
      for (var i = 0; i < alvos.length; i++) alvos[i].classList.add('is-visivel');
      return;
    }

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add('is-visivel');
        observador.unobserve(entrada.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    alvos.forEach(function (alvo) { observador.observe(alvo); });
  }

  /* Escalona os filhos de [data-reveal-grupo] para criar um efeito cascata. */
  function prepararCascatas() {
    var grupos = document.querySelectorAll('[data-reveal-grupo]');
    grupos.forEach(function (grupo) {
      var passo = parseInt(grupo.getAttribute('data-reveal-grupo'), 10) || 90;
      var filhos = grupo.querySelectorAll('[data-reveal]');
      filhos.forEach(function (filho, indice) {
        filho.style.setProperty('--reveal-atraso', (indice * passo) + 'ms');
      });
    });
  }

  function iniciar() {
    prepararCascatas();
    iniciarRevelacoes();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  } else {
    iniciar();
  }
})();
