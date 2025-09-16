(function () {
  'use strict';

  const onlyDigits = (s = '') => (s || '').toString().replace(/\D/g, '');
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  function showFeedback(form, type, message, focusEl = null) {
    let fb = form.querySelector('.feedback');
    if (!fb) {
      fb = document.createElement('div');
      fb.className = 'feedback';
      fb.setAttribute('aria-live', 'polite');
      form.appendChild(fb);
    }

    fb.textContent = message;
    fb.className = `feedback ${type}`;
    fb.style.display = 'block';

    if (focusEl) {
      focusEl.focus();
    }
  }

  function setLoading(form, state) {
    const buttons = form.querySelectorAll('button, a.btn');
    if (state) {
      form.classList.add('loading');
      form.style.cursor = 'wait';
      buttons.forEach(btn => btn.setAttribute('disabled', 'true'));
    } else {
      form.classList.remove('loading');
      form.style.cursor = 'default';
      buttons.forEach(btn => btn.removeAttribute('disabled'));
    }
  }

  function formatCep(raw) {
    const d = onlyDigits(raw).slice(0, 8);
    if (d.length <= 5) return d;
    return d.slice(0, 5) + '-' + d.slice(5);
  }

  function formatCnpj(raw) {
    const d = onlyDigits(raw).slice(0, 14);
    let v = d;
    v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');
    return v;
  }

  function setIfExists(form, idOrName, value) {
    if (!value && value !== 0) return;
    let el = form.querySelector(`#${idOrName}`);
    if (!el) el = form.querySelector(`[name="${idOrName}"]`);
    if (el) {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  async function fetchCepAndFill(form, cepRaw) {
    const cep = onlyDigits(cepRaw);
    const cepEl = form.querySelector('#cep');

    if (cep.length !== 8) {
      showFeedback(form, 'error', 'CEP inválido (deve conter 8 dígitos).', cepEl);
      return;
    }

    setLoading(form, true);
    showFeedback(form, 'info', `Buscando endereço para CEP ${cep}...`);

    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
      if (!res.ok) throw new Error(`Erro ${res.status} ao consultar o CEP`);
      const data = await res.json();

      setIfExists(form, 'logradouro', data.street || data.logradouro || '');
      setIfExists(form, 'bairro', data.neighborhood || data.bairro || '');
      setIfExists(form, 'cidade', data.city || data.localidade || '');
      setIfExists(form, 'municipio', data.city || data.localidade || '');
      setIfExists(form, 'estado', data.state || data.uf || '');
      setIfExists(form, 'uf', data.state || data.uf || '');

      showFeedback(form, 'success', 'Endereço preenchido com sucesso!');
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
      showFeedback(form, 'error', 'Erro ao buscar o CEP. Tente novamente.', cepEl);
    } finally {
      setLoading(form, false);
    }
  }

  async function fetchCnpjAndFill(form, cnpjRaw) {
    const cnpj = onlyDigits(cnpjRaw);
    const cnpjEl = form.querySelector('#cnpj');

    if (cnpj.length !== 14) {
      showFeedback(form, 'error', 'CNPJ inválido (deve conter 14 dígitos).', cnpjEl);
      return;
    }

    setLoading(form, true);
    showFeedback(form, 'info', `Buscando dados do CNPJ ${cnpj}...`);

    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!res.ok) throw new Error(`Erro ${res.status} ao consultar o CNPJ`);
      const data = await res.json();

      setIfExists(form, 'razao_social', data.razao_social || '');
      setIfExists(form, 'nome_fantasia', data.nome_fantasia || '');

      const cepFromApi = data.cep || data.estabelecimento?.cep || '';
      if (cepFromApi) {
        setIfExists(form, 'cep', formatCep(cepFromApi));
        await sleep(300);
        await fetchCepAndFill(form, cepFromApi);
      }

      showFeedback(form, 'success', 'Dados do CNPJ preenchidos com sucesso!');
    } catch (err) {
      console.error('Erro ao buscar CNPJ:', err);
      showFeedback(form, 'error', 'Erro ao buscar o CNPJ. Tente novamente.', cnpjEl);
    } finally {
      setLoading(form, false);
    }
  }

  function initForm(form) {
    const cepEl = form.querySelector('#cep');
    const cnpjEl = form.querySelector('#cnpj');

    if (cepEl) {
      cepEl.addEventListener('input', (e) => {
        const pos = e.target.selectionStart;
        e.target.value = formatCep(e.target.value);
        try { e.target.setSelectionRange(pos, pos); } catch { }
      });

      cepEl.addEventListener('change', async () => {
        const raw = onlyDigits(cepEl.value);
        if (raw.length === 8) {
          await fetchCepAndFill(form, raw);
        } else if (raw.length > 0) {
          showFeedback(form, 'error', 'CEP incompleto (8 dígitos).', cepEl);
        }
      });
    }

    if (cnpjEl) {
      cnpjEl.addEventListener('input', (e) => {
        const pos = e.target.selectionStart;
        e.target.value = formatCnpj(e.target.value);
        try { e.target.setSelectionRange(pos, pos); } catch { }
      });

      cnpjEl.addEventListener('change', async () => {
        const raw = onlyDigits(cnpjEl.value);
        if (raw.length === 14) {
          await fetchCnpjAndFill(form, raw);
        } else if (raw.length > 0) {
          showFeedback(form, 'error', 'CNPJ incompleto (14 dígitos).', cnpjEl);
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => initForm(form));
  });
})();
