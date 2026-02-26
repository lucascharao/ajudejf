import './style.css'
import { supabase } from './supabase.js'

// ── STATE ──
const state = {
  city: '',
  type: '',
  data: {}
}

const typeLabels = {
  abrigo:       '🏠 Abrigo',
  doacao:       '📦 Ponto de Doação',
  desaparecido: '🔍 Pessoa Desaparecida',
  alimentacao:  '🍽️ Ponto de Alimentação',
  comunidade:   '🏘️ Comunidade / Bairro',
  voluntario:   '🙋 Oferecer Ajuda'
}

// ── NAVIGATION ──
window.goStep = function (n) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'))
  document.getElementById('step-' + n).classList.add('active')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

window.selectCity = function (city) {
  state.city = city
  document.getElementById('selected-city-label').textContent = city
  document.getElementById('ctx-city').textContent = city
  goStep(2)
}

window.selectType = function (type) {
  state.type = type
  document.getElementById('ctx-type').textContent = typeLabels[type] || type

  document.querySelectorAll('.form-type').forEach(f => f.style.display = 'none')
  const form = document.getElementById('form-' + type)
  if (form) form.style.display = 'block'

  goStep(3)
}

// ── FORM SUBMIT ──
window.submitForm = async function (event, tipo) {
  event.preventDefault()
  const form = event.target
  const submitBtn = form.querySelector('[type="submit"]')

  // Loading state
  const originalText = submitBtn.innerHTML
  submitBtn.innerHTML = 'Salvando...'
  submitBtn.disabled = true

  const dados = collectFormData(form)
  state.data = dados

  // Remove error if exists
  const existingError = form.querySelector('.form-error')
  if (existingError) existingError.remove()

  const { error } = await supabase.from('registros').insert({
    cidade: state.city,
    tipo,
    dados
  })

  if (error) {
    submitBtn.innerHTML = originalText
    submitBtn.disabled = false
    const errEl = document.createElement('div')
    errEl.className = 'alert alert-warning form-error'
    errEl.style.marginTop = '16px'
    errEl.innerHTML = `<span>⚠️</span><span>Erro ao salvar: ${error.message}. Tente novamente.</span>`
    form.appendChild(errEl)
    return
  }

  // Success
  const summary = buildSummary(state.city, tipo, dados)
  document.getElementById('summary-text').textContent = summary
  goStep(4)
}

// ── COLLECT FORM DATA ──
function collectFormData(form) {
  const formData = new FormData(form)
  const data = {}
  formData.forEach((value, key) => {
    if (data[key]) {
      if (!Array.isArray(data[key])) data[key] = [data[key]]
      data[key].push(value)
    } else {
      data[key] = value
    }
  })
  return data
}

// ── BUILD SUMMARY ──
function buildSummary(city, type, data) {
  const now = new Date().toLocaleString('pt-BR')
  const lines = []
  lines.push('=== AJUDE JF — ' + (typeLabels[type] || type).toUpperCase() + ' ===')
  lines.push('📍 Cidade: ' + city)
  lines.push('📅 Data/hora: ' + now)
  lines.push('')

  const labelMap = {
    nome_local:       'Local',
    nome_pessoa:      'Nome da pessoa',
    nome:             'Nome',
    responsavel:      'Responsável',
    telefone:         'Telefone/WhatsApp',
    endereco:         'Endereço',
    vagas:            'Vagas disponíveis',
    recursos:         'Recursos disponíveis',
    animais:          'Aceita animais',
    necessidades:     'Necessidades AGORA',
    nao_precisa:      'NÃO precisa',
    prioridade:       'Prioridade',
    horario:          'Horário',
    aceita:           'O que aceita',
    pix_tipo:         'Tipo da chave PIX',
    pix_chave:        'Chave PIX',
    pix_titular:      'Titular PIX',
    refeicao:         'Tipo de refeição',
    voluntarios:      'Precisa voluntários',
    capacidade:       'Capacidade',
    familias:         'Famílias afetadas',
    descricao:        'Descrição física',
    ultima_vez:       'Última vez visto',
    local_visto:      'Local visto',
    saude:            'Condição de saúde',
    informante_nome:  'Informante',
    informante_tel:   'Tel. informante',
    relacao:          'Relação',
    idade:            'Idade',
    bairro:           'Bairro',
    veiculo:          'Veículo',
    habilidade:       'Habilidades',
    disponibilidade:  'Disponibilidade',
    obs:              'Observações'
  }

  for (const [key, val] of Object.entries(data)) {
    if (!val || val === '' || val === '— Não recebe PIX —') continue
    const label = labelMap[key] || key
    const value = Array.isArray(val) ? val.join(', ') : val
    lines.push('• ' + label + ': ' + value)
  }

  lines.push('')
  lines.push('Registrado em ajudejf.com.br')
  return lines.join('\n')
}

// ── SHARE ──
window.shareWhatsApp = function () {
  const text = document.getElementById('summary-text').textContent
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank')
}

window.copyText = function () {
  const text = document.getElementById('summary-text').textContent
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => alert('Texto copiado!'))
  } else {
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    alert('Texto copiado!')
  }
}

window.newEntry = function () {
  document.querySelectorAll('.form-type').forEach(f => {
    f.reset()
    f.style.display = 'none'
    const err = f.querySelector('.form-error')
    if (err) err.remove()
  })
  state.city = ''
  state.type = ''
  state.data = {}
  goStep(1)
}
