/**
 * TB Gases & Soldas - Tracking & Analytics
 * GA4 Measurement ID: G-H6RCMWETS7
 * Rastreia conversões de WhatsApp, cotações de produtos, diagnóstico técnico e contatos.
 */

(function () {
  'use strict';

  // Helper seguro para disparo no GA4
  function trackEvent(eventName, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
  }

  // Identifica a origem do clique de WhatsApp
  function identifyWhatsAppSource(el) {
    // 1. Botão flutuante
    if (el.closest('.fixed.bottom-6.right-6') || el.getAttribute('aria-label') === 'Falar no WhatsApp') {
      return { location: 'floating_button', name: 'Botão Flutuante WhatsApp', category: 'Suporte Geral' };
    }

    // 2. Header
    if (el.closest('header')) {
      return { location: 'header', name: 'Header CTA', category: 'Suporte Geral' };
    }

    // 3. Hero
    if (el.closest('section#sobre') || el.closest('.relative.bg-brand-dark')) {
      return { location: 'hero', name: 'Hero CTA', category: 'Suporte Geral' };
    }

    // 4. CTA Final
    if (el.closest('section.bg-brand-dark.text-white.relative.overflow-hidden')) {
      return { location: 'cta_final', name: 'CTA Final Rodapé', category: 'Suporte Geral' };
    }

    // 5. Cards de Gases
    const gasCard = el.closest('#gases-grid .group');
    if (gasCard) {
      const title = gasCard.querySelector('h3');
      return {
        location: 'card_produto',
        name: title ? title.textContent.trim() : 'Gás Industrial',
        category: 'Gases Industriais'
      };
    }

    // 6. Cards de Insumos
    const insumoCard = el.closest('#insumos-grid .group');
    if (insumoCard) {
      const title = insumoCard.querySelector('h3');
      return {
        location: 'card_produto',
        name: title ? title.textContent.trim() : 'Insumo de Solda',
        category: 'Insumos de Solda'
      };
    }

    // 7. Cards de Equipamentos
    const equipCard = el.closest('#equipamentos-grid .group');
    if (equipCard) {
      const title = equipCard.querySelector('h3');
      return {
        location: 'card_produto',
        name: title ? title.textContent.trim() : 'Máquina ou Equipamento',
        category: 'Máquinas & Equipamentos'
      };
    }

    // 8. Card de Outros Gases
    if (el.closest('#card-outro-gas')) {
      return { location: 'card_especial', name: 'Outros Gases Sob Consulta', category: 'Gases Especiais' };
    }

    // 9. Footer
    if (el.closest('footer')) {
      return { location: 'footer', name: 'Rodapé WhatsApp', category: 'Suporte Geral' };
    }

    return { location: 'outros', name: 'Link WhatsApp', category: 'Geral' };
  }

  // Delegação de cliques para WhatsApp e Links de Contato
  document.addEventListener('click', function (e) {
    const targetLink = e.target.closest('a');
    if (!targetLink) return;

    const href = targetLink.getAttribute('href') || '';

    // WhatsApp
    if (href.includes('wa.me') || href.includes('whatsapp.com')) {
      const source = identifyWhatsAppSource(targetLink);

      trackEvent('generate_lead', {
        event_category: 'Conversao WhatsApp',
        event_label: source.name,
        method: 'WhatsApp',
        button_location: source.location,
        content_name: source.name,
        content_category: source.category,
        value: 1
      });
      return;
    }

    // Telefone
    if (href.startsWith('tel:')) {
      trackEvent('contact', {
        event_category: 'Contato',
        method: 'Telefone',
        contact_target: href.replace('tel:', '')
      });
      return;
    }

    // E-mail
    if (href.startsWith('mailto:')) {
      trackEvent('contact', {
        event_category: 'Contato',
        method: 'E-mail',
        contact_target: href.replace('mailto:', '')
      });
      return;
    }

    // Instagram
    if (href.includes('instagram.com')) {
      trackEvent('social_click', {
        event_category: 'Social',
        network: 'Instagram',
        destination_url: href
      });
      return;
    }
  });

  // Expõe hook para o diagnóstico técnico
  window.tbTrackDiagnostic = function (op, mat, proc, cidade) {
    trackEvent('generate_lead', {
      event_category: 'Diagnostico Tecnico',
      event_label: `${op} - ${mat} - ${proc}`,
      method: 'Diagnostico WhatsApp',
      operation: op,
      material: mat,
      welding_process: proc,
      city: cidade,
      value: 1
    });
  };
})();
