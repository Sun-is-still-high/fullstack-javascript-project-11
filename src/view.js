const renderForm = (state, elements, i18n) => {
  const { input, feedback, submitButton } = elements

  switch (state.form.status) {
    case 'sending':
      submitButton.disabled = true
      break

    case 'invalid':
      submitButton.disabled = false
      input.classList.add('is-invalid')
      feedback.classList.remove('text-success')
      feedback.classList.add('text-danger')
      feedback.textContent = i18n.t(`errors.${state.form.error}`)
      break

    case 'valid':
      submitButton.disabled = false
      input.classList.remove('is-invalid')
      feedback.classList.remove('text-danger')
      feedback.classList.add('text-success')
      feedback.textContent = i18n.t('success')
      input.value = ''
      input.focus()
      break

    default:
      break
  }
}

const renderFeeds = (state, elements, i18n) => {
  const { feedsContainer } = elements

  const card = document.createElement('div')
  card.classList.add('card', 'border-0')

  const cardBody = document.createElement('div')
  cardBody.classList.add('card-body')

  const cardTitle = document.createElement('h2')
  cardTitle.classList.add('card-title', 'h4')
  cardTitle.textContent = i18n.t('feeds')

  cardBody.appendChild(cardTitle)
  card.appendChild(cardBody)

  const listGroup = document.createElement('ul')
  listGroup.classList.add('list-group', 'border-0', 'rounded-0')

  state.feeds.forEach((feed) => {
    const li = document.createElement('li')
    li.classList.add('list-group-item', 'border-0', 'border-end-0')

    const h3 = document.createElement('h3')
    h3.classList.add('h6', 'm-0')
    h3.textContent = feed.title

    const p = document.createElement('p')
    p.classList.add('m-0', 'small', 'text-black-50')
    p.textContent = feed.description

    li.appendChild(h3)
    li.appendChild(p)
    listGroup.appendChild(li)
  })

  card.appendChild(listGroup)
  feedsContainer.innerHTML = ''
  feedsContainer.appendChild(card)
}

const renderPosts = (state, elements, i18n) => {
  const { postsContainer } = elements

  const card = document.createElement('div')
  card.classList.add('card', 'border-0')

  const cardBody = document.createElement('div')
  cardBody.classList.add('card-body')

  const cardTitle = document.createElement('h2')
  cardTitle.classList.add('card-title', 'h4')
  cardTitle.textContent = i18n.t('posts')

  cardBody.appendChild(cardTitle)
  card.appendChild(cardBody)

  const listGroup = document.createElement('ul')
  listGroup.classList.add('list-group', 'border-0', 'rounded-0')

  state.posts.forEach((post) => {
    const li = document.createElement('li')
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0')

    const a = document.createElement('a')
    a.setAttribute('href', post.link)
    a.dataset.id = post.id
    a.setAttribute('target', '_blank')
    a.setAttribute('rel', 'noopener noreferrer')
    a.textContent = post.title

    const isRead = state.ui.readPosts.has(post.id)
    a.classList.add(isRead ? 'fw-normal' : 'fw-bold')

    const button = document.createElement('button')
    button.setAttribute('type', 'button')
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm')
    button.dataset.id = post.id
    button.dataset.bsToggle = 'modal'
    button.dataset.bsTarget = '#modal'
    button.textContent = i18n.t('preview')

    li.appendChild(a)
    li.appendChild(button)
    listGroup.appendChild(li)
  })

  card.appendChild(listGroup)
  postsContainer.innerHTML = ''
  postsContainer.appendChild(card)
}

const renderModal = (state, elements) => {
  const { modalTitle, modalBody, modalLink } = elements
  const post = state.posts.find(p => p.id === state.ui.modalPostId)

  if (post) {
    modalTitle.textContent = post.title
    modalBody.textContent = post.description
    modalLink.setAttribute('href', post.link)
  }
}

const render = (state, elements, i18n) => (path) => {
  switch (path) {
    case 'form.status':
    case 'form.error':
      renderForm(state, elements, i18n)
      break

    case 'feeds':
      renderFeeds(state, elements, i18n)
      break

    case 'posts':
    case 'ui.readPosts':
      renderPosts(state, elements, i18n)
      break

    case 'ui.modalPostId':
      renderModal(state, elements)
      break

    default:
      break
  }
}

export default render
