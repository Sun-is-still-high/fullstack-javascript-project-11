const renderForm = (state, elements) => {
  const { input, feedback } = elements;

  switch (state.form.status) {
    case 'invalid':
      input.classList.add('is-invalid');
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.textContent = state.form.error;
      break;

    case 'valid':
      input.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = 'RSS успешно загружен';
      input.value = '';
      input.focus();
      break;

    default:
      break;
  }
};

const render = (state, elements) => (path) => {
  switch (path) {
    case 'form.status':
    case 'form.error':
      renderForm(state, elements);
      break;

    default:
      break;
  }
};

export default render;
