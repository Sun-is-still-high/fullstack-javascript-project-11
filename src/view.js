const renderForm = (state, elements, i18n) => {
  const { input, feedback } = elements;

  switch (state.form.status) {
    case 'invalid':
      input.classList.add('is-invalid');
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.textContent = i18n.t(`errors.${state.form.error}`);
      break;

    case 'valid':
      input.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18n.t('success');
      input.value = '';
      input.focus();
      break;

    default:
      break;
  }
};

const render = (state, elements, i18n) => (path) => {
  switch (path) {
    case 'form.status':
    case 'form.error':
      renderForm(state, elements, i18n);
      break;

    default:
      break;
  }
};

export default render;
