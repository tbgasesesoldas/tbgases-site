/**
 * TB Gases & Soldas - CMS Data Hydration
 * Carrega e sincroniza os dados do Sveltia CMS (/data/*.json) com o DOM do site.
 */

(function () {
  'use strict';

  const badgeColorMap = {
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    red: 'bg-red-100 text-brand-red border-red-300',
    blue: 'bg-blue-100 text-brand-blue border-blue-300',
    slate: 'bg-slate-200 text-slate-800 border-slate-300',
    amber: 'bg-amber-100 text-amber-900 border-amber-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  // Helper para renderizar card de produto
  function renderProductCard(prod, whatsappNum) {
    const colorClasses = badgeColorMap[prod.badge_cor] || badgeColorMap.blue;
    const cleanImg = prod.imagem ? prod.imagem.replace(/^\/?/, '') : 'assets/produtos/cilindro-oxigenio.png';
    const ctaMsg = encodeURIComponent(`Olá! Gostaria de um orçamento para ${prod.nome}.`);
    const waUrl = `https://wa.me/${whatsappNum}?text=${ctaMsg}`;

    return `
      <div class="group p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white hover:border-brand-blue/50 hover:shadow-xl transition duration-300 flex flex-col justify-between">
        <div>
          <div class="relative w-full h-48 sm:h-52 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-3 mb-4 overflow-hidden group-hover:bg-slate-100/70 transition duration-300">
            <img src="${cleanImg}" alt="${prod.nome}" loading="lazy" decoding="async" width="240" height="240" class="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300">
          </div>
          <div class="mb-3">
            <span class="badge-gas border ${colorClasses}">${prod.badge}</span>
          </div>
          <h3 class="text-xl font-bold text-slate-900 mb-2">${prod.nome}</h3>
          <p class="text-sm text-slate-600 mb-6 leading-relaxed">${prod.descricao}</p>
        </div>
        <a href="${waUrl}" target="_blank" rel="noopener"
           class="w-full py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-brand-whatsapp hover:text-white text-slate-800 text-xs font-bold transition flex items-center justify-center gap-2">
          <i class="ph-fill ph-whatsapp-logo text-base"></i> ${prod.cta_texto || 'Cotar no WhatsApp'}
        </a>
      </div>
    `;
  }

  // Sincroniza informações de contato
  async function syncContato() {
    try {
      const res = await fetch('/data/contato.json?v=' + Date.now());
      if (!res.ok) return;
      const data = await res.json();
      window.tbContato = data;

      // Atualiza links e textos de WhatsApp
      if (data.whatsapp_numero) {
        document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
          const href = el.getAttribute('href');
          el.setAttribute('href', href.replace(/wa\.me\/\d+/, `wa.me/${data.whatsapp_numero}`));
        });
      }

      // Atualiza telefone nos textos
      if (data.whatsapp) {
        document.querySelectorAll('.data-whatsapp-text').forEach(el => el.textContent = data.whatsapp);
      }
      if (data.telefone) {
        document.querySelectorAll('.data-telefone-text').forEach(el => el.textContent = data.telefone);
      }
      if (data.email) {
        document.querySelectorAll('.data-email-text').forEach(el => el.textContent = data.email);
      }
      if (data.horario_semana) {
        document.querySelectorAll('.data-horario-semana').forEach(el => el.textContent = data.horario_semana);
      }
      if (data.horario_sabado) {
        document.querySelectorAll('.data-horario-sabado').forEach(el => el.textContent = data.horario_sabado);
      }
      if (data.endereco_linha1) {
        document.querySelectorAll('.data-endereco-linha1').forEach(el => el.textContent = data.endereco_linha1);
      }
      if (data.endereco_linha2) {
        document.querySelectorAll('.data-endereco-linha2').forEach(el => el.textContent = data.endereco_linha2);
      }
      if (data.instagram_url) {
        document.querySelectorAll('a[href*="instagram.com"]').forEach(el => el.setAttribute('href', data.instagram_url));
      }
    } catch (e) {
      console.warn('CMS: usando dados de contato estáticos de fallback');
    }
  }

  // Sincroniza produtos (Gases, Insumos, Equipamentos)
  async function syncProdutos() {
    const waNum = (window.tbContato && window.tbContato.whatsapp_numero) || '555137152221';

    // Gases
    try {
      const res = await fetch('/data/gases.json?v=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        const container = document.getElementById('gases-grid');
        if (container && data.produtos && data.produtos.length > 0) {
          const cardsHtml = data.produtos.map(p => renderProductCard(p, waNum)).join('');
          const outroGasCard = document.getElementById('card-outro-gas');
          container.innerHTML = cardsHtml + (outroGasCard ? outroGasCard.outerHTML : '');
        }
      }
    } catch (e) {}

    // Insumos
    try {
      const res = await fetch('/data/insumos.json?v=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        const container = document.getElementById('insumos-grid');
        if (container && data.produtos && data.produtos.length > 0) {
          container.innerHTML = data.produtos.map(p => renderProductCard(p, waNum)).join('');
        }
      }
    } catch (e) {}

    // Equipamentos
    try {
      const res = await fetch('/data/equipamentos.json?v=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        const container = document.getElementById('equipamentos-grid');
        if (container && data.produtos && data.produtos.length > 0) {
          container.innerHTML = data.produtos.map(p => renderProductCard(p, waNum)).join('');
        }
      }
    } catch (e) {}
  }

  // Sincroniza cidades atendidas
  async function syncCidades() {
    try {
      const res = await fetch('/data/cidades.json?v=' + Date.now());
      if (!res.ok) return;
      const data = await res.json();
      const container = document.getElementById('cidades-container');
      if (container && data.cidades && data.cidades.length > 0) {
        container.innerHTML = data.cidades.map(cidade => `
          <span class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-bold hover:bg-brand-navy hover:text-white transition shadow-sm">
            <i class="ph-fill ph-map-pin text-brand-red"></i> ${cidade}
          </span>
        `).join('');
      }
    } catch (e) {}
  }

  // Sincroniza FAQ
  async function syncFaq() {
    try {
      const res = await fetch('/data/faq.json?v=' + Date.now());
      if (!res.ok) return;
      const data = await res.json();
      const container = document.getElementById('faq-container');
      if (container && data.perguntas && data.perguntas.length > 0) {
        container.innerHTML = data.perguntas.map(item => `
          <div class="faq-item bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <button class="w-full text-left p-5 font-bold text-slate-900 flex justify-between items-center text-base hover:text-brand-blue transition">
              <span>${item.pergunta}</span>
              <i class="ph ph-caret-down text-slate-400 text-lg transition duration-200"></i>
            </button>
            <div class="faq-answer px-5 pb-5 text-sm text-slate-600 hidden leading-relaxed border-t border-slate-200/60 pt-3">
              ${item.resposta}
            </div>
          </div>
        `).join('');

        // Reanexa os listeners de clique do FAQ
        container.querySelectorAll('.faq-item button').forEach(button => {
          button.addEventListener('click', () => {
            const answer = button.nextElementSibling;
            const icon = button.querySelector('i');
            const isHidden = answer.classList.contains('hidden');

            container.querySelectorAll('.faq-answer').forEach(a => a.classList.add('hidden'));
            container.querySelectorAll('.faq-item button i').forEach(i => i.classList.remove('rotate-180'));

            if (isHidden) {
              answer.classList.remove('hidden');
              icon.classList.add('rotate-180');
            }
          });
        });
      }
    } catch (e) {}
  }

  // Helper para atualizar um banner de destaque
  function applyDestaque(prefix, data) {
    if (!data) return;
    const imgEl = document.getElementById(`destaque-${prefix}-img`);
    const badgeEl = document.getElementById(`destaque-${prefix}-badge`);
    const tituloEl = document.getElementById(`destaque-${prefix}-titulo`);
    const descEl = document.getElementById(`destaque-${prefix}-desc`);

    if (imgEl && data.imagem) {
      imgEl.src = data.imagem.replace(/^\/?/, '');
    }
    if (badgeEl && data.badge) {
      badgeEl.textContent = data.badge;
    }
    if (tituloEl && data.titulo) {
      tituloEl.textContent = data.titulo;
    }
    if (descEl && data.descricao) {
      descEl.textContent = data.descricao;
    }
  }

  // Sincroniza Banners e Imagens de Destaque (Hero, Sobre, Cidades)
  async function syncDestaques() {
    const banners = ['hero', 'sobre', 'cidades'];
    await Promise.all(banners.map(async b => {
      try {
        const res = await fetch(`/data/destaque_${b}.json?v=` + Date.now());
        if (res.ok) {
          const data = await res.json();
          applyDestaque(b, data);
        }
      } catch (e) {}
    }));
  }

  // Inicialização no DOMContentLoaded
  document.addEventListener('DOMContentLoaded', async () => {
    await syncContato();
    await Promise.all([syncProdutos(), syncCidades(), syncFaq(), syncDestaques()]);
  });
})();
