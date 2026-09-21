/* =====================================================================
   Panificadora Ferreira's — comportamento da pagina.
   Sem dependencias externas: menos bytes e nenhuma requisicao extra.
   ===================================================================== */
(function () {
  'use strict';

  var TELEFONE = '5541998543009';
  var semMovimento = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function enviarEvento(nome, dados) {
    window.dataLayer = window.dataLayer || [];
    var carga = { event: nome };
    for (var k in dados) if (Object.prototype.hasOwnProperty.call(dados, k)) carga[k] = dados[k];
    window.dataLayer.push(carga);
  }

  /* ------------------------------------------------------------------
     Animacoes de entrada
     Um unico IntersectionObserver para a pagina toda. Cada elemento e
     desobservado assim que aparece, entao o custo tende a zero apos a
     primeira rolagem.
     ------------------------------------------------------------------ */
  function prepararCascatas() {
    var grupos = document.querySelectorAll('[data-reveal-grupo]');
    Array.prototype.forEach.call(grupos, function (grupo) {
      var passo = parseInt(grupo.getAttribute('data-reveal-grupo'), 10) || 90;
      var filhos = grupo.querySelectorAll('[data-reveal]');
      Array.prototype.forEach.call(filhos, function (filho, i) {
        filho.style.setProperty('--reveal-atraso', (i * passo) + 'ms');
      });
    });
  }

  function revelar(elemento) {
    elemento.classList.add('is-visivel');
    var contadores = elemento.querySelectorAll('[data-contador]');
    Array.prototype.forEach.call(contadores, animarContador);
    if (elemento.hasAttribute('data-contador')) animarContador(elemento);
  }

  function iniciarRevelacoes() {
    var alvos = document.querySelectorAll('[data-reveal]');
    if (!alvos.length) return;

    if (semMovimento || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(alvos, revelar);
      return;
    }

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        revelar(entrada.target);
        observador.unobserve(entrada.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    Array.prototype.forEach.call(alvos, function (alvo) { observador.observe(alvo); });
  }

  /* Numeros do hero sobem de 0 ate o valor final quando entram na tela. */
  function animarContador(elemento) {
    if (elemento.dataset.contado) return;
    elemento.dataset.contado = '1';

    var alvo = parseInt(elemento.getAttribute('data-contador'), 10);
    if (isNaN(alvo)) return;

    var prefixo = elemento.getAttribute('data-prefixo') || '';
    var sufixo = elemento.getAttribute('data-sufixo') || '';
    if (semMovimento) { elemento.textContent = prefixo + alvo + sufixo; return; }

    var duracao = 1100;
    var inicio = null;

    function passo(agora) {
      if (inicio === null) inicio = agora;
      var t = Math.min((agora - inicio) / duracao, 1);
      var suave = 1 - Math.pow(1 - t, 3);
      elemento.textContent = prefixo + Math.round(alvo * suave) + sufixo;
      if (t < 1) requestAnimationFrame(passo);
    }
    elemento.textContent = prefixo + '0' + sufixo;
    requestAnimationFrame(passo);
  }

  /* ------------------------------------------------------------------
     Carrossel do hero (crossfade)
     ------------------------------------------------------------------ */
  function iniciarCarrossel(raiz) {
    var fotos = raiz.querySelectorAll('.carrossel__foto');
    var pontos = raiz.querySelector('.carrossel__pontos');
    if (fotos.length < 2) return;

    var atual = 0;
    var intervalo = parseInt(raiz.getAttribute('data-intervalo'), 10) || 4500;
    var timer = null;

    var botoes = [];
    Array.prototype.forEach.call(fotos, function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'carrossel__ponto';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Foto ' + (i + 1) + ' de ' + fotos.length);
      b.addEventListener('click', function () { ir(i); reiniciar(); });
      pontos.appendChild(b);
      botoes.push(b);
    });

    function ir(i) {
      atual = (i + fotos.length) % fotos.length;
      Array.prototype.forEach.call(fotos, function (foto, j) {
        foto.classList.toggle('is-ativa', j === atual);
      });
      botoes.forEach(function (b, j) {
        b.setAttribute('aria-selected', j === atual ? 'true' : 'false');
      });
    }

    function avancar() { ir(atual + 1); }
    function parar() { if (timer) { clearInterval(timer); timer = null; } }
    function comecar() {
      if (semMovimento || timer) return;
      timer = setInterval(avancar, intervalo);
    }
    function reiniciar() { parar(); comecar(); }

    ir(0);
    comecar();

    raiz.addEventListener('mouseenter', parar);
    raiz.addEventListener('mouseleave', comecar);
    raiz.addEventListener('focusin', parar);
    raiz.addEventListener('focusout', comecar);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) parar(); else comecar();
    });
  }

  /* ------------------------------------------------------------------
     Montador de pedido
     Monta a mensagem do WhatsApp a partir do kit, do numero de pessoas
     e da data. Nada e enviado daqui: o botao so abre a conversa pronta.
     ------------------------------------------------------------------ */
  function iniciarMontador(form) {
    var previa = form.querySelector('[data-previa]');
    var enviar = form.querySelector('[data-enviar]');
    var campoData = form.querySelector('[data-campo-data]');
    var entradaData = form.querySelector('input[name="data"]');
    var entradaPessoas = form.querySelector('input[name="pessoas"]');

    var hoje = new Date();
    var iso = hoje.getFullYear() + '-' +
      String(hoje.getMonth() + 1).padStart(2, '0') + '-' +
      String(hoje.getDate()).padStart(2, '0');
    entradaData.min = iso;
    entradaData.value = iso;

    function quandoTexto() {
      var escolha = form.querySelector('input[name="quando"]:checked').value;
      if (escolha === 'hoje') return 'hoje';
      if (escolha === 'amanha') return 'amanhã';
      if (!entradaData.value) return 'uma data a combinar';
      var partes = entradaData.value.split('-');
      return 'o dia ' + partes[2] + '/' + partes[1] + '/' + partes[0];
    }

    function pessoas() {
      var n = parseInt(entradaPessoas.value, 10);
      if (isNaN(n) || n < 1) n = 1;
      if (n > 999) n = 999;
      return n;
    }

    function montar() {
      var kit = form.querySelector('input[name="kit"]:checked').value;
      var n = pessoas();
      return 'Olá, tudo bem? Vim pela página da panificadora e gostaria de um orçamento do ' +
        kit + ' para ' + n + (n === 1 ? ' pessoa' : ' pessoas') + ', para ' + quandoTexto() + '.';
    }

    function atualizar() {
      var escolha = form.querySelector('input[name="quando"]:checked').value;
      campoData.hidden = escolha !== 'data';

      var texto = montar();
      previa.textContent = texto;
      enviar.href = 'https://wa.me/' + TELEFONE + '?text=' + encodeURIComponent(texto);
    }

    form.addEventListener('change', atualizar);
    form.addEventListener('input', atualizar);
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    Array.prototype.forEach.call(form.querySelectorAll('[data-passo]'), function (botao) {
      botao.addEventListener('click', function () {
        entradaPessoas.value = Math.max(1, Math.min(999, pessoas() + parseInt(botao.getAttribute('data-passo'), 10)));
        atualizar();
      });
    });

    Array.prototype.forEach.call(form.querySelectorAll('[data-pessoas]'), function (botao) {
      botao.addEventListener('click', function () {
        entradaPessoas.value = botao.getAttribute('data-pessoas');
        atualizar();
      });
    });

    enviar.addEventListener('click', function () {
      enviarEvento('montador_enviado', {
        kit: form.querySelector('input[name="kit"]:checked').value,
        pessoas: pessoas(),
        quando: form.querySelector('input[name="quando"]:checked').value
      });
    });

    atualizar();
  }

  /* Todo clique em CTA vira um evento no dataLayer, para o GTM ler. */
  function rastrearCtas() {
    document.addEventListener('click', function (e) {
      var alvo = e.target.closest ? e.target.closest('[data-cta]') : null;
      if (!alvo || alvo.hasAttribute('data-enviar')) return;
      enviarEvento('clique_whatsapp', { origem: alvo.getAttribute('data-cta') });
    });
  }

  function iniciar() {
    prepararCascatas();
    iniciarRevelacoes();
    rastrearCtas();

    var carrossel = document.querySelector('[data-carrossel]');
    if (carrossel) iniciarCarrossel(carrossel);

    var montador = document.querySelector('[data-montador]');
    if (montador) iniciarMontador(montador);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  } else {
    iniciar();
  }
})();
